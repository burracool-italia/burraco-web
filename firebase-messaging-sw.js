// Service worker delle notifiche (versione web). Riceve le notifiche anche a pagina chiusa.
// NB: quello che i telefoni usano davvero e' la COPIA alla radice del dominio (repository
// burracool-italia/burracool-italia.github.io): Firebase lo registra li'. Tenerle uguali.

// Toccando la notifica si riporta in primo piano l'app gia' aperta (versione normale o pro),
// altrimenti si apre la versione normale.
// 24/11/2026: va registrato PRIMA di firebase.messaging(). Il gestore di Firebase, registrato dopo,
// per le notifiche senza link chiudeva la notifica e fermava gli altri gestori
// (stopImmediatePropagation): toccando la notifica non si apriva niente.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.stopImmediatePropagation();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      const app = lista.filter(function (c) { return c.url.indexOf('/burraco-web/') >= 0; });
      for (const c of app) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/burraco-web/');
    })
  );
});

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD4154B1UkaJrO3qwrJZxr_pWITCa7Fh_4',
  authDomain: 'gestionale-burraco-30ef8.firebaseapp.com',
  projectId: 'gestionale-burraco-30ef8',
  storageBucket: 'gestionale-burraco-30ef8.firebasestorage.app',
  messagingSenderId: '313151671762',
  appId: '1:313151671762:web:5313cdc183d136fcd08c0b',
});

// Con il messaggio "notification" inviato dal server, il browser mostra da solo la notifica.
firebase.messaging();
