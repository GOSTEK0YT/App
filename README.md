# Biblioteka gier

Małe gry na telefon. Po dodaniu do ekranu początkowego iPhone'a odpalają się
na pełnym ekranie i działają bez internetu — bez App Store, bez konta
developerskiego, bez opłat.

Czysty HTML, CSS i JavaScript. Zero zależności, zero budowania, zero backendu.

| Gra | Co to |
| --- | --- |
| [Piksel](piksel/) | Nonogramy — z liczb przy siatce dedukujesz, które pola zamalować. Plansze bez końca, samouczek w środku. |
| [Bomba](bomba/) | Rozbrajanie ładunku na czas. Instrukcja jest w grze, ale odpowiedzi zależą od tego, co masz przed sobą. |

---

## Jak wrzucić na iPhone'a

Biblioteka musi być pod adresem `https://` — Safari nie zainstaluje strony
z pliku na dysku.

1. Włącz GitHub Pages: **Settings → Pages → Deploy from a branch**, gałąź
   `main`, katalog `/ (root)`. Biblioteka pojawi się pod
   `https://gostek0yt.github.io/App/`.
2. Otwórz ten adres **w Safari** — tylko ona potrafi dodawać do ekranu początkowego.
3. Przycisk *Udostępnij* → **Do ekranu początkowego** → *Dodaj*.

Instalujesz **raz, z ekranu wyboru** — service worker wciąga do pamięci telefonu
obie gry naraz. Dołożenie trzeciej gry nie wymaga instalowania niczego od nowa.

Zadziała też każdy inny hosting z HTTPS (Netlify, Cloudflare Pages) — wszystkie
ścieżki w kodzie są względne, więc katalog można wystawić pod dowolnym adresem.

> **Uwaga przy GitHub Pages:** dla repozytoriów prywatnych Pages działa tylko
> na płatnym planie. Przy darmowym koncie repo musi być publiczne — albo trzeba
> wziąć hosting, który ciągnie prywatne repo za darmo (Netlify, Cloudflare Pages).

**Aktualizacja:** po każdej zmianie w kodzie podnieś `WERSJA` w `sw.js`
(np. `gry-v1` → `gry-v2`). Bez tego telefon będzie pokazywał starą wersję z pamięci.

---

## Struktura

```
.
├── index.html              ekran wyboru gry
├── css/hub.css
├── js/hub.js               przełączniki + rejestracja service workera
├── manifest.webmanifest    nazwa, ikony, tryb pełnoekranowy
├── sw.js                   pamięć offline dla całej biblioteki
├── icons/                  ikony PNG (iOS nie przyjmuje SVG)
├── wspolne/
│   ├── podstawa.css        tokeny kolorów, ekrany, przyciski, plakietki
│   └── wspolne.js          pamięć, motyw, dźwięk, dymek z komunikatem
├── tools/
│   ├── zrob-ikony.py       generuje ikony
│   └── spakuj.py           skleja każdą grę w jeden plik HTML
├── piksel/                 (własne README w środku)
└── bomba/                  (własne README w środku)
```

### Co jest wspólne, a co należy do gry

W `wspolne/` siedzi wyłącznie to, co naprawdę powtarza się wszędzie: paleta,
przyciski, plakietki, ekrany, pamięć, motyw i dźwięk. Ustawienia są wspólne dla
całej biblioteki — motyw przełączony w Pikselu obowiązuje też w Bombie.

Gra może nadpisać dowolny token u siebie. Bomba tak robi: podmienia pomarańcz
biblioteki na czerwień ostrzegawczą, ustawiając `--accent` na początku swojego
arkusza. Reszta komponentów dostosowuje się sama, bo wszystkie kolory czytają
z tokenów.

### Motywy

Paleta jasna siedzi na gołym `:root`, ciemna dokłada się w dwóch miejscach:

```
:root                                    → paleta jasna
@media (prefers-color-scheme: dark)
  :root:not([data-theme="light"])        → ciemna z ustawień systemu
:root[data-theme="dark"]                 → ciemna z przełącznika
```

Żaden kolor nie jest zdefiniowany wyłącznie wewnątrz media query — to
najczęstsza przyczyna stron, które w jednym trybie mają nieczytelny tekst.

---

## Dokładanie kolejnej gry

1. Nowy katalog `nazwa/` z `index.html`, własnym `css/style.css` i skryptami.
2. W `<head>` podepnij najpierw `../wspolne/podstawa.css`, potem swój arkusz.
   W `<body>` najpierw `../wspolne/wspolne.js`, potem swoje skrypty.
3. Dopisz kafel w `index.html` biblioteki.
4. Dopisz pliki do listy `PLIKI` w `sw.js` i podnieś `WERSJA`.
5. Dopisz grę do listy `GRY` w `tools/spakuj.py`, jeśli ma się dać spakować
   do jednego pliku.

Punkt 4 jest jedynym, o którym łatwo zapomnieć — bez niego gra działa online,
ale nie wczyta się bez zasięgu.

---

## Uruchomienie na komputerze

```
python3 -m http.server 8000
```

i `http://localhost:8000/`. Samo otwarcie `index.html` z dysku też zadziała,
ale bez trybu offline — service worker wymaga adresu `http://` lub `https://`.

### Jeden plik do wysłania

```
python3 tools/spakuj.py
```

Tworzy w `dist/` każdą grę jako pojedynczy plik HTML ze stylami, skryptami
i ikoną w środku. Nadaje się do wysłania mailem albo otwarcia z pendrive'a.
Skrypt sam czyta z `index.html`, jakie pliki gra ładuje, więc po dopisaniu
nowego skryptu nie trzeba go nigdzie wpisywać ręcznie.
