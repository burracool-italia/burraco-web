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

// 28/11/2026: arrivo di una notifica. Firebase NON la mostra se una pagina del sito risulta
// "visibile", anche quando il telefono ha lo schermo bloccato con l'app lasciata in primo piano:
// il giocatore sentiva solo il suono dell'app (se la pagina era ancora viva) e non vedeva nessuna
// notifica. Qui la si mostra sempre, tranne quando la pagina e' visibile E in uso (focused): in quel
// caso basta l'avviso dell'app e si lascia fare a Firebase come prima. Le opzioni sono quelle
// mandate dal server (vibrazione, tag, resta sullo schermo...), come le passa Firebase; in "data"
// la stessa forma di Firebase (FCM_MSG), cosi' il tocco funziona come prima.
// Va registrato PRIMA di firebase.messaging(): stopImmediatePropagation ferma il suo gestore.
self.addEventListener('push', function (event) {
  var p = null;
  try { p = event.data ? event.data.json() : null; } catch (e) { p = null; }
  if (!p || !p.notification) return;          // nessuna notifica da mostrare: decide Firebase
  event.stopImmediatePropagation();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      var inUso = lista.some(function (c) {
        return c.visibilityState === 'visible' && c.focused && c.url.indexOf('/burraco-web/') >= 0;
      });
      if (inUso) {
        // come Firebase: il messaggio passa alla pagina aperta, niente notifica
        p.isFirebaseMessaging = true;
        p.messageType = 'push-received';
        lista.forEach(function (c) { c.postMessage(p); });
        return;
      }
      var opzioni = Object.assign({}, p.notification);
      opzioni.data = { FCM_MSG: p };
      if (!opzioni.tag) delete opzioni.renotify;  // senza tag Chrome rifiuta renotify
      return self.registration.showNotification(p.notification.title || 'Burraco', opzioni);
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
