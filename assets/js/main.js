/* ==========================================================================
   FOX3D — skrypt strony
   Zawiera: przełącznik motywu, lisek pocięty na warstwy (canvas),
            listwę wysokości Z, odsłanianie sekcji, formularz wyceny.
   Bez zależności zewnętrznych.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  var reduce = motionQuery.matches;

  /* ---------------------------------------------------------------- motyw */

  var themeBtn = document.getElementById("themeBtn");

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* tryb prywatny */ }
  }
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  var saved = read("fox3d-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  function isDark() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "dark") return true;
    if (explicit === "light") return false;
    return darkQuery.matches;
  }

  /* aria-pressed steruje jednocześnie ikoną (CSS) i opisem dla czytników */
  function syncTheme() {
    var dark = isDark();
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.setAttribute("aria-label", dark ? "Włącz motyw jasny" : "Włącz motyw ciemny");
    themeBtn.setAttribute("title", dark ? "Motyw jasny" : "Motyw ciemny");
    readColors();
  }

  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("fox3d-theme", next);
    syncTheme();
  });

  darkQuery.addEventListener("change", syncTheme);
  motionQuery.addEventListener("change", function (e) {
    reduce = e.matches;
    if (reduce && rafId) { cancelAnimationFrame(rafId); rafId = 0; drawHero(0); }
    else if (!reduce && !rafId) rafId = requestAnimationFrame(drawHero);
  });

  /* ------------------------------------------------- lisek: geometria */

  /* kontur głowy odrysowany z logo — pysk skierowany w prawo */
  var FOX = [
    [ 1.00, -0.06], [ 0.72,  0.06], [ 0.48,  0.20], [ 0.34,  0.34],
    [ 0.34,  0.46], [ 0.50,  0.80], [ 0.28,  0.52], [ 0.04,  1.00],
    [-0.22,  0.52], [-0.44,  0.32], [-0.62,  0.10], [-0.86, -0.06],
    [-0.58, -0.18], [-0.86, -0.40], [-0.52, -0.46], [-0.62, -0.78],
    [-0.26, -0.60], [ 0.06, -0.60], [ 0.40, -0.44], [ 0.72, -0.22]
  ];
  /* skos oka — rysowany tylko na górnych warstwach, żeby twarz się czytała */
  var EYE = [[0.20, 0.22], [0.46, 0.06], [0.42, 0.00], [0.22, 0.12]];

  var C = { flame: "#F4661B", ember: "#FF9445", hi: "#F2EFEC" };

  function readColors() {
    var cs = getComputedStyle(root);
    C.flame = cs.getPropertyValue("--flame").trim() || C.flame;
    C.ember = cs.getPropertyValue("--ember").trim() || C.ember;
    C.hi = cs.getPropertyValue("--mark-hi").trim() || C.hi;
    if (markCtx) drawMark();
    if (heroCtx && reduce) drawHero(0);
  }

  function toRgb(color) {
    if (Array.isArray(color)) return color;
    var h = String(color).replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    var A = toRgb(a), B = toRgb(b);
    return [Math.round(A[0] + (B[0] - A[0]) * t),
            Math.round(A[1] + (B[1] - A[1]) * t),
            Math.round(A[2] + (B[2] - A[2]) * t)];
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  /* rzut warstwy: relief obracany wokół osi Y, z lekkim przechyłem */
  function project(px, py, z, ang, tilt, scale, cx, cy) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    var x1 = px * ca + z * sa;
    var z1 = -px * sa + z * ca;
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var y1 = py * ct - z1 * st;
    var z2 = py * st + z1 * ct;
    var f = 3.4 / (3.4 + z2);
    return [cx + x1 * f * scale, cy - y1 * f * scale];
  }

  /* Rysuje stos warstw: to, co slicer zrobiłby z logo przed drukiem.
     sweep = pozycja głowicy (0–1), lub -1 gdy animacja wyłączona. */
  function paintStack(ctx, w, h, ang, sweep, opt) {
    var N = opt.layers, depth = opt.depth, alpha = opt.alpha;
    var cx = w * opt.cx, cy = h * opt.cy, scale = Math.min(w, h) * opt.scale;

    ctx.clearRect(0, 0, w, h);
    ctx.lineJoin = "round";

    function path(pts, s, z) {
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = project(pts[i][0] * s, pts[i][1] * s, z, ang, opt.tilt, scale, cx, cy);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
    }

    /* warstwa zerowa wypełniona — sam kontur gubi sylwetkę */
    path(FOX, 1, -depth / 2);
    ctx.fillStyle = rgba(toRgb(C.flame), alpha * 0.55);
    ctx.fill();

    for (var k = 0; k < N; k++) {
      var t = k / (N - 1);
      var s = 1 - 0.40 * Math.pow(t, 1.75);          /* profil kopuły */
      var z = (t - 0.5) * depth;
      var near = sweep >= 0 ? Math.max(0, 1 - Math.abs(t - sweep) * 11) : 0;

      var col = mix(C.flame, C.hi, Math.pow(t, 1.25));
      if (near > 0) col = mix(col, C.ember, near * 0.85);

      ctx.strokeStyle = rgba(col, alpha * (0.30 + 0.70 * t) + near * alpha * 2.6);
      ctx.lineWidth = opt.lw + near * opt.lw * 1.5;
      path(FOX, s, z);
      ctx.stroke();

      if (t > 0.82) { path(EYE, s, z); ctx.stroke(); }
    }
  }

  /* ------------------------------------------------- znak w nagłówku */

  var markCv = document.getElementById("markCanvas");
  var markCtx = markCv ? markCv.getContext("2d") : null;

  function drawMark() {
    var size = 34;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    markCv.width = size * dpr;
    markCv.height = size * dpr;
    markCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintStack(markCtx, size, size, -0.30, -1,
      { layers: 14, depth: 0.5, alpha: 0.62, lw: 0.7, tilt: 0.10, cx: 0.48, cy: 0.55, scale: 0.40 });
    markCtx.strokeStyle = C.flame;
    markCtx.lineWidth = 1.4;
    markCtx.beginPath();
    markCtx.arc(size / 2, size / 2, size / 2 - 1.2, -0.5, 3.6);
    markCtx.stroke();
  }

  /* ------------------------------------------------------ lisek w hero */

  var heroCv = document.getElementById("foxCanvas");
  var heroCtx = heroCv ? heroCv.getContext("2d") : null;
  var hero = document.querySelector(".hero");
  var W = 0, H = 0, pointerX = 0, onScreen = true, rafId = 0;

  function sizeHero() {
    if (!heroCv || !hero) return;
    var r = hero.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(300, Math.round(r.width));
    H = Math.max(300, Math.round(r.height * 1.16));
    heroCv.style.width = W + "px";
    heroCv.style.height = H + "px";
    heroCv.width = W * dpr;
    heroCv.height = H * dpr;
    heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawHero(0);
  }

  function drawHero(now) {
    var ang, sweep;
    if (reduce) {
      ang = -0.34; sweep = -1;
    } else {
      ang = 0.50 * Math.sin(now * 0.00026) - 0.16 + pointerX * 0.20;
      sweep = (now % 7200) / 7200;
    }
    /* na jasnym tle te same alfy znikają — podbijamy krycie;
       na wąskim ekranie lisek wędruje w lewo, żeby pysk nie wychodził za kadr */
    var narrow = W < 620;
    paintStack(heroCtx, W, H, ang, sweep, {
      layers: 52, depth: 0.62, alpha: isDark() ? 0.135 : 0.26,
      lw: 1, tilt: 0.13, cx: narrow ? 0.62 : 0.74, cy: 0.50,
      scale: narrow ? 0.22 : 0.24
    });
    if (!reduce && onScreen) rafId = requestAnimationFrame(drawHero);
    else rafId = 0;
  }

  if (heroCtx) {
    window.addEventListener("resize", sizeHero, { passive: true });
    window.addEventListener("pointermove", function (e) {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen && !reduce && !rafId) rafId = requestAnimationFrame(drawHero);
        else if (!onScreen && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      }, { threshold: 0 }).observe(hero);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      else if (!document.hidden && onScreen && !reduce && !rafId) rafId = requestAnimationFrame(drawHero);
    });
  }

  /* ------------------------------------------------------- listwa Z */

  var ticks = document.getElementById("ticks");
  var zfill = document.getElementById("zfill");
  var zhead = document.getElementById("zhead");
  var zval = document.getElementById("zval");

  if (ticks) {
    var marks = "";
    for (var i = 0; i <= 40; i++) {
      marks += '<div class="tick' + (i % 5 === 0 ? " maj" : "") + '" style="top:' + (i * 2.5) + '%"></div>';
    }
    ticks.insertAdjacentHTML("afterbegin", marks);
  }

  function updateRail() {
    if (!ticks) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var box = ticks.getBoundingClientRect().height;
    zfill.style.height = (p * box) + "px";
    zhead.style.top = (p * box) + "px";
    zval.textContent = "Z " + (p * 128.4).toFixed(1) + " mm";
  }
  window.addEventListener("scroll", updateRail, { passive: true });
  window.addEventListener("resize", updateRail, { passive: true });

  /* ------------------------------------------------ odsłanianie sekcji */

  var sections = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    sections.forEach(function (el) { io.observe(el); });
  } else {
    sections.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------------------------------------------- formularz wyceny */

  var form = document.getElementById("wycena");
  if (form) {
    var note = document.getElementById("formNote");
    var mailLink = document.getElementById("mailLink");
    var address = mailLink ? mailLink.getAttribute("href").replace("mailto:", "") : "kontakt@fox3d.pl";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var required = ["f-imie", "f-kontakt", "f-opis"];
      var missing = null;

      required.forEach(function (id) {
        var el = document.getElementById(id);
        var ok = el.value.trim() !== "";
        el.closest(".field").classList.toggle("invalid", !ok);
        if (!ok && !missing) missing = el;
      });

      if (missing) {
        note.textContent = "Uzupełnij imię, kontakt zwrotny i opis — bez tego nie wycenimy.";
        note.classList.add("err");
        missing.focus();
        return;
      }

      note.classList.remove("err");
      note.textContent = "Otwieram program pocztowy…";

      var body = [
        "Imię: " + document.getElementById("f-imie").value.trim(),
        "Kontakt: " + document.getElementById("f-kontakt").value.trim(),
        "Materiał: " + document.getElementById("f-material").value,
        "Ilość: " + document.getElementById("f-ilosc").value,
        "",
        "Co drukujemy:",
        document.getElementById("f-opis").value.trim(),
        "",
        "— wysłane ze strony fox3d"
      ].join("\n");

      window.location.href = "mailto:" + address +
        "?subject=" + encodeURIComponent("Wycena druku 3D") +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ------------------------------------------------------------ start */

  var yr = document.getElementById("rok");
  if (yr) yr.textContent = String(new Date().getFullYear());

  syncTheme();
  drawMark();
  sizeHero();
  updateRail();
  if (!reduce && heroCtx) rafId = requestAnimationFrame(drawHero);
})();
