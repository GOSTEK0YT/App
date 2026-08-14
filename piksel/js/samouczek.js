/* ==========================================================================
   PIKSEL — samouczek
   Pięć kroków na jednej, z góry ustalonej planszy. Każdy krok czeka, aż
   gracz naprawdę wykona ruch — nie da się go przeklikać, więc po wyjściu
   z samouczka zasady faktycznie siedzą w głowie.

   Krok opisuje: co powiedzieć, co podświetlić i jak sprawdzić, że zrobione.
   ========================================================================== */

(function (global) {
  "use strict";

  var FILL = 1;
  var MARK = 2;

  /* Strzałka — mała plansza, w której każdy krok samouczka ma sens.
     Opisy wierszy: 1 / 3 / 5 / 1 / 1, kolumn: 1 / 2 / 5 / 2 / 1. */
  var PLANSZA = [
    "..#..",
    ".###.",
    "#####",
    "..#..",
    "..#.."
  ];

  var W = 5;

  function pole(x, y) { return y * W + x; }

  /* Czy wszystkie wskazane pola mają dany stan. */
  function wszystkie(stan, pola, wartosc) {
    for (var i = 0; i < pola.length; i++) {
      if (stan[pola[i]] !== wartosc) return false;
    }
    return true;
  }

  function wiersz(y, xs) {
    return xs.map(function (x) { return pole(x, y); });
  }
  function kolumna(x, ys) {
    return ys.map(function (y) { return pole(x, y); });
  }

  var KROKI = [
    {
      tytul: "Liczby to ciągi zamalowanych pól",
      tresc: "Opis przy wierszu mówi, ile pól pod rząd jest w nim zamalowanych. " +
             "Trzeci wiersz ma opis <b>5</b> — czyli całe pięć pól. " +
             "Przeciągnij palcem przez cały ten wiersz.",
      podswietl: { typ: "wiersz", nr: 2 },
      zrobione: function (stan) { return wszystkie(stan, wiersz(2, [0, 1, 2, 3, 4]), FILL); }
    },
    {
      tytul: "W pionie tak samo",
      tresc: "Środkowa kolumna też ma opis <b>5</b>. Przeciągnij po niej z góry na dół. " +
             "Pociągnięcie samo trzyma się jednej linii, więc nie zjedziesz na ukos.",
      podswietl: { typ: "kolumna", nr: 2 },
      zrobione: function (stan) { return wszystkie(stan, kolumna(2, [0, 1, 2, 3, 4]), FILL); }
    },
    {
      tytul: "Krzyżyk to notatka",
      tresc: "Opisy, które już się zgadzają, zrobiły się szare — to twój licznik postępu.<br><br>" +
             "Pierwszy wiersz ma opis <b>1</b>, a to jedno pole już stoi na środku. " +
             "Reszta wiersza na pewno zostanie pusta. Wciśnij <b>Odrzuć</b> na dole " +
             "i oznacz cztery pozostałe pola pierwszego wiersza.",
      podswietl: { typ: "wiersz", nr: 0 },
      zrobione: function (stan) { return wszystkie(stan, wiersz(0, [0, 1, 3, 4]), MARK); }
    },
    {
      tytul: "Teraz wydedukuj",
      tresc: "Wróć na <b>Maluj</b>. Drugi wiersz ma opis <b>3</b> — trzy pola pod rząd. " +
             "Środkowe już jest zamalowane, a trójka zmieści się tam tylko na jeden sposób. " +
             "Zamaluj pola od drugiego do czwartego.",
      podswietl: { typ: "wiersz", nr: 1 },
      zrobione: function (stan) { return wszystkie(stan, wiersz(1, [1, 2, 3]), FILL); }
    }
  ];

  function planszaJakoBity() {
    var bity = new Uint8Array(W * W);
    for (var y = 0; y < W; y++) {
      for (var x = 0; x < W; x++) {
        bity[pole(x, y)] = PLANSZA[y][x] === "#" ? 1 : 0;
      }
    }
    return bity;
  }

  global.Samouczek = {
    KROKI: KROKI,
    W: W,
    planszaJakoBity: planszaJakoBity,

    /* Krok, w którym gracz aktualnie jest — pierwszy niezrobiony. */
    krokDla: function (stan) {
      for (var i = 0; i < KROKI.length; i++) {
        if (!KROKI[i].zrobione(stan)) return i;
      }
      return KROKI.length;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
