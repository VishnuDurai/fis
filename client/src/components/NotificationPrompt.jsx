import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, AlertCircle, Send, X, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPrompt({ isOpen, onClose }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (e) {
      console.warn('Error checking push subscription:', e);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setErrorMessage('Notification permission was denied. Please allow notifications in your browser address bar.');
        setLoading(false);
        return;
      }

      // Fetch VAPID Public Key
      const keyRes = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
      const { publicKey } = await keyRes.json();

      if (!publicKey) {
        throw new Error('VAPID public key not found on server.');
      }

      // Ensure ServiceWorker is ready / registered
      let registration;
      if (navigator.serviceWorker.controller) {
        registration = await navigator.serviceWorker.ready;
      } else {
        await navigator.serviceWorker.register('/sw.js');
        registration = await navigator.serviceWorker.ready;
      }

      // Unsubscribe any stale previous subscription to ensure clean key sync
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        try {
          await subscription.unsubscribe();
        } catch (unsubErr) {
          console.warn('Error clearing old subscription:', unsubErr);
        }
      }

      // Subscribe with verified VAPID applicationServerKey
      const appKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appKey
      });

      // Send subscription to backend
      const token = localStorage.getItem('srec_token') || localStorage.getItem('token');
      const subRes = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent
        })
      });

      if (!subRes.ok) {
        throw new Error('Failed to register subscription on server.');
      }

      setIsSubscribed(true);
      setTestStatus({ success: true, message: 'Push notifications enabled successfully!' });
    } catch (err) {
      console.error('Push subscribe error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('push service error') || msg.toLowerCase().includes('registration failed')) {
        setErrorMessage('Push Service Error: If using Brave browser, please enable "Use Google services for push messaging" in brave://settings/privacy to allow browser push alerts.');
      } else {
        setErrorMessage(msg || 'Failed to enable push notifications.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        const token = localStorage.getItem('srec_token') || localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setIsSubscribed(false);
      setTestStatus(null);
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setErrorMessage('Failed to disable notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setLoading(true);
    setTestStatus(null);
    try {
      const token = localStorage.getItem('srec_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/test-push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({ success: true, message: 'Test notification sent! Check your notification center or mobile screen.' });
      } else {
        throw new Error(data.error || 'Failed to send test push');
      }
    } catch (err) {
      setTestStatus({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        animation: 'fadeInUp 0.25s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f331f 0%, #15583b 100%)',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <BellRing size={24} style={{ color: '#86efac' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Web Push Notifications
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#bbf7d0' }}>
                Instant browser & mobile alerts for appraisals & circulars
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.85
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {!isSupported ? (
            <div style={{
              padding: '16px',
              backgroundColor: '#fff1f2',
              borderRadius: '12px',
              border: '1px solid #fecdd3',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <AlertCircle size={22} color="#e11d48" />
              <div style={{ fontSize: '0.88rem', color: '#9f1239' }}>
                Web Push notifications are not supported on this browser or platform. Try Chrome, Edge, or Safari on iOS 16.4+.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Status Badge Card */}
              <div style={{
                padding: '16px',
                backgroundColor: isSubscribed ? '#f0fdf4' : (permission === 'denied' ? '#fff1f2' : '#f8fafc'),
                borderRadius: '14px',
                border: `1px solid ${isSubscribed ? '#bbf7d0' : (permission === 'denied' ? '#fecdd3' : '#e2e8f0')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isSubscribed ? (
                    <CheckCircle2 size={20} color="#16a34a" />
                  ) : permission === 'denied' ? (
                    <BellOff size={20} color="#dc2626" />
                  ) : (
                    <Bell size={20} color="#64748b" />
                  )}
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                      {isSubscribed ? 'Notifications Active' : (permission === 'denied' ? 'Notifications Blocked' : 'Notifications Inactive')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {isSubscribed
                        ? 'Device is enrolled for instant push alerts'
                        : (permission === 'denied' ? 'Unblock notifications in browser site settings' : 'Enable to receive real-time updates')}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: isSubscribed ? '#dcfce7' : (permission === 'denied' ? '#fee2e2' : '#e2e8f0'),
                  color: isSubscribed ? '#15803d' : (permission === 'denied' ? '#b91c1c' : '#475569')
                }}>
                  {isSubscribed ? 'Active' : (permission === 'denied' ? 'Blocked' : 'Off')}
                </span>
              </div>

              {/* Notification Benefits Bullet Points */}
              <div style={{
                fontSize: '0.83rem',
                color: '#475569',
                lineHeight: '1.55',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: '#f8fafc',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #edf2f7'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#15583b" />
                  <span><strong>Appraisal Alerts:</strong> Real-time approval notices & remarks.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#15583b" />
                  <span><strong>Zero Cost:</strong> Delivered directly to phone or PC with 0 SMS fees.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#15583b" />
                  <span><strong>Background Delivery:</strong> Alerts arrive even when the tab is closed.</span>
                </div>
              </div>

              {/* Messages / Alerts */}
              {errorMessage && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '10px',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {testStatus && (
                <div style={{
                  padding: '12px',
                  backgroundColor: testStatus.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${testStatus.success ? '#86efac' : '#f87171'}`,
                  borderRadius: '10px',
                  color: testStatus.success ? '#166534' : '#991b1b',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {testStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{testStatus.message}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {!isSubscribed ? (
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || permission === 'denied'}
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      backgroundColor: permission === 'denied' ? '#cbd5e1' : '#15583b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: permission === 'denied' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: permission === 'denied' ? 'none' : '0 4px 12px rgba(21, 88, 59, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <BellRing size={18} />
                    {loading ? 'Enrolling Device...' : 'Enable Instant Push Notifications'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleSendTestPush}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: '#0369a1',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(3, 105, 161, 0.2)'
                      }}
                    >
                      <Send size={16} />
                      {loading ? 'Sending...' : 'Send Test Notification'}
                    </button>
                    <button
                      onClick={handleUnsubscribe}
                      disabled={loading}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Disable
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
