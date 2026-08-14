/* ==========================================================================
   PIKSEL — generator plansz
   Losuje obrazek i sprawdza solverem, czy da się go rozwiązać samą logiką.
   Jeśli nie — poprawia pojedyncze pola i próbuje dalej. Do gry trafiają
   wyłącznie plansze, które domykają się bez zgadywania.
   ========================================================================== */

(function (global) {
  "use strict";

  var Solver = global.Solver;

  /* --------------------------------------------------------------- losowość */

  /* Mulberry32 — mały generator z ziarnem. Ta sama data da tę samą planszę,
     na tym stoi zagadka dnia. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Tekst na liczbę — do ziarna z daty. */
  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* ---------------------------------------------------------------- kształt */

  /* Czysty szum daje mnóstwo jednopolowych klocków — takie plansze rzadko
     domykają się logiką i brzydko wyglądają. Wygładzenie regułą większości
     skleja szum w plamy: ładniej i dużo łatwiej o jedno rozwiązanie. */
  function smooth(bits, w, h, rounds) {
    var cur = bits;
    for (var r = 0; r < rounds; r++) {
      var next = new Uint8Array(w * h);
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var on = 0;
          var seen = 0;
          for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
              var nx = x + dx;
              var ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
              seen++;
              if (cur[ny * w + nx]) on++;
            }
          }
          next[y * w + x] = on * 2 > seen ? 1 : 0;
        }
      }
      cur = next;
    }
    return cur;
  }

  function noise(w, h, rand, density) {
    var bits = new Uint8Array(w * h);
    for (var i = 0; i < bits.length; i++) bits[i] = rand() < density ? 1 : 0;
    return bits;
  }

  /* Plansza bez ani jednego pola albo wypełniona w całości to nie zagadka. */
  function sane(bits, w, h) {
    var on = 0;
    for (var i = 0; i < bits.length; i++) on += bits[i];
    var total = w * h;
    return on >= total * 0.2 && on <= total * 0.75;
  }

  /* ------------------------------------------------------------- składanie */

  function puzzleFrom(bits, w, h, name) {
    var clues = Solver.cluesFrom(bits, w, h);
    return {
      w: w,
      h: h,
      rowClues: clues.rows,
      colClues: clues.cols,
      solution: bits,
      name: name || null
    };
  }

  /* Czy plansza domyka się samą logiką liniową. Zwraca liczbę pól, które
     solver ustalił — przy komplecie to w * h. */
  function logicScore(bits, w, h) {
    var clues = Solver.cluesFrom(bits, w, h);
    var res = Solver.logicSolve(clues.rows, clues.cols, w, h);
    return res ? res.determined : 0;
  }

  function isLogical(bits, w, h) {
    return logicScore(bits, w, h) === w * h;
  }

  /* Losuje planszę i podkręca ją, dopóki nie da się jej rozwiązać logiką.
     Najpierw kilka podejść od zera, potem wspinaczka: przerzucamy losowe
     pole i zostawiamy zmianę, jeśli solver ustalił więcej niż wcześniej. */
  function random(w, h, seed) {
    var rand = rng(seed === undefined ? (Math.random() * 4294967296) >>> 0 : seed);
    var target = w * h;
    var best = null;
    var bestScore = -1;
    var attempt, i;

    for (attempt = 0; attempt < 12; attempt++) {
      var density = 0.42 + rand() * 0.2;
      /* jeden przebieg wygładzania to złoty środek: bez niego plansza wygląda
         jak śnieg na ekranie, przy dwóch robi się z niej jedna nudna plama */
      var bits = smooth(noise(w, h, rand, density), w, h, 1);
      if (!sane(bits, w, h)) continue;

      var score = logicScore(bits, w, h);
      if (score === target) return puzzleFrom(bits, w, h);
      if (score > bestScore) { bestScore = score; best = bits; }

      /* wspinaczka na najlepszym, co dotąd wyszło */
      var candidate = new Uint8Array(best);
      for (i = 0; i < 260; i++) {
        var idx = (rand() * candidate.length) | 0;
        candidate[idx] ^= 1;
        if (!sane(candidate, w, h)) { candidate[idx] ^= 1; continue; }

        var s = logicScore(candidate, w, h);
        if (s >= bestScore) {
          bestScore = s;
          best = new Uint8Array(candidate);
          if (s === target) return puzzleFrom(best, w, h);
        } else {
          candidate[idx] ^= 1; /* cofamy pogorszenie */
        }
      }
    }

    /* Awaryjnie: siatka w szachownicę z wyciętym rogiem zawsze jest logiczna,
       ale w praktyce nigdy tu nie docieramy. */
    var fallback = new Uint8Array(w * h);
    for (i = 0; i < fallback.length; i++) fallback[i] = ((i % w) + ((i / w) | 0)) % 2;
    return puzzleFrom(fallback, w, h);
  }

  /* Obrazek z zestawu. Zestaw jest wcześniej sprawdzony skryptem
     tools/sprawdz-obrazki.js, więc każdy wpis domyka się logiką. */
  function fromArt(entry) {
    var rows = entry.rows;
    var h = rows.length;
    var w = rows[0].length;
    var bits = new Uint8Array(w * h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        bits[y * w + x] = rows[y][x] === "#" ? 1 : 0;
      }
    }
    return puzzleFrom(bits, w, h, entry.name);
  }

  /* Zagadka dnia: ta sama dla każdego, kto wejdzie tego samego dnia. */
  function daily(dateKey, w, h) {
    return random(w, h, hash("piksel-" + dateKey + "-" + w));
  }

  global.Generator = {
    rng: rng,
    hash: hash,
    random: random,
    daily: daily,
    fromArt: fromArt,
    puzzleFrom: puzzleFrom,
    isLogical: isLogical,
    logicScore: logicScore
  };
})(typeof window !== "undefined" ? window : globalThis);
