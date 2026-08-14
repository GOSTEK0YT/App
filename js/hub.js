/* ==========================================================================
   BIBLIOTEKA GIER — ekran wyboru
   Przełączniki motywu i dźwięku plus rejestracja service workera,
   który wciąga do pamięci telefonu obie gry naraz.
   ========================================================================== */

(function () {
  "use strict";

  Motyw.podepnij(document.getElementById("themeBtn"));
  Dzwiek.podepnij(document.getElementById("soundBtn"));

  var stan = document.getElementById("stanOffline");

  function pisz(tekst, gotowe) {
    if (!stan) return;
    stan.textContent = tekst;
    stan.classList.toggle("is-ok", !!gotowe);
  }

  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    pisz("Tryb offline wymaga adresu https");
    return;
  }

  navigator.serviceWorker.register("sw.js").then(function (rej) {
    if (navigator.serviceWorker.controller) {
      pisz("Gotowe do gry bez internetu", true);
    } else {
      pisz("Pobieram gry do pamięci telefonu…");
      rej.addEventListener("updatefound", function () {
        var nowy = rej.installing;
        if (!nowy) return;
        nowy.addEventListener("statechange", function () {
          if (nowy.state === "activated" || nowy.state === "installed") {
            pisz("Gotowe do gry bez internetu", true);
          }
        });
      });
    }
  }).catch(function () {
    pisz("Nie udało się przygotować trybu offline");
  });
})();
