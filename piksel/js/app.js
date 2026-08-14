/* ==========================================================================
   PIKSEL — spinacz całości
   Ekrany, obsługa dotyku, zapis postępu, statystyki, samouczek.
   Reguły łamigłówki siedzą w solver.js, rysowanie w board.js,
   a motyw, dźwięk i pamięć w ../wspolne/wspolne.js.
   ========================================================================== */

(function () {
  "use strict";

  var Generator = window.Generator;
  var Art = window.Art;
  var BoardClass = window.Board;
  var Nauka = window.Samouczek;

  var UNKNOWN = BoardClass.UNKNOWN;
  var FILL = BoardClass.FILL;
  var MARK = BoardClass.MARK;

  var KLUCZ_USTAWIEN = "piksel-ustawienia";
  var KLUCZ_ZAPISU = "piksel-zapis";
  var KLUCZ_WYNIKOW = "piksel-wyniki";
  var KLUCZ_DNIA = "piksel-dzien";
  var KLUCZ_NAUKI = "piksel-samouczek";

  var ustawienia = Pamiec.czytaj(KLUCZ_USTAWIEN, {});
  if (typeof ustawienia.errors !== "boolean") ustawienia.errors = true;
  if (!ustawienia.size) ustawienia.size = 10;
  if (!ustawienia.artIndex) ustawienia.artIndex = {};

  var wyniki = Pamiec.czytaj(KLUCZ_WYNIKOW, {});

  function $(id) { return document.getElementById(id); }

  var menuScreen = $("menuScreen");
  var gameScreen = $("gameScreen");
  var canvas = $("board");
  var boardWrap = $("boardWrap");

  var board = new BoardClass(canvas);
  board.showErrors = ustawienia.errors;

  /* ---------------------------------------------------------------- stan gry */

  var game = {
    puzzle: null,
    mode: "random",     /* random | art | daily | samouczek */
    seconds: 0,
    hints: 0,
    tool: FILL,
    undo: [],
    running: false
  };

  var ticker = null;

  /* ------------------------------------------------------------------ motyw */

  Motyw.podepnij($("themeBtn"));
  Motyw.naZmiane(function () {
    if (game.puzzle) board.draw();
  });
  Dzwiek.podepnij($("soundBtn"));

  /* ---------------------------------------------------------------- ekrany */

  function showScreen(which) {
    menuScreen.classList.toggle("is-active", which === "menu");
    gameScreen.classList.toggle("is-active", which === "game");
    if (which === "game") {
      /* układ jest gotowy dopiero po pokazaniu sekcji */
      requestAnimationFrame(fitBoard);
    }
  }

  /* ------------------------------------------------ przełącznik pilnowania */

  (function () {
    var btn = $("errorsBtn");
    function sync() {
      btn.setAttribute("aria-pressed", ustawienia.errors ? "true" : "false");
      btn.querySelector(".chip__txt").textContent =
        ustawienia.errors ? "Pilnuj błędów" : "Bez pilnowania";
    }
    btn.addEventListener("click", function () {
      ustawienia.errors = !ustawienia.errors;
      Pamiec.zapisz(KLUCZ_USTAWIEN, ustawienia);
      sync();
      board.showErrors = ustawienia.errors;
      if (game.puzzle) {
        if (ustawienia.errors) recheckMistakes();
        board.draw();
      }
      Dzwiek.zagraj(ustawienia.errors ? 660 : 440, 60);
    });
    sync();
  })();

  /* --------------------------------------------------------- wybór rozmiaru */

  var sizeButtons = Array.prototype.slice.call(document.querySelectorAll(".seg__opt"));

  function syncSize() {
    sizeButtons.forEach(function (b) {
      var on = Number(b.dataset.size) === ustawienia.size;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });

    var hasArt = !!Art[ustawienia.size];
    $("playArtBtn").disabled = !hasArt;
    $("artNote").textContent = hasArt
      ? "Na końcu odsłania się rysunek"
      : "Obrazki są w rozmiarach 5 × 5 i 10 × 10";

    $("dailyNote").textContent = dailyDoneToday()
      ? "Dzisiejsza już rozwiązana"
      : "Ta sama plansza przez cały dzień";

    renderStats(wyniki[ustawienia.size]);
  }

  sizeButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      ustawienia.size = Number(b.dataset.size);
      Pamiec.zapisz(KLUCZ_USTAWIEN, ustawienia);
      syncSize();
      Dzwiek.zagraj(520, 50);
    });
  });

  function renderStats(entry) {
    var box = $("stats");
    if (!entry || !entry.solved) {
      box.textContent = "Rozmiar " + ustawienia.size + " × " + ustawienia.size +
        ": jeszcze nic tu nie rozwiązałeś.";
      return;
    }
    box.innerHTML = "Rozwiązane: <b>" + entry.solved + "</b>" +
      (entry.best ? " · Najlepszy czas: <b>" + clock(entry.best) + "</b>" : "");
  }

  /* -------------------------------------------------------------- zagadka dnia */

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  function pad2(n) { return n < 10 ? "0" + n : String(n); }
  function dailyDoneToday() {
    var d = Pamiec.czytaj(KLUCZ_DNIA, null);
    return !!(d && d.date === todayKey() && d.size === ustawienia.size);
  }

  /* ---------------------------------------------------------------- start gry */

  function startPuzzle(puzzle, mode, restore) {
    /* zapis trzyma stan planszy jako tekst — tu wraca do tablicy bajtów */
    if (restore && typeof restore.state === "string") {
      restore = {
        seconds: restore.seconds,
        hints: restore.hints,
        state: inflateBits(restore.state)
      };
    }

    game.puzzle = puzzle;
    game.mode = mode;
    game.undo = [];
    game.seconds = restore ? restore.seconds : 0;
    game.hints = restore ? restore.hints : 0;
    game.tool = FILL;

    board.load(puzzle, restore ? restore.state : null);
    if (ustawienia.errors) recheckMistakes();

    setTool(FILL);
    $("puzzleTitle").textContent = titleFor(puzzle, mode);
    $("hintBtn").disabled = mode === "samouczek";
    $("restartBtn").hidden = mode === "samouczek";
    odswiezKrok();
    updateMeta();
    showScreen("game");
    startTimer();
    saveGame();
  }

  function titleFor(puzzle, mode) {
    if (mode === "samouczek") return "Samouczek";
    if (mode === "daily") return "Zagadka dnia";
    if (mode === "art" && puzzle.name) return "Obrazek — " + puzzle.w + " × " + puzzle.h;
    return "Plansza " + puzzle.w + " × " + puzzle.h;
  }

  $("playRandomBtn").addEventListener("click", function () {
    Dzwiek.zagraj(600, 60);
    withSpinner(function () {
      startPuzzle(Generator.random(ustawienia.size, ustawienia.size), "random");
    });
  });

  $("playArtBtn").addEventListener("click", function () {
    var pool = Art[ustawienia.size];
    if (!pool) return;
    Dzwiek.zagraj(600, 60);

    /* obrazki idą po kolei, żeby nie powtarzać tego samego dwa razy pod rząd */
    var idx = ustawienia.artIndex[ustawienia.size] || 0;
    var entry = pool[idx % pool.length];
    ustawienia.artIndex[ustawienia.size] = (idx + 1) % pool.length;
    Pamiec.zapisz(KLUCZ_USTAWIEN, ustawienia);

    startPuzzle(Generator.fromArt(entry), "art");
  });

  $("playDailyBtn").addEventListener("click", function () {
    Dzwiek.zagraj(600, 60);
    withSpinner(function () {
      startPuzzle(Generator.daily(todayKey(), ustawienia.size, ustawienia.size), "daily");
    });
  });

  $("tutorialBtn").addEventListener("click", function () {
    Dzwiek.zagraj(600, 60);
    var bity = Nauka.planszaJakoBity();
    startPuzzle(Generator.puzzleFrom(bity, Nauka.W, Nauka.W, "Samouczek"), "samouczek");
  });

  /* Generowanie 15 × 15 potrafi zająć chwilę — najpierw pokazujemy komunikat,
     dopiero w następnej klatce liczymy, inaczej ekran zamarza bez słowa. */
  function withSpinner(work) {
    powiedz("Układam planszę…");
    setTimeout(function () {
      work();
      $("toast").classList.remove("is-on");
    }, 30);
  }

  $("resumeBtn").addEventListener("click", function () {
    var save = Pamiec.czytaj(KLUCZ_ZAPISU, null);
    if (!save) return;
    Dzwiek.zagraj(600, 60);
    startPuzzle(inflate(save.puzzle), save.mode, save);
  });

  $("backBtn").addEventListener("click", function () {
    stopTimer();
    saveGame();
    refreshMenu();
    showScreen("menu");
  });

  $("restartBtn").addEventListener("click", function () {
    if (!game.puzzle) return;
    board.load(game.puzzle, null);
    game.undo = [];
    game.seconds = 0;
    game.hints = 0;
    updateMeta();
    board.draw();
    saveGame();
    Dzwiek.zagraj(380, 90);
  });

  /* ------------------------------------------------------------- samouczek */

  function odswiezKrok() {
    var box = $("krok");
    if (game.mode !== "samouczek") {
      box.hidden = true;
      board.linia = null;      /* inaczej podświetlenie zostałoby na kolejnej planszy */
      return;
    }

    var nr = Nauka.krokDla(board.state);
    if (nr >= Nauka.KROKI.length) { box.hidden = true; return; }

    var krok = Nauka.KROKI[nr];
    box.hidden = false;
    $("krokLicznik").textContent = "Krok " + (nr + 1) + " z " + Nauka.KROKI.length;
    $("krokTytul").textContent = krok.tytul;
    $("krokTresc").innerHTML = krok.tresc;

    /* podświetlenie linii, o której mowa w kroku */
    if (krok.podswietl) {
      board.linia = krok.podswietl;
    } else {
      board.linia = null;
    }
    board.draw();
  }

  /* ------------------------------------------------------------------ zegar */

  function startTimer() {
    stopTimer();
    game.running = true;
    ticker = setInterval(function () {
      if (document.hidden || !game.running) return;
      game.seconds++;
      $("timer").textContent = clock(game.seconds);
    }, 1000);
  }
  function stopTimer() {
    game.running = false;
    if (ticker) { clearInterval(ticker); ticker = null; }
  }
  function clock(s) {
    var m = Math.floor(s / 60);
    return m + ":" + pad2(s % 60);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) saveGame();
  });

  /* -------------------------------------------------------- rozmiar canvasu */

  function fitBoard() {
    if (!game.puzzle) return;
    var rect = boardWrap.getBoundingClientRect();
    board.resize(Math.max(120, rect.width - 8), Math.max(120, rect.height - 8));
  }

  window.addEventListener("resize", fitBoard);
  window.addEventListener("orientationchange", function () {
    setTimeout(fitBoard, 250);
  });

  /* --------------------------------------------------------------- narzędzia */

  function setTool(tool) {
    game.tool = tool;
    $("toolFill").classList.toggle("is-on", tool === FILL);
    $("toolFill").setAttribute("aria-checked", tool === FILL ? "true" : "false");
    $("toolMark").classList.toggle("is-on", tool === MARK);
    $("toolMark").setAttribute("aria-checked", tool === MARK ? "true" : "false");
  }

  $("toolFill").addEventListener("click", function () { setTool(FILL); Dzwiek.zagraj(560, 45); });
  $("toolMark").addEventListener("click", function () { setTool(MARK); Dzwiek.zagraj(460, 45); });

  $("undoBtn").addEventListener("click", undo);

  $("hintBtn").addEventListener("click", function () {
    if (!game.puzzle || game.mode === "samouczek") return;
    var p = game.puzzle;
    var candidates = [];
    for (var i = 0; i < p.solution.length; i++) {
      var want = p.solution[i] ? FILL : MARK;
      if (board.state[i] !== want) candidates.push(i);
    }
    if (!candidates.length) { powiedz("Nic już nie zostało"); return; }

    /* najpierw pola do zamalowania — one realnie posuwają planszę do przodu */
    var fills = candidates.filter(function (i) { return p.solution[i] === 1; });
    var pool = fills.length ? fills : candidates;
    var pick = pool[(Math.random() * pool.length) | 0];

    applyStroke([{ i: pick, from: board.state[pick], to: p.solution[pick] ? FILL : MARK }]);
    game.hints++;
    board.hover = { x: pick % p.w, y: Math.floor(pick / p.w) };
    board.draw();
    setTimeout(function () { board.hover = null; board.draw(); }, 700);
    Dzwiek.zagraj(880, 120, 0.04);
    updateMeta();
    saveGame();

    /* podpowiedź też potrafi domknąć planszę */
    if (board.isSolved()) win();
  });

  /* ------------------------------------------------------------------ ruchy */

  function applyStroke(changes) {
    if (!changes.length) return;
    for (var i = 0; i < changes.length; i++) {
      var c = changes[i];
      board.state[c.i] = c.to;
      board.mistakes[c.i] = (c.to === FILL && !game.puzzle.solution[c.i]) ? 1 : 0;
    }
    game.undo.push(changes);
    if (game.undo.length > 200) game.undo.shift();
    board.recount();
  }

  function undo() {
    var last = game.undo.pop();
    if (!last) { powiedz("Nie ma czego cofać"); return; }
    for (var i = last.length - 1; i >= 0; i--) {
      var c = last[i];
      board.state[c.i] = c.from;
      board.mistakes[c.i] = (c.from === FILL && !game.puzzle.solution[c.i]) ? 1 : 0;
    }
    board.recount();
    odswiezKrok();
    board.draw();
    updateMeta();
    saveGame();
    Dzwiek.zagraj(340, 60);
  }

  function recheckMistakes() {
    for (var i = 0; i < board.state.length; i++) {
      board.mistakes[i] = (board.state[i] === FILL && !game.puzzle.solution[i]) ? 1 : 0;
    }
  }

  function updateMeta() {
    $("timer").textContent = clock(game.seconds);
    $("progress").textContent = board.filledCount() + " / " + board.targetCount();
    $("undoBtn").disabled = game.undo.length === 0;
  }

  /* ------------------------------------------------------------------ dotyk */

  var stroke = null;

  function pointToCell(ev) {
    var rect = canvas.getBoundingClientRect();
    return board.cellAt(ev.clientX - rect.left, ev.clientY - rect.top);
  }

  canvas.addEventListener("pointerdown", function (ev) {
    if (!game.puzzle) return;
    var cell = pointToCell(ev);
    if (!cell) return;

    ev.preventDefault();
    canvas.setPointerCapture(ev.pointerId);

    var idx = cell.y * game.puzzle.w + cell.x;
    var current = board.state[idx];
    var target;

    /* Dotknięcie pola, które już ma ten znacznik, kasuje go — tak samo
       zachowują się papierowe nonogramy i wszystkie sensowne aplikacje. */
    if (game.tool === FILL) target = current === FILL ? UNKNOWN : FILL;
    else target = current === MARK ? UNKNOWN : MARK;

    stroke = {
      target: target,
      start: cell,
      last: cell,
      axis: null,
      changes: []
    };

    paintCell(cell);
    board.hover = cell;
    board.draw();
  });

  canvas.addEventListener("pointermove", function (ev) {
    if (!stroke) return;
    var cell = pointToCell(ev);
    if (!cell) return;
    ev.preventDefault();

    /* Po dwóch polach pociągnięcie zatrzaskuje się w poziomie albo w pionie.
       Bez tego malowanie palcem po siatce jest nie do opanowania. */
    if (!stroke.axis) {
      var dx = Math.abs(cell.x - stroke.start.x);
      var dy = Math.abs(cell.y - stroke.start.y);
      if (dx === 0 && dy === 0) return;
      stroke.axis = dx >= dy ? "x" : "y";
    }

    var goal = stroke.axis === "x"
      ? { x: cell.x, y: stroke.start.y }
      : { x: stroke.start.x, y: cell.y };

    /* uzupełniamy wszystkie pola po drodze — palec potrafi przeskoczyć kilka */
    var step, i;
    if (stroke.axis === "x") {
      step = goal.x > stroke.last.x ? 1 : -1;
      for (i = stroke.last.x; i !== goal.x + step; i += step) paintCell({ x: i, y: goal.y });
    } else {
      step = goal.y > stroke.last.y ? 1 : -1;
      for (i = stroke.last.y; i !== goal.y + step; i += step) paintCell({ x: goal.x, y: i });
    }

    stroke.last = goal;
    board.hover = goal;
    board.draw();
  });

  function paintCell(cell) {
    var p = game.puzzle;
    if (cell.x < 0 || cell.y < 0 || cell.x >= p.w || cell.y >= p.h) return;
    var idx = cell.y * p.w + cell.x;
    var from = board.state[idx];
    if (from === stroke.target) return;

    /* nie zamazujemy cudzych znaczników w trakcie jednego pociągnięcia:
       kasowanie kasuje tylko to, co pasuje do narzędzia */
    if (stroke.target === UNKNOWN) {
      var wanted = game.tool === FILL ? FILL : MARK;
      if (from !== wanted) return;
    }

    board.state[idx] = stroke.target;
    board.mistakes[idx] = (stroke.target === FILL && !p.solution[idx]) ? 1 : 0;
    stroke.changes.push({ i: idx, from: from, to: stroke.target });
    board.recount();
  }

  function endStroke(ev) {
    if (!stroke) return;
    if (ev && ev.pointerId !== undefined && canvas.hasPointerCapture(ev.pointerId)) {
      canvas.releasePointerCapture(ev.pointerId);
    }

    var changes = stroke.changes;
    stroke = null;
    board.hover = null;

    if (changes.length) {
      /* stan już siedzi na planszy — do historii wrzucamy sam opis zmian */
      game.undo.push(changes);
      if (game.undo.length > 200) game.undo.shift();

      var wrong = changes.some(function (c) {
        return c.to === FILL && !game.puzzle.solution[c.i];
      });
      if (wrong && ustawienia.errors) Dzwiek.zagraj(200, 160, 0.05);
      else Dzwiek.zagraj(game.tool === FILL ? 620 : 500, 40, 0.035);
    }

    var przedKrokiem = game.mode === "samouczek" ? Nauka.krokDla(board.state) : -1;
    odswiezKrok();
    if (game.mode === "samouczek" && Nauka.krokDla(board.state) > przedKrokiem) {
      Dzwiek.zagraj(760, 140, 0.045);
      powiedz("Dobrze");
    }

    board.draw();
    updateMeta();
    saveGame();

    if (board.isSolved()) win();
  }

  /* pointerleave celowo pominięty: przy przechwyconym wskaźniku palec
     wyjeżdżający poza siatkę urywałby pociągnięcie w połowie */
  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);

  /* zapobiega menu kontekstowemu po dłuższym przytrzymaniu */
  canvas.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });

  /* ---------------------------------------------------------------- wygrana */

  function win() {
    stopTimer();
    Pamiec.skasuj(KLUCZ_ZAPISU);
    board.linia = null;
    $("krok").hidden = true;

    if (game.mode === "samouczek") {
      Pamiec.zapisz(KLUCZ_NAUKI, { zrobiony: true });
      $("winEyebrow").textContent = "Samouczek skończony";
      $("winTitle").textContent = "Umiesz już wszystko";
      $("winStats").hidden = true;
      $("againBtn").querySelector(".btn__main").textContent = "Zagraj naprawdę";
    } else {
      var size = game.puzzle.w;
      var entry = wyniki[size] || { solved: 0, best: null };
      entry.solved++;
      if (!entry.best || game.seconds < entry.best) entry.best = game.seconds;
      wyniki[size] = entry;
      Pamiec.zapisz(KLUCZ_WYNIKOW, wyniki);

      if (game.mode === "daily") {
        Pamiec.zapisz(KLUCZ_DNIA, { date: todayKey(), size: size, seconds: game.seconds });
      }

      $("winEyebrow").textContent = "Rozwiązane";
      $("winTitle").textContent = game.puzzle.name || "Plansza rozwiązana";
      $("winStats").hidden = false;
      $("winTime").textContent = clock(game.seconds);
      $("winHints").textContent = String(game.hints);
      $("winSize").textContent = size + " × " + size;
      $("againBtn").querySelector(".btn__main").textContent = "Jeszcze raz";
    }

    drawWinArt();
    $("winOverlay").hidden = false;

    /* trzy dźwięki w górę — mały fanfar */
    Dzwiek.zagraj(660, 110, 0.05);
    setTimeout(function () { Dzwiek.zagraj(830, 110, 0.05); }, 110);
    setTimeout(function () { Dzwiek.zagraj(990, 220, 0.05); }, 220);
  }

  function drawWinArt() {
    var c = $("winArt");
    var p = game.puzzle;
    var cell = Math.max(6, Math.floor(190 / p.w));
    var dpr = Math.min(window.devicePixelRatio || 1, 3);

    c.width = p.w * cell * dpr;
    c.height = p.h * cell * dpr;
    c.style.width = p.w * cell + "px";
    c.style.height = p.h * cell + "px";

    var ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var style = getComputedStyle(document.documentElement);
    ctx.fillStyle = style.getPropertyValue("--bg").trim();
    ctx.fillRect(0, 0, p.w * cell, p.h * cell);
    ctx.fillStyle = style.getPropertyValue("--fill").trim();
    for (var y = 0; y < p.h; y++) {
      for (var x = 0; x < p.w; x++) {
        if (p.solution[y * p.w + x]) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  $("againBtn").addEventListener("click", function () {
    $("winOverlay").hidden = true;
    if (game.mode === "samouczek") {
      withSpinner(function () {
        startPuzzle(Generator.random(5, 5), "random");
      });
      return;
    }
    if (game.mode === "art") { $("playArtBtn").click(); return; }
    if (game.mode === "daily") { refreshMenu(); showScreen("menu"); return; }
    withSpinner(function () {
      startPuzzle(Generator.random(ustawienia.size, ustawienia.size), "random");
    });
  });

  $("winMenuBtn").addEventListener("click", function () {
    $("winOverlay").hidden = true;
    refreshMenu();
    showScreen("menu");
  });

  /* ------------------------------------------------------------------ zapis */

  /* Uint8Array w JSON-ie rozdyma się do tablicy liczb — zamieniamy na tekst. */
  function deflate(arr) {
    var s = "";
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s;
  }
  function inflateBits(text) {
    var arr = new Uint8Array(text.length);
    for (var i = 0; i < text.length; i++) arr[i] = text.charCodeAt(i) - 48;
    return arr;
  }

  function saveGame() {
    if (!game.puzzle || game.mode === "samouczek" || board.isSolved()) return;
    Pamiec.zapisz(KLUCZ_ZAPISU, {
      mode: game.mode,
      seconds: game.seconds,
      hints: game.hints,
      state: deflate(board.state),
      puzzle: {
        w: game.puzzle.w,
        h: game.puzzle.h,
        name: game.puzzle.name,
        solution: deflate(game.puzzle.solution)
      }
    });
  }

  function inflate(raw) {
    return Generator.puzzleFrom(inflateBits(raw.solution), raw.w, raw.h, raw.name);
  }

  /* ------------------------------------------------------------------- menu */

  function refreshMenu() {
    var save = Pamiec.czytaj(KLUCZ_ZAPISU, null);
    var btn = $("resumeBtn");
    if (save && save.puzzle) {
      btn.hidden = false;
      var filled = 0;
      for (var i = 0; i < save.state.length; i++) if (save.state[i] === "1") filled++;
      var target = 0;
      for (i = 0; i < save.puzzle.solution.length; i++) if (save.puzzle.solution[i] === "1") target++;
      $("resumeNote").textContent = save.puzzle.w + " × " + save.puzzle.h +
        " · " + filled + " / " + target + " pól · " + clock(save.seconds);
    } else {
      btn.hidden = true;
    }

    var nauka = Pamiec.czytaj(KLUCZ_NAUKI, null);
    $("tutorialNote").textContent = nauka && nauka.zrobiony
      ? "Zrobiony — możesz powtórzyć, kiedy chcesz"
      : "Cztery kroki, uczy zasad na małej planszy";

    syncSize();
  }

  /* --------------------------------------------------------------- start */

  /* Uchwyt do podglądu w konsoli przeglądarki i do testów automatycznych.
     Nic z gry z niego nie korzysta. */
  window.Piksel = {
    board: board,
    game: game,
    krok: function () { return Nauka.krokDla(board.state); },
    sprawdzWygrana: function () { if (board.isSolved()) win(); }
  };

  refreshMenu();
  showScreen("menu");
})();
