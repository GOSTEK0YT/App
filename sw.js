/* ==========================================================================
   BIBLIOTEKA GIER — service worker
   Jeden worker na całą bibliotekę: instalacja z ekranu wyboru wciąga do
   pamięci telefonu wszystkie gry naraz. Plików jest kilkanaście i razem
   ważą mniej niż jedno zdjęcie, więc bierzemy je wszystkie od razu.

   Po każdej zmianie w kodzie podnieś WERSJA — inaczej telefon będzie
   pokazywał starą wersję z pamięci.
   ========================================================================== */

var WERSJA = "gry-v4";

var PLIKI = [
  "./",
  "./index.html",
  "./css/hub.css",
  "./js/hub.js",
  "./wspolne/podstawa.css",
  "./wspolne/wspolne.js",
  "./manifest.webmanifest",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",

  "./piksel/",
  "./piksel/index.html",
  "./piksel/css/style.css",
  "./piksel/js/solver.js",
  "./piksel/js/generator.js",
  "./piksel/js/art.js",
  "./piksel/js/board.js",
  "./piksel/js/samouczek.js",
  "./piksel/js/app.js",

  "./bomba/",
  "./bomba/index.html",
  "./bomba/css/style.css",
  "./bomba/js/moduly.js",
  "./bomba/js/bomba.js",
  "./bomba/js/app.js"
];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(WERSJA)
      .then(function (cache) { return cache.addAll(PLIKI); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (klucze) {
      return Promise.all(klucze.map(function (k) {
        if (k !== WERSJA) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;

  /* Wejście na stronę: najpierw sieć (żeby złapać nowszą wersję),
     przy braku internetu strona z pamięci. */
  if (req.mode === "navigate") {
    ev.respondWith(
      fetch(req).then(function (odp) {
        var kopia = odp.clone();
        caches.open(WERSJA).then(function (c) { c.put(req, kopia); });
        return odp;
      }).catch(function () {
        return caches.match(req).then(function (trafienie) {
          return trafienie || caches.match("./index.html");
        });
      })
    );
    return;
  }

  /* Reszta: z pamięci od ręki, a czego nie ma — z sieci i do pamięci. */
  ev.respondWith(
    caches.match(req).then(function (trafienie) {
      if (trafienie) return trafienie;
      return fetch(req).then(function (odp) {
        if (odp && odp.status === 200 && odp.type === "basic") {
          var kopia = odp.clone();
          caches.open(WERSJA).then(function (c) { c.put(req, kopia); });
        }
        return odp;
      });
    })
  );
});
