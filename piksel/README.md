# Piksel — nonogramy

Logiczna układanka obrazkowa. Liczby przy wierszu i kolumnie mówią, jakie ciągi
zamalowanych pól tam stoją — zadanie polega na wydedukowaniu, gdzie dokładnie.

Instalacja i uruchomienie: patrz [README biblioteki](../README.md).

---

## Zasady

`3 1` przy wierszu oznacza: najpierw trzy pola pod rząd, potem co najmniej jedna
przerwa, potem jedno pole.

- **Maluj** — zamalowuje pole. Dotknięcie zamalowanego kasuje.
- **Odrzuć** — stawia krzyżyk na polu, o którym wiesz, że zostanie puste.
  Krzyżyki to tylko notatki, nie wpływają na rozwiązanie.
- **Palcem po siatce** — malujesz kilka pól naraz. Pociągnięcie zatrzaskuje się
  w poziomie albo w pionie, więc nie da się przypadkiem zamazać po skosie.
- Opis linii **szarzeje**, gdy ta linia zgadza się już z liczbami.

Żadna plansza nie wymaga zgadywania — każdą da się rozwiązać samą logiką.

**Samouczek** w menu przeprowadza przez to wszystko w czterech krokach na małej
planszy. Każdy krok czeka, aż wykonasz ruch — nie da się go przeklikać.

## Tryby

| Tryb | Co robi |
| --- | --- |
| Nowa plansza | Losowana za każdym razem, w rozmiarze 5 × 5, 10 × 10 albo 15 × 15. |
| Obrazek do odkrycia | Plansza z zestawu — po rozwiązaniu odsłania się rysunek. 23 sztuki. |
| Zagadka dnia | Ta sama plansza dla każdego przez cały dzień. |

---

## Struktura

| Ścieżka | Co to |
| --- | --- |
| `index.html` | Ekrany: menu, rozgrywka, okno wygranej. |
| `css/style.css` | Style tej gry (tokeny i wspólne komponenty są w `../wspolne/`). |
| `js/solver.js` | Solver — wylicza, które pola są wymuszone przez opisy. |
| `js/generator.js` | Losowanie plansz i sprawdzanie, czy da się je rozwiązać. |
| `js/art.js` | Zestaw obrazków do odsłonięcia. |
| `js/samouczek.js` | Kroki samouczka: treść, podświetlenie i warunek zaliczenia. |
| `js/board.js` | Rysowanie planszy na canvasie i trafianie w pola. |
| `js/app.js` | Ekrany, dotyk, zapis postępu, statystyki. |
| `tools/sprawdz-obrazki.js` | Sprawdza, czy każdy obrazek da się rozwiązać logiką. |

---

## Jak to jest zrobione

### Jedno rozwiązanie, zawsze

Nonogram wygenerowany na chybił trafił bardzo często ma **kilka poprawnych
rozwiązań** — a wtedy gracz w pewnym momencie musi zgadywać, co psuje całą
zabawę. Dlatego każda plansza przechodzi przez solver, zanim trafi do gry.

Solver działa liniowo: dla danego wiersza wypisuje wszystkie możliwe ułożenia
klocków, odrzuca te sprzeczne z tym, co już stoi na planszy, i sprawdza, które
pola wyszły tak samo we **wszystkich** pozostałych. Takie pola są pewne. To samo
dla kolumn, w kółko, aż przestanie cokolwiek przybywać.

Jeśli tą metodą plansza domknie się do końca, rozwiązanie jest z definicji
jedyne — każde inne musiałoby złamać któryś z tych wymuszonych kroków.

Sprawdzone wyczerpująco: spośród 65 536 możliwych plansz 4 × 4 tych, które
domykają się samą logiką, jest 51 234 — i **żadna** z nich nie ma drugiego
rozwiązania.

### Generowanie

Czysty szum daje mnóstwo jednopolowych klocków: plansza wygląda jak zakłócenia
na ekranie i rzadko domyka się logiką. Dwa przebiegi wygładzania regułą
większości sklejają szum w jedną nudną plamę. Jeden przebieg to złoty środek —
kształty są zwarte, a plansze wychodzą rozwiązywalne w ok. 80% losowań od razu.

Reszta trafia na wspinaczkę: przerzucamy losowe pole i zostawiamy zmianę,
jeśli solver ustalił więcej niż przed nią. W praktyce wystarcza to zawsze,
a najgorszy zmierzony przypadek 15 × 15 to 60 ms.

### Zapis

Postęp leci do `localStorage` po każdym pociągnięciu palcem: stan planszy,
czas, liczba podpowiedzi. Plansza zapisuje się jako ciąg cyfr, nie tablica —
JSON z tablicy 225 liczb jest kilka razy większy niż ten sam stan w tekście.

Klucze: `piksel-zapis`, `piksel-wyniki`, `piksel-ustawienia`, `piksel-dzien`,
`piksel-samouczek`.

---

## Dokładanie obrazków

Obrazki siedzą w `js/art.js` jako zwykłe rysunki tekstem — `#` to pole
zamalowane, `.` puste:

```js
{ name: "Serce", rows: [
  ".#.#.",
  "#####",
  "#####",
  ".###.",
  "..#.."
] }
```

Po dopisaniu obrazka uruchom sprawdzarkę:

```
node tools/sprawdz-obrazki.js
```

Wypisze podgląd każdego rysunku i powie, czy da się go rozwiązać bez zgadywania.
Kod wyjścia 1 przy jakimkolwiek problemie, więc nadaje się prosto do CI.

Symetryczne rysunki lubią mieć po kilka rozwiązań — klasyczny przykład to
iks 5 × 5, którego opisy pasują też do jego lustrzanego odbicia. Sprawdzarka
takie przypadki wyłapuje.
