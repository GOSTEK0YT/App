/* ==========================================================================
   PIKSEL — plansza na canvasie
   Liczy rozmiar pól pod dostępne miejsce, rysuje siatkę, opisy i znaczniki,
   zamienia punkt dotyku na współrzędne pola.
   Nie zna reguł gry ani obsługi wejścia — tym zajmuje się app.js.
   ========================================================================== */

(function (global) {
  "use strict";

  var Solver = global.Solver;
  var UNKNOWN = 0, FILL = 1, MARK = 2;

  /* Ile szerokości pola zajmuje jedna liczba w opisie. */
  var CLUE_SLOT = 0.66;
  var MAX_CELL = 46;

  function Board(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.puzzle = null;
    this.state = null;
    this.mistakes = null;      /* pola błędnie wypełnione, gdy podpowiadamy */
    this.showErrors = true;
    this.hover = null;         /* { x, y } — podświetlony krzyż linii */
    this.linia = null;         /* { typ: "wiersz"|"kolumna", nr } — dla samouczka */
    this.metrics = null;
  }

  Board.prototype.load = function (puzzle, state) {
    this.puzzle = puzzle;
    this.state = state ? new Uint8Array(state) : new Uint8Array(puzzle.w * puzzle.h);
    this.mistakes = new Uint8Array(puzzle.w * puzzle.h);
    this.hover = null;
    this.linia = null;
    this.recount();
  };

  /* --------------------------------------------------------------- pomiary */

  function maxClues(list) {
    var max = 1;
    for (var i = 0; i < list.length; i++) max = Math.max(max, list[i].length || 1);
    return max;
  }

  Board.prototype.measure = function (availW, availH) {
    var p = this.puzzle;
    if (!p) return null;

    var rowSlots = maxClues(p.rowClues);
    var colSlots = maxClues(p.colClues);

    var cell = Math.min(
      availW / (p.w + rowSlots * CLUE_SLOT),
      availH / (p.h + colSlots * CLUE_SLOT),
      MAX_CELL
    );
    cell = Math.max(12, Math.floor(cell));

    var gutterX = Math.round(rowSlots * CLUE_SLOT * cell);
    var gutterY = Math.round(colSlots * CLUE_SLOT * cell);

    this.metrics = {
      cell: cell,
      gutterX: gutterX,
      gutterY: gutterY,
      rowSlots: rowSlots,
      colSlots: colSlots,
      width: gutterX + p.w * cell,
      height: gutterY + p.h * cell
    };
    return this.metrics;
  };

  /* Dopasowuje canvas do miejsca i uwzględnia gęstość ekranu (Retina). */
  Board.prototype.resize = function (availW, availH) {
    var m = this.measure(availW, availH);
    if (!m) return;

    var dpr = Math.min(global.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(m.width * dpr);
    this.canvas.height = Math.round(m.height * dpr);
    this.canvas.style.width = m.width + "px";
    this.canvas.style.height = m.height + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  };

  /* Punkt w pikselach CSS względem canvasa → pole planszy albo null. */
  Board.prototype.cellAt = function (px, py) {
    var m = this.metrics;
    if (!m) return null;
    var x = Math.floor((px - m.gutterX) / m.cell);
    var y = Math.floor((py - m.gutterY) / m.cell);
    if (x < 0 || y < 0 || x >= this.puzzle.w || y >= this.puzzle.h) return null;
    return { x: x, y: y };
  };

  /* ----------------------------------------------------------- stan liczbowy */

  /* Które opisy są już „odhaczone" — linia wygląda dokładnie tak, jak opis.
     Wyszarzenie takich liczb bardzo ułatwia grę na małym ekranie. */
  Board.prototype.recount = function () {
    var p = this.puzzle;
    var x, y, line;

    this.rowDone = [];
    for (y = 0; y < p.h; y++) {
      line = [];
      for (x = 0; x < p.w; x++) line.push(this.state[y * p.w + x] === FILL ? 1 : 0);
      this.rowDone.push(sameClues(Solver.cluesForLine(line), p.rowClues[y]));
    }

    this.colDone = [];
    for (x = 0; x < p.w; x++) {
      line = [];
      for (y = 0; y < p.h; y++) line.push(this.state[y * p.w + x] === FILL ? 1 : 0);
      this.colDone.push(sameClues(Solver.cluesForLine(line), p.colClues[x]));
    }
  };

  function sameClues(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /* Plansza jest rozwiązana, gdy wypełnione są dokładnie te pola co w obrazku.
     Krzyżyki nie mają znaczenia — to tylko notatki gracza. */
  Board.prototype.isSolved = function () {
    var p = this.puzzle;
    for (var i = 0; i < p.solution.length; i++) {
      var want = p.solution[i] === 1;
      var has = this.state[i] === FILL;
      if (want !== has) return false;
    }
    return true;
  };

  Board.prototype.filledCount = function () {
    var n = 0;
    for (var i = 0; i < this.state.length; i++) if (this.state[i] === FILL) n++;
    return n;
  };

  Board.prototype.targetCount = function () {
    var n = 0;
    for (var i = 0; i < this.puzzle.solution.length; i++) n += this.puzzle.solution[i];
    return n;
  };

  /* ---------------------------------------------------------------- rysowanie */

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  Board.prototype.draw = function () {
    var p = this.puzzle;
    var m = this.metrics;
    if (!p || !m) return;

    var ctx = this.ctx;
    var cell = m.cell;
    var colors = {
      surface: css("--surface"),
      ink: css("--ink"),
      muted: css("--muted"),
      line: css("--line"),
      major: css("--grid-major"),
      fill: css("--fill"),
      accent: css("--accent"),
      soft: css("--accent-soft"),
      error: css("--error")
    };

    ctx.clearRect(0, 0, m.width, m.height);

    /* tło samej siatki */
    ctx.fillStyle = colors.surface;
    ctx.fillRect(m.gutterX, m.gutterY, p.w * cell, p.h * cell);

    /* linia wskazana przez samouczek — razem z jej opisem po lewej lub u góry */
    if (this.linia) {
      ctx.fillStyle = colors.soft;
      if (this.linia.typ === "wiersz") {
        ctx.fillRect(0, m.gutterY + this.linia.nr * cell, m.width, cell);
      } else {
        ctx.fillRect(m.gutterX + this.linia.nr * cell, 0, cell, m.height);
      }
    }

    /* podświetlenie wiersza i kolumny pod palcem */
    if (this.hover) {
      ctx.fillStyle = colors.soft;
      ctx.fillRect(m.gutterX, m.gutterY + this.hover.y * cell, p.w * cell, cell);
      ctx.fillRect(m.gutterX + this.hover.x * cell, m.gutterY, cell, p.h * cell);
    }

    /* wypełnienia i krzyżyki */
    var pad = Math.max(1, Math.round(cell * 0.08));
    var r = Math.max(1, Math.round(cell * 0.16));
    for (var y = 0; y < p.h; y++) {
      for (var x = 0; x < p.w; x++) {
        var v = this.state[y * p.w + x];
        var cx = m.gutterX + x * cell;
        var cy = m.gutterY + y * cell;

        if (v === FILL) {
          var wrong = this.showErrors && this.mistakes[y * p.w + x];
          ctx.fillStyle = wrong ? colors.error : colors.fill;
          roundRect(ctx, cx + pad, cy + pad, cell - pad * 2, cell - pad * 2, r);
          ctx.fill();
        } else if (v === MARK) {
          ctx.strokeStyle = colors.muted;
          ctx.lineWidth = Math.max(1.2, cell * 0.09);
          ctx.lineCap = "round";
          var q = cell * 0.32;
          ctx.beginPath();
          ctx.moveTo(cx + q, cy + q);
          ctx.lineTo(cx + cell - q, cy + cell - q);
          ctx.moveTo(cx + cell - q, cy + q);
          ctx.lineTo(cx + q, cy + cell - q);
          ctx.stroke();
        }
      }
    }

    /* siatka — co piąta linia grubsza, żeby dało się liczyć wzrokiem */
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= p.w; gx++) {
      var major = gx % 5 === 0 || gx === p.w;
      ctx.strokeStyle = major ? colors.major : colors.line;
      ctx.lineWidth = major ? 1.6 : 1;
      var lx = crisp(m.gutterX + gx * cell, ctx.lineWidth);
      ctx.beginPath();
      ctx.moveTo(lx, m.gutterY);
      ctx.lineTo(lx, m.gutterY + p.h * cell);
      ctx.stroke();
    }
    for (var gy = 0; gy <= p.h; gy++) {
      var majorY = gy % 5 === 0 || gy === p.h;
      ctx.strokeStyle = majorY ? colors.major : colors.line;
      ctx.lineWidth = majorY ? 1.6 : 1;
      var ly = crisp(m.gutterY + gy * cell, ctx.lineWidth);
      ctx.beginPath();
      ctx.moveTo(m.gutterX, ly);
      ctx.lineTo(m.gutterX + p.w * cell, ly);
      ctx.stroke();
    }

    /* opisy */
    var fs = Math.max(9, Math.round(cell * 0.52));
    ctx.font = "600 " + fs + "px ui-rounded, system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "middle";

    for (y = 0; y < p.h; y++) {
      var rc = p.rowClues[y];
      ctx.textAlign = "right";
      ctx.fillStyle = this.rowDone[y] ? colors.muted : colors.ink;
      if (!rc.length) {
        ctx.fillText("0", m.gutterX - cell * 0.22, m.gutterY + y * cell + cell / 2);
      } else {
        for (var i = 0; i < rc.length; i++) {
          var slot = rc.length - 1 - i;
          ctx.fillText(
            String(rc[rc.length - 1 - i]),
            m.gutterX - cell * 0.22 - slot * CLUE_SLOT * cell,
            m.gutterY + y * cell + cell / 2
          );
        }
      }
    }

    for (x = 0; x < p.w; x++) {
      var cc = p.colClues[x];
      ctx.textAlign = "center";
      ctx.fillStyle = this.colDone[x] ? colors.muted : colors.ink;
      if (!cc.length) {
        ctx.fillText("0", m.gutterX + x * cell + cell / 2, m.gutterY - cell * 0.33);
      } else {
        for (var j = 0; j < cc.length; j++) {
          var slotY = cc.length - 1 - j;
          ctx.fillText(
            String(cc[cc.length - 1 - j]),
            m.gutterX + x * cell + cell / 2,
            m.gutterY - cell * 0.33 - slotY * CLUE_SLOT * cell
          );
        }
      }
    }
  };

  /* Linia o grubości 1 px trafiona w połowę piksela jest rozmyta. */
  function crisp(v, lineWidth) {
    return Math.round(v) + (Math.round(lineWidth) % 2 ? 0.5 : 0);
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  Board.UNKNOWN = UNKNOWN;
  Board.FILL = FILL;
  Board.MARK = MARK;
  global.Board = Board;
})(typeof window !== "undefined" ? window : globalThis);
