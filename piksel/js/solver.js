/* ==========================================================================
   PIKSEL — solver nonogramów
   Rozwiązuje planszę wyłącznie logiką liniową: dla każdej linii sprawdza,
   które pola mają ten sam stan we wszystkich dopuszczalnych ułożeniach.
   Jeśli tą metodą plansza domyka się do końca, rozwiązanie jest jedyne
   i gracz nigdy nie musi zgadywać.
   Bez zależności zewnętrznych.
   ========================================================================== */

(function (global) {
  "use strict";

  var UNKNOWN = 0;
  var FILL = 1;
  var EMPTY = 2;

  /* Ułożenia liczy się w kółko dla tych samych opisów, więc trzymamy je
     w pamięci. Klucz to długość linii i opis. */
  var cache = Object.create(null);

  /* Wszystkie ułożenia klocków `clues` w linii długości `len`.
     Każde ułożenie to maska bitowa — bit i oznacza wypełnione pole i.
     Linie dłuższe niż 30 pól nie wchodzą w grę (maska to zwykły int). */
  function arrangements(clues, len) {
    var key = len + ":" + clues.join(",");
    var hit = cache[key];
    if (hit) return hit;

    var out = [];
    var n = clues.length;

    /* Klocek `idx` stawiamy na każdej dozwolonej pozycji, resztę rekurencyjnie.
       `from` to pierwsze wolne pole (po poprzednim klocku i przerwie). */
    function place(idx, from, mask) {
      if (idx === n) {
        out.push(mask);
        return;
      }
      /* ile miejsca muszą zająć klocki od idx do końca, razem z przerwami */
      var rest = -1;
      for (var i = idx; i < n; i++) rest += clues[i] + 1;

      var last = len - rest;
      for (var start = from; start <= last; start++) {
        var m = mask;
        for (var k = 0; k < clues[idx]; k++) m |= 1 << (start + k);
        place(idx + 1, start + clues[idx] + 1, m);
      }
    }
    place(0, 0, 0);

    cache[key] = out;
    return out;
  }

  /* Zwęża jedną linię. Dostaje aktualne stany pól i opis, zwraca nowe stany
     albo null, gdy opis nie da się pogodzić z tym, co już stoi na planszy. */
  function solveLine(cells, clues) {
    var len = cells.length;
    var all = arrangements(clues, len);
    var andFill = -1;   /* bity zapalone we wszystkich pasujących ułożeniach */
    var andEmpty = -1;  /* bity zgaszone we wszystkich pasujących ułożeniach */
    var any = false;
    var i, a;

    for (a = 0; a < all.length; a++) {
      var m = all[a];
      var ok = true;
      for (i = 0; i < len; i++) {
        var c = cells[i];
        if (c === UNKNOWN) continue;
        var filled = ((m >> i) & 1) === 1;
        if ((c === FILL) !== filled) { ok = false; break; }
      }
      if (!ok) continue;
      any = true;
      andFill &= m;
      andEmpty &= ~m;
    }

    if (!any) return null;

    var res = new Uint8Array(cells);
    for (i = 0; i < len; i++) {
      if (res[i] !== UNKNOWN) continue;
      if ((andFill >> i) & 1) res[i] = FILL;
      else if ((andEmpty >> i) & 1) res[i] = EMPTY;
    }
    return res;
  }

  /* Przechodzi wiersze i kolumny w kółko, dopóki cokolwiek przybywa.
     Zwraca { solved, grid, determined } albo null przy sprzeczności. */
  function logicSolve(rowClues, colClues, w, h, startGrid) {
    var grid = startGrid ? new Uint8Array(startGrid) : new Uint8Array(w * h);
    var unknown = 0;
    var i, x, y, out;

    for (i = 0; i < grid.length; i++) if (grid[i] === UNKNOWN) unknown++;

    var changed = true;
    var line;

    while (changed && unknown > 0) {
      changed = false;

      for (y = 0; y < h; y++) {
        line = new Uint8Array(w);
        for (x = 0; x < w; x++) line[x] = grid[y * w + x];
        out = solveLine(line, rowClues[y]);
        if (!out) return null;
        for (x = 0; x < w; x++) {
          if (grid[y * w + x] === UNKNOWN && out[x] !== UNKNOWN) {
            grid[y * w + x] = out[x];
            unknown--;
            changed = true;
          }
        }
      }

      for (x = 0; x < w; x++) {
        line = new Uint8Array(h);
        for (y = 0; y < h; y++) line[y] = grid[y * w + x];
        out = solveLine(line, colClues[x]);
        if (!out) return null;
        for (y = 0; y < h; y++) {
          if (grid[y * w + x] === UNKNOWN && out[y] !== UNKNOWN) {
            grid[y * w + x] = out[y];
            unknown--;
            changed = true;
          }
        }
      }
    }

    return {
      solved: unknown === 0,
      grid: grid,
      determined: w * h - unknown
    };
  }

  /* Opis pojedynczej linii: długości kolejnych ciągów wypełnionych pól.
     Pusta linia dostaje [] — interfejs rysuje przy niej zero. */
  function cluesForLine(values) {
    var out = [];
    var run = 0;
    for (var i = 0; i < values.length; i++) {
      if (values[i]) run++;
      else if (run) { out.push(run); run = 0; }
    }
    if (run) out.push(run);
    return out;
  }

  /* Opisy wszystkich wierszy i kolumn dla gotowego obrazka. */
  function cluesFrom(bits, w, h) {
    var rows = [];
    var cols = [];
    var x, y, line;

    for (y = 0; y < h; y++) {
      line = [];
      for (x = 0; x < w; x++) line.push(bits[y * w + x]);
      rows.push(cluesForLine(line));
    }
    for (x = 0; x < w; x++) {
      line = [];
      for (y = 0; y < h; y++) line.push(bits[y * w + x]);
      cols.push(cluesForLine(line));
    }
    return { rows: rows, cols: cols };
  }

  global.Solver = {
    UNKNOWN: UNKNOWN,
    FILL: FILL,
    EMPTY: EMPTY,
    arrangements: arrangements,
    solveLine: solveLine,
    logicSolve: logicSolve,
    cluesForLine: cluesForLine,
    cluesFrom: cluesFrom
  };
})(typeof window !== "undefined" ? window : globalThis);
