// Unser Versteck-Name. Wenn wir etwas ändern, ändern wir auch diesen Namen (z.B. von 'v1' zu 'v2').
const CACHE_NAME = 'spion-pwa-cache-v1'; // Name ist jetzt angepasst

// Das sind die Dinge, die unser geheimer Helfer verstecken soll (ins Handy-Gedächtnis legen)
const urlsToCache = [
    '/',                       // Die Startseite
    '/index.html',             // Unser Zeichenblock
    '/style.css',              // Unser Farbkasten
    '/app.js',                 // Unser Zauberstab
    '/manifest.json',          // Unser Steckbrief
    // Und ganz wichtig: Unsere App-Bildchen!
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    // NEU: Die zusätzlichen Bilder für die Knöpfe und Rollen
    '/icons/start.png',
    '/icons/imposter.png',
    '/icons/crew.png',
    '/icons/summary.png',
    '/icons/reveal.png',
    '/icons/plus.png' // Wenn du diesen Icon auch hast
];

// Wenn der geheime Helfer sich zum ersten Mal vorbereitet
self.addEventListener('install', event => {
    console.log('[Geheimer Helfer] Bereite mich vor...');
    event.waitUntil(
        caches.open(CACHE_NAME) // Öffne unser Versteck
            .then(cache => {
                console.log('[Geheimer Helfer] Versteck ist offen, lege Sachen rein.');
                return cache.addAll(urlsToCache); // Leg all unsere wichtigen Sachen ins Versteck
            })
            .then(() => self.skipWaiting()) // Sag dem Helfer, er soll sofort loslegen
    );
});

// Wenn der geheime Helfer aktiv wird (z.B. nach der Installation oder einem Update).
self.addEventListener('activate', event => {
    console.log('[Geheimer Helfer] Bin aktiv!');
    event.waitUntil(
        caches.keys().then(cacheNames => { // Hol dir alle Namen der bestehenden Verstecke
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) { // Wenn ein Versteck alt ist und wir es nicht mehr brauchen
                        console.log('[Geheimer Helfer] Altes Versteck aufräumen:', cacheName);
                        return caches.delete(cacheName); // Räum das alte Versteck weg
                    }
                })
            );
        }).then(() => self.clients.claim()) // Übernimmt die Kontrolle über alle offenen Clients
    );
});

// Wenn die App etwas braucht (z.B. ein Bild oder Text)
self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('chrome-extension://')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request) // Versuch, das Gewünschte aus unserem Versteck zu holen
            .then(response => {
                if (response) {
                    console.log(`[Geheimer Helfer] Sache aus Versteck geholt: ${event.request.url}`);
                    return response;
                }
                console.log(`[Geheimer Helfer] Sache aus dem Internet geholt: ${event.request.url}`);
                return fetch(event.request)
                    .catch(error => {
                        console.error('[Geheimer Helfer] Konnte nicht holen:', event.request.url, error);
                    });
            })
    );
});