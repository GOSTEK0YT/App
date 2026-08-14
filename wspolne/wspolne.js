/* ==========================================================================
   BIBLIOTEKA GIER — wspólne narzędzia
   Trzy drobiazgi, których potrzebuje każda gra: pamięć, motyw i dźwięk.
   Ustawienia są wspólne dla całej biblioteki — motyw przełączony w jednej
   grze obowiązuje też w pozostałych.
   ========================================================================== */

(function (global) {
  "use strict";

  /* ----------------------------------------------------------- pamięć */

  var Pamiec = {
    czytaj: function (klucz, awaryjnie) {
      try {
        var surowe = global.localStorage.getItem(klucz);
        return surowe ? JSON.parse(surowe) : awaryjnie;
      } catch (e) {
        return awaryjnie;
      }
    },
    zapisz: function (klucz, wartosc) {
      try {
        global.localStorage.setItem(klucz, JSON.stringify(wartosc));
      } catch (e) { /* tryb prywatny albo brak miejsca — gra ma działać dalej */ }
    },
    skasuj: function (klucz) {
      try { global.localStorage.removeItem(klucz); } catch (e) { /* nic */ }
    }
  };

  /* ------------------------------------------------------------ motyw */

  var KLUCZ_MOTYW = "gry-motyw";
  var korzen = document.documentElement;
  var pytanieOCiemny = global.matchMedia("(prefers-color-scheme: dark)");

  var zapisany = Pamiec.czytaj(KLUCZ_MOTYW, null);
  if (zapisany === "dark" || zapisany === "light") {
    korzen.setAttribute("data-theme", zapisany);
  }

  var sluchacze = [];

  var Motyw = {
    ciemny: function () {
      var wymuszony = korzen.getAttribute("data-theme");
      if (wymuszony === "dark") return true;
      if (wymuszony === "light") return false;
      return pytanieOCiemny.matches;
    },

    przelacz: function () {
      var nowy = Motyw.ciemny() ? "light" : "dark";
      korzen.setAttribute("data-theme", nowy);
      Pamiec.zapisz(KLUCZ_MOTYW, nowy);
      Motyw.odswiez();
    },

    /* Podpina plakietkę przełącznika: sam ustawia stan i podpis. */
    podepnij: function (przycisk) {
      if (!przycisk) return;
      przycisk.addEventListener("click", function () {
        Motyw.przelacz();
        Dzwiek.zagraj(Motyw.ciemny() ? 440 : 660, 60);
      });
      sluchacze.push(function () {
        var ciemny = Motyw.ciemny();
        przycisk.setAttribute("aria-pressed", ciemny ? "true" : "false");
        var podpis = przycisk.querySelector(".chip__txt");
        if (podpis) podpis.textContent = ciemny ? "Ciemny" : "Jasny";
      });
      Motyw.odswiez();
    },

    /* Gry dopisują tu przerysowanie tego, co same malują na canvasie. */
    naZmiane: function (fn) { sluchacze.push(fn); },

    odswiez: function () {
      for (var i = 0; i < sluchacze.length; i++) sluchacze[i]();
    }
  };

  pytanieOCiemny.addEventListener("change", function () { Motyw.odswiez(); });

  /* ----------------------------------------------------------- dźwięk */

  var KLUCZ_DZWIEK = "gry-dzwiek";
  var kontekst = null;

  var Dzwiek = {
    wlaczony: Pamiec.czytaj(KLUCZ_DZWIEK, true) !== false,

    przelacz: function () {
      Dzwiek.wlaczony = !Dzwiek.wlaczony;
      Pamiec.zapisz(KLUCZ_DZWIEK, Dzwiek.wlaczony);
      return Dzwiek.wlaczony;
    },

    podepnij: function (przycisk) {
      if (!przycisk) return;
      function odswiez() {
        przycisk.setAttribute("aria-pressed", Dzwiek.wlaczony ? "true" : "false");
        var podpis = przycisk.querySelector(".chip__txt");
        if (podpis) podpis.textContent = Dzwiek.wlaczony ? "Dźwięk" : "Cisza";
      }
      przycisk.addEventListener("click", function () {
        Dzwiek.przelacz();
        odswiez();
        Dzwiek.zagraj(Dzwiek.wlaczony ? 660 : 440, 60);
      });
      odswiez();
    },

    /* Prosty ton. iOS budzi dźwięk dopiero po pierwszym geście gracza,
       dlatego przy każdym odtworzeniu próbujemy odwiesić kontekst. */
    zagraj: function (czestotliwosc, ms, glosnosc, ksztalt) {
      if (!Dzwiek.wlaczony) return;
      try {
        if (!kontekst) {
          var Ctx = global.AudioContext || global.webkitAudioContext;
          if (!Ctx) return;
          kontekst = new Ctx();
        }
        if (kontekst.state === "suspended") kontekst.resume();

        var teraz = kontekst.currentTime;
        var osc = kontekst.createOscillator();
        var wzmocnienie = kontekst.createGain();
        osc.type = ksztalt || "sine";
        osc.frequency.setValueAtTime(czestotliwosc, teraz);
        wzmocnienie.gain.setValueAtTime(0, teraz);
        wzmocnienie.gain.linearRampToValueAtTime(glosnosc || 0.05, teraz + 0.008);
        wzmocnienie.gain.exponentialRampToValueAtTime(0.0001, teraz + ms / 1000);
        osc.connect(wzmocnienie);
        wzmocnienie.connect(kontekst.destination);
        osc.start(teraz);
        osc.stop(teraz + ms / 1000 + 0.02);
      } catch (e) { /* dźwięk to dodatek, nigdy nie może wywalić gry */ }
    },

    /* Krótki szum — wybuch, błąd, przeciągnięcie zapałki. */
    szum: function (ms, glosnosc) {
      if (!Dzwiek.wlaczony) return;
      try {
        if (!kontekst) {
          var Ctx = global.AudioContext || global.webkitAudioContext;
          if (!Ctx) return;
          kontekst = new Ctx();
        }
        if (kontekst.state === "suspended") kontekst.resume();

        var probki = Math.floor(kontekst.sampleRate * ms / 1000);
        var bufor = kontekst.createBuffer(1, probki, kontekst.sampleRate);
        var dane = bufor.getChannelData(0);
        for (var i = 0; i < probki; i++) {
          dane[i] = (Math.random() * 2 - 1) * (1 - i / probki);
        }
        var zrodlo = kontekst.createBufferSource();
        var wzmocnienie = kontekst.createGain();
        zrodlo.buffer = bufor;
        wzmocnienie.gain.setValueAtTime(glosnosc || 0.18, kontekst.currentTime);
        zrodlo.connect(wzmocnienie);
        wzmocnienie.connect(kontekst.destination);
        zrodlo.start();
      } catch (e) { /* jak wyżej */ }
    }
  };

  /* --------------------------------------------------------- dymek */

  var dymekTimer = null;

  function powiedz(tekst, ms) {
    var dymek = document.getElementById("toast");
    if (!dymek) return;
    dymek.textContent = tekst;
    dymek.classList.add("is-on");
    clearTimeout(dymekTimer);
    dymekTimer = setTimeout(function () {
      dymek.classList.remove("is-on");
    }, ms || 2200);
  }

  global.Pamiec = Pamiec;
  global.Motyw = Motyw;
  global.Dzwiek = Dzwiek;
  global.powiedz = powiedz;
})(window);
