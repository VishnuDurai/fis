import express from 'express';
import webPush from 'web-push';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Configure VAPID Keys
// Default persistent VAPID keys for SREC FIS Portal
const DEFAULT_VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BCc5p-9g5eS9lJmZ4Y-cE48G6Y3kU1Q7I4k_R-QGzF4eO3w3C-t0G-N0lA0z4wE6uH8q0rO6uM8h0_L5n7g8_kQ';
const DEFAULT_VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'N2p5-rU3G-Y8v_W0mR4k-lQ2b_M4sE6tU8oV-wP0y_M';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:fis-admin@srec.ac.in';

let vapidPublicKey = DEFAULT_VAPID_PUBLIC_KEY;
let vapidPrivateKey = DEFAULT_VAPID_PRIVATE_KEY;

try {
  webPush.setVapidDetails(VAPID_SUBJECT, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  // If invalid, generate a fresh valid pair
  const newKeys = webPush.generateVAPIDKeys();
  vapidPublicKey = newKeys.publicKey;
  vapidPrivateKey = newKeys.privateKey;
  webPush.setVapidDetails(VAPID_SUBJECT, vapidPublicKey, vapidPrivateKey);
  console.log('Generated fresh VAPID Keys for Web Push.');
}

/**
 * GET /api/notifications/vapid-public-key
 * Returns VAPID Public Key for service worker subscription
 */
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidPublicKey });
});

/**
 * POST /api/notifications/subscribe
 * Registers or updates a client browser push subscription
 */
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription, userAgent } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid push subscription object' });
    }

    const staffId = req.user.staffId || req.user.username;
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Check if endpoint exists, update or insert
    const [existing] = await pool.query('SELECT id FROM staff_push_subscriptions WHERE endpoint = ?', [endpoint]);
    if (existing.length > 0) {
      await pool.query(
        'UPDATE staff_push_subscriptions SET staff_id = ?, p256dh = ?, auth = ?, user_agent = ? WHERE endpoint = ?',
        [staffId, p256dh, auth, userAgent || '', endpoint]
      );
    } else {
      await pool.query(
        'INSERT INTO staff_push_subscriptions (staff_id, endpoint, p256dh, auth, user_agent) VALUES (?, ?, ?, ?, ?)',
        [staffId, endpoint, p256dh, auth, userAgent || '']
      );
    }

    res.json({ success: true, message: 'Web Push subscription registered successfully.' });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ error: 'Failed to register push subscription' });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Removes a push subscription
 */
router.post('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await pool.query('DELETE FROM staff_push_subscriptions WHERE endpoint = ?', [endpoint]);
    }
    res.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

/**
 * POST /api/notifications/test-push
 * Dispatches a test notification to verify delivery
 */
router.post('/test-push', authenticateToken, async (req, res) => {
  try {
    const staffId = req.user.staffId || req.user.username;
    const result = await sendPushNotification(staffId, {
      title: '🔔 SREC FIS Notification Test',
      body: 'Web Push Notifications are working perfectly! You will receive instant updates for appraisals and announcements.',
      url: '/appraisal',
      tag: 'test-notification'
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending test push:', error);
    res.status(500).json({ error: 'Failed to send test push notification' });
  }
});

/**
 * Core Helper: Send Web Push Notification to target staff IDs or roles
 * @param {string|string[]} targets - Single staffId, array of staffIds, or 'ALL'
 * @param {object} payload - Notification payload { title, body, url, tag, data }
 */
export async function sendPushNotification(targets, payload) {
  try {
    let query = '';
    let params = [];

    if (!targets || targets === 'ALL') {
      query = 'SELECT * FROM staff_push_subscriptions';
    } else if (Array.isArray(targets)) {
      if (targets.length === 0) return { sent: 0 };
      query = `SELECT * FROM staff_push_subscriptions WHERE staff_id IN (${targets.map(() => '?').join(',')})`;
      params = targets;
    } else {
      query = 'SELECT * FROM staff_push_subscriptions WHERE staff_id = ?';
      params = [targets];
    }

    const [subscriptions] = await pool.query(query, params);
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, reason: 'No active subscriptions found for target(s)' };
    }

    const pushPayload = JSON.stringify({
      title: payload.title || 'SREC FIS Notification',
      body: payload.body || 'You have a new update in FIS Portal.',
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/favicon.png',
      url: payload.url || '/',
      tag: payload.tag || 'fis-alert-' + Date.now(),
      data: payload.data || {}
    });

    let successCount = 0;
    const staleEndpoints = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webPush.sendNotification(pushSubscription, pushPayload);
          successCount++;
        } catch (err) {
          // If subscription has expired or unsubscribed on browser side
          if (err.statusCode === 404 || err.statusCode === 410) {
            staleEndpoints.push(sub.endpoint);
          } else {
            console.warn('Push dispatch error for sub id ' + sub.id + ':', err.message);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (staleEndpoints.length > 0) {
      const placeholders = staleEndpoints.map(() => '?').join(',');
      await pool.query(`DELETE FROM staff_push_subscriptions WHERE endpoint IN (${placeholders})`, staleEndpoints);
    }

    return { sent: successCount, total: subscriptions.length, cleaned: staleEndpoints.length };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { sent: 0, error: error.message };
  }
}

export default router;
