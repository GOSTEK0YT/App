#!/usr/bin/env python3
"""Skleja każdą grę w jeden plik HTML — bez osobnych plików CSS i JS.

Przydaje się, gdy trzeba komuś wysłać grę mailem, otworzyć ją z dysku
albo wrzucić na hosting przyjmujący pojedynczą stronę.

Skrypt sam czyta z index.html, jakie style i skrypty gra ładuje, więc po
dopisaniu nowego pliku nie trzeba go tu wpisywać ręcznie.

Dla każdej gry powstają dwa pliki w dist/:
  <gra>.html         — kompletna strona z nagłówkiem, do otwarcia z dysku
  <gra>-tresc.html   — sama treść bez <head>, pod hostingi dokładające szkielet

Uruchomienie:  python3 tools/spakuj.py
"""

import base64
import json
import os
import re

BAZA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

GRY = [
    {"katalog": "piksel", "tytul": "Piksel — nonogramy", "nazwa": "Piksel"},
    {"katalog": "bomba", "tytul": "Bomba — rozbrajanie na czas", "nazwa": "Bomba"},
]


def czytaj(sciezka):
    with open(sciezka, encoding="utf-8") as f:
        return f.read()


def zasoby(html, katalog_gry, znacznik, atrybut):
    """Wyciąga ścieżki z <link href> albo <script src> w kolejności z pliku."""
    wzor = r"<%s[^>]*%s=\"([^\"]+)\"[^>]*>" % (znacznik, atrybut)
    sciezki = []
    for trafienie in re.findall(wzor, html):
        if trafienie.startswith(("http:", "https:", "data:")):
            continue
        if trafienie.endswith(".webmanifest") or "icon" in trafienie:
            continue
        sciezki.append(os.path.normpath(os.path.join(katalog_gry, trafienie)))
    return sciezki


def tresc_body(html):
    """Wnętrze <body> bez skryptów i bez powrotu do biblioteki."""
    srodek = re.search(r"<body[^>]*>(.*)</body>", html, re.S).group(1)
    srodek = re.sub(r"<script\b.*?</script>", "", srodek, flags=re.S)
    srodek = re.sub(r"<a class=\"wroc\".*?</a>", "", srodek, flags=re.S)
    return srodek.strip()


