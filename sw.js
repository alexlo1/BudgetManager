let currentCache = {
  offline: 'offline-cache2'
};

this.addEventListener('install', event => {
  event.waitUntil(
    caches.open(currentCache.offline).then(cache => {
      return cache.addAll(['offline.html']);
    })
  );
});

this.addEventListener('fetch', event => {
  if (event.request.method === 'GET' &&
      event.request.headers.get('accept').includes('text/html') ||
      event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request.url).catch(error => {
        return caches.match('offline.html');
      })
    );
  } else {
    event.respondWith(caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
