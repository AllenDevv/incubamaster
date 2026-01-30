const CACHE_NAME = 'incubamaster-v4'; 
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

let userBatches = [];

self.addEventListener('message', event => {
    if (event.data.type === 'SYNC_BATCHES') {
        userBatches = event.data.batches;
        checkBatches();
    }
});

function checkBatches() {
    const today = new Date();
    today.setHours(0,0,0,0);

    userBatches.forEach(b => {
        const start = new Date(b.startDate + 'T00:00:00');
        const diff = Math.floor((today - start) / (1000*60*60*24));
        const day = diff + 1;
        const left = b.totalDays - diff;

        // --- LÓGICA DE NOTIFICAÇÕES ---
        
        if (day === 7 || day === 14) {
            sendNotify(`🔍 Ovoscopia: ${b.name}`, `Dia ${day}: Hora de verificar o desenvolvimento dos ovos.`);
        } 
        else if (left === 3) {
            sendNotify(`💧 Umidade: ${b.name}`, `Faltam 3 dias! Aumente a umidade e pare a viragem.`);
        } 
        // NOVO ALERTA ADICIONADO ABAIXO:
        else if (left === 1) {
            sendNotify(`🐣 Quase lá: ${b.name}`, `Falta apenas 1 dia para a eclosão! Prepare o berçário.`);
        } 
        else if (left === 0) {
            sendNotify(`🐥 Eclosão: ${b.name}`, `Chegou o grande dia! Verifique o nascimento.`);
        }
    });
}

function sendNotify(title, body) {
    if (Notification.permission === 'granted') {
        self.registration.showNotification(title, {
            body: body,
            icon: 'icon.png', 
            badge: 'icon.png', 
            vibrate: [200, 100, 200],
            tag: title + body 
        });
    }
}

// Verifica a cada 1 hora
setInterval(checkBatches, 3600000);