def ikona_data_uri():
    with open(os.path.join(BAZA, "icons", "icon-180.png"), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")


def zbuduj(gra):
    katalog = os.path.join(BAZA, gra["katalog"])
    html = czytaj(os.path.join(katalog, "index.html"))

    css = "\n".join(czytaj(p) for p in zasoby(html, katalog, "link", "href"))
    js = "\n".join(czytaj(p) for p in zasoby(html, katalog, "script", "src"))
    body = tresc_body(html)

    pelna = """<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>{tytul}</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#131419" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#EDEBE6" media="(prefers-color-scheme: light)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{nazwa}">
<link rel="apple-touch-icon" href="{ikona}">
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
""".format(tytul=gra["tytul"], nazwa=gra["nazwa"], ikona=ikona_data_uri(),
           css=css, body=body, js=js)

    sama_tresc = """<title>{tytul}</title>
<style>
{css}
</style>
{body}
<script>
{js}
</script>
""".format(tytul=gra["tytul"], css=css, body=body, js=js)

    return pelna, sama_tresc


def js_literal(tekst):
    """Dokument HTML jako literał w JavaScripcie.

    Samo json.dumps nie wystarcza: gdyby w środku został literalny
    `</script>`, przeglądarka zamknęłaby nim otaczający blok skryptu.
    """
    return json.dumps(tekst).replace("</", "<\\/")


def bez_service_workera(js):
    """W jednym pliku nie ma czego rejestrować — obok nie leży sw.js."""
    js = re.sub(
        r'\n\s*if \(!\("serviceWorker" in navigator\).*?\n  \}\);\n',
        "\n",
        js,
        flags=re.S,
    )
    return js.replace(
        'var stan = document.getElementById("stanOffline");',
        'var stan = document.getElementById("stanOffline");\n'
        '  if (stan) stan.textContent = "Wersja w jednym pliku — działa też bez internetu";'
    )


def zbuduj_biblioteke():
    """Cała biblioteka w jednym pliku: ekran wyboru plus obie gry.

    Gry siedzą w ramkach (iframe) ładowanych z pamięci, a nie sklejone
    w jeden dokument. Powód jest prozaiczny: obie używają tych samych
    identyfikatorów (#menuScreen, #gameScreen, #toast), więc w jednym
    dokumencie deptałyby sobie po nogach. Ramka daje im własny świat,
    a że to ta sama strona, ustawienia i zapisy nadal są wspólne.
    """
    html = czytaj(os.path.join(BAZA, "index.html"))
    css = "\n".join(czytaj(p) for p in zasoby(html, BAZA, "link", "href"))
    js = bez_service_workera("\n".join(czytaj(p) for p in zasoby(html, BAZA, "script", "src")))
    body = tresc_body(html)

    gry_html = {}
    for gra in GRY:
        pelna, _ = zbuduj(gra)
        gry_html[gra["katalog"]] = pelna

    zrodla = ",\n".join(
        '  %s: %s' % (json.dumps(gra["katalog"]), js_literal(gry_html[gra["katalog"]]))
        for gra in GRY
    )
    nazwy = ",\n".join(
        '  %s: %s' % (json.dumps(gra["katalog"]), json.dumps(gra["nazwa"]))
        for gra in GRY
    )

    powloka_css = """
.hub[hidden], .widok-gry[hidden] { display: none !important; }
.widok-gry {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  z-index: 50;
}
.pasek-gry {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: calc(6px + env(safe-area-inset-top)) 12px 6px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.pasek-gry__wroc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.pasek-gry__tytul { font-size: 14px; font-weight: 650; color: var(--muted); }
.ramka-gry { flex: 1; width: 100%; border: 0; display: block; }
"""

    router = """
(function () {
  "use strict";
  var ZRODLA = {
%s
  };
  var NAZWY = {
%s
  };

  var hub = document.querySelector(".hub");
  var widok = document.getElementById("widokGry");
  var ramka = document.getElementById("ramkaGry");
  var tytul = document.getElementById("tytulGry");

  function otworz(id) {
    if (!ZRODLA[id]) return;
    tytul.textContent = NAZWY[id];
    ramka.srcdoc = ZRODLA[id];
    widok.hidden = false;
    hub.hidden = true;
    if (location.hash !== "#" + id) location.hash = id;
  }

  function doBiblioteki() {
    /* pusty srcdoc zatrzymuje zegary i dźwięki gry */
    ramka.srcdoc = "";
    widok.hidden = true;
    hub.hidden = false;
    if (location.hash) location.hash = "";
  }

  Array.prototype.forEach.call(document.querySelectorAll(".gra"), function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      otworz((a.getAttribute("href") || "").replace(/\\//g, ""));
    });
  });

  document.getElementById("wrocDoBiblioteki").addEventListener("click", doBiblioteki);

  window.addEventListener("hashchange", function () {
    var id = location.hash.replace("#", "");
    if (id && ZRODLA[id]) otworz(id); else doBiblioteki();
  });

  var start = location.hash.replace("#", "");
  if (start && ZRODLA[start]) otworz(start);
})();
""" % (zrodla, nazwy)

    powloka_body = """
<div class="widok-gry" id="widokGry" hidden>
  <header class="pasek-gry">
    <button class="pasek-gry__wroc" id="wrocDoBiblioteki">‹ Biblioteka</button>
    <span class="pasek-gry__tytul" id="tytulGry"></span>
  </header>
  <!-- bez atrybutu sandbox: ramka ma zostac w tym samym pochodzeniu co powloka,
       inaczej gry straciloby dostep do wspolnych ustawien i zapisow -->
  <iframe class="ramka-gry" id="ramkaGry" title="Gra" allow="autoplay"></iframe>
</div>
"""

    pelna = """<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Biblioteka gier</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#131419" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#EDEBE6" media="(prefers-color-scheme: light)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Gry">
<link rel="apple-touch-icon" href="{ikona}">
<style>
{css}
{powloka_css}
</style>
</head>
<body>
{body}
{powloka_body}
<script>
{js}
{router}
</script>
</body>
</html>
""".format(ikona=ikona_data_uri(), css=css, powloka_css=powloka_css,
           body=body, powloka_body=powloka_body, js=js, router=router)

    sama_tresc = """<title>Biblioteka gier</title>
<style>
{css}
{powloka_css}
</style>
{body}
{powloka_body}
<script>
{js}
{router}
</script>
""".format(css=css, powloka_css=powloka_css, body=body,
           powloka_body=powloka_body, js=js, router=router)

    return pelna, sama_tresc


def main():
    dist = os.path.join(BAZA, "dist")
    os.makedirs(dist, exist_ok=True)

    for gra in GRY:
        pelna, tresc = zbuduj(gra)
        for nazwa, zawartosc in [(gra["katalog"] + ".html", pelna),
                                 (gra["katalog"] + "-tresc.html", tresc)]:
            sciezka = os.path.join(dist, nazwa)
            with open(sciezka, "w", encoding="utf-8") as f:
                f.write(zawartosc)
            print("%-24s %6.1f kB" % (nazwa, len(zawartosc.encode("utf-8")) / 1024))

    pelna, tresc = zbuduj_biblioteke()
    for nazwa, zawartosc in [("gry.html", pelna), ("gry-tresc.html", tresc)]:
        sciezka = os.path.join(dist, nazwa)
        with open(sciezka, "w", encoding="utf-8") as f:
            f.write(zawartosc)
        print("%-24s %6.1f kB  (cała biblioteka)" % (nazwa, len(zawartosc.encode("utf-8")) / 1024))


if __name__ == "__main__":
    main()
