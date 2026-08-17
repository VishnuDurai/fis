// SREC FIS PWA Web Push Service Worker Extension

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'SREC FIS Portal Alert';
    const options = {
      body: data.body || 'You have received a new update in the FIS Portal.',
      icon: data.icon || '/pwa-192x192.png',
      badge: data.badge || '/favicon.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'srec-fis-notification',
      renotify: true,
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        { action: 'open', title: '👁️ Open Portal' },
        { action: 'close', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
