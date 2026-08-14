/* ==========================================================================
   BOMBA — składanie ładunku i lista poziomów
   Numer seryjny, wskaźniki i baterie nie są ozdobą: od nich zależą
   odpowiedzi w kilku modułach, więc muszą być widoczne przez całą grę.
   ========================================================================== */

(function (global) {
  "use strict";

  var Moduly = global.Moduly;

  var ZNAKI = "ABCDEFGHIJKLMNOPRSTUWXYZ0123456789";
  var CYFRY = "0123456789";
  var SAMOGLOSKI = "AEIOUY";
  var WSKAZNIKI = ["FRK", "CAR", "SND", "CLR", "MSA", "NSA"];

  var POZIOMY = [
    {
      nazwa: "Rozgrzewka",
      opis: "Dwa moduły, pięć minut. Na spokojnie poczytaj instrukcję.",
      moduly: ["przewody", "przycisk"],
      czas: 300,
      bledy: 3
    },
    {
      nazwa: "Trzy kroki",
      opis: "Dochodzi klawiatura symboli.",
      moduly: ["przewody", "klawiatura", "przycisk"],
      czas: 270,
      bledy: 3
    },
    {
      nazwa: "Pod presją",
      opis: "Cztery moduły i coraz mniej czasu na czytanie.",
      moduly: ["przycisk", "sekwencja", "przewody", "haslo"],
      czas: 240,
      bledy: 3
    },
    {
      nazwa: "Ostrożnie",
      opis: "Wszystkie pięć modułów. Zasady trzeba już mieć w głowie.",
      moduly: ["klawiatura", "przewody", "sekwencja", "przycisk", "haslo"],
      czas: 210,
      bledy: 3
    },
    {
      nazwa: "Finał",
      opis: "Trzy minuty, dwie pomyłki, kolejność losowa.",
      moduly: null,          /* losowane przy starcie */
      czas: 180,
      bledy: 2
    }
  ];

  function losowyZnak(pula, los) {
    return pula[Math.floor(los() * pula.length)];
  }

  function numerSeryjny(los) {
    var s = "";
    for (var i = 0; i < 5; i++) s += losowyZnak(ZNAKI, los);
    s += losowyZnak(CYFRY, los);   /* ostatni znak zawsze cyfra — zasady na tym stoją */
    return s;
  }

  function maSamogloske(seria) {
    for (var i = 0; i < seria.length; i++) {
      if (SAMOGLOSKI.indexOf(seria[i]) >= 0) return true;
    }
    return false;
  }

  /* Składa komplet: dane ładunku plus wylosowane moduły. */
  function utworz(poziom, los) {
    los = los || Math.random;

    var seria = numerSeryjny(los);
    var ostatnia = parseInt(seria[seria.length - 1], 10);

    var zapalone = [];
    var pula = WSKAZNIKI.slice();
    var ileWskaznikow = Math.floor(los() * 3);      /* 0–2 */
    for (var i = 0; i < ileWskaznikow; i++) {
      zapalone.push(pula.splice(Math.floor(los() * pula.length), 1)[0]);
    }

    var bomba = {
      seria: seria,
      ostatniaCyfra: ostatnia,
      ostatniaNieparzysta: ostatnia % 2 === 1,
      maSamogloske: maSamogloske(seria),
      wskazniki: zapalone,
      baterie: Math.floor(los() * 5),                /* 0–4 */
      moduly: []
    };

    var typy = poziom.moduly;
    if (!typy) {
      typy = ["przewody", "przycisk", "klawiatura", "sekwencja", "haslo"]
        .sort(function () { return los() - 0.5; });
    }

    typy.forEach(function (typ) {
      var definicja = Moduly[typ];
      var dane = definicja.utworz(bomba, los);

      /* Hasło potrafi nie znaleźć układu z jedynym rozwiązaniem.
         Zamiast psuć poziom, podmieniamy moduł na przewody. */
      if (!dane) {
        typ = "przewody";
        definicja = Moduly.przewody;
        dane = definicja.utworz(bomba, los);
      }

      bomba.moduly.push({
        typ: typ,
        nazwa: definicja.nazwa,
        krotko: definicja.krotko,
        dane: dane,
        rozwiazany: false
      });
    });

    return bomba;
  }

  global.Ladunek = {
    POZIOMY: POZIOMY,
    WSKAZNIKI: WSKAZNIKI,
    utworz: utworz,
    maSamogloske: maSamogloske
  };
})(typeof window !== "undefined" ? window : globalThis);
