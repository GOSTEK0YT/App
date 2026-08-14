# Bomba — rozbrajanie na czas

Masz ładunek złożony z kilku modułów i instrukcję, która mówi, co z nimi zrobić.
Haczyk polega na tym, że odpowiedzi zależą od numeru seryjnego, wskaźników
i liczby baterii — za każdym razem są inne, więc instrukcji nie da się
przeklikać z pamięci. Moduły rozbrajasz po kolei, od góry.

Instalacja i uruchomienie: patrz [README biblioteki](../README.md).

---

## Zasady ogólne

- Każda pomyłka to **minus 15 sekund**. Po wyczerpaniu limitu ładunek wybucha.
- Zegar chodzi cały czas — także wtedy, gdy czytasz instrukcję.
- Instrukcja sama otwiera się na module, który akurat rozbrajasz.

## Poziomy

| # | Nazwa | Moduły | Czas | Pomyłki |
| --- | --- | --- | --- | --- |
| 1 | Rozgrzewka | 2 | 5:00 | 3 |
| 2 | Trzy kroki | 3 | 4:30 | 3 |
| 3 | Pod presją | 4 | 4:00 | 3 |
| 4 | Ostrożnie | 5 | 3:30 | 3 |
| 5 | Finał | 5, kolejność losowa | 3:00 | 2 |

Kolejny poziom odblokowuje się po rozbrojeniu poprzedniego. Gra zapamiętuje
najlepszy zapas czasu na każdym poziomie.

## Moduły

| Moduł | Na czym polega |
| --- | --- |
| Przewody | Przetnij właściwy przewód. Zasada zależy od liczby przewodów, ich kolorów i ostatniej cyfry numeru seryjnego. |
| Przycisk | Kliknąć czy przytrzymać? A jeśli przytrzymać, to puścić na właściwej cyfrze zegara. |
| Klawiatura | Cztery symbole. Znajdź kolumnę, która zawiera wszystkie, i wciśnij je w jej kolejności. |
| Sekwencja | Moduł mruga kolorami. Nie powtarzaj ich wprost — zamień każdy przez tabelę, która zależy od samogłoski w numerze i od liczby pomyłek. |
| Hasło | Pięć pozycji, każda przewija sześć liter. Tylko jedno słowo z listy da się ułożyć. |

---

## Jak to jest zrobione

### Zasady jako dane, nie jako kod

Największe ryzyko w takiej grze to rozjechanie się instrukcji z kodem
sprawdzającym odpowiedź — gracz czyta jedno, gra oczekuje drugiego i wybucha
mu bomba bez jego winy.

Dlatego zasady są zapisane jako lista obiektów, gdzie warunek i jego opis
leżą obok siebie:

```js
{ opis: "nie ma czerwonego przewodu", tnij: "drugi",
  gdy: function (k) { return !ma(k, "czerwony"); },
  ktory: function () { return 1; } }
```

`rozwiaz()` przechodzi listę i zwraca pierwszy pasujący wynik. `instrukcja()`
przechodzi tę samą listę i renderuje z niej tekst. Nie da się poprawić jednego
bez drugiego, bo to jedno źródło.

Ostatnia zasada w każdej grupie zawsze pasuje (`gdy: () => true`), więc
odpowiedź istnieje zawsze — nie ma układu, w którym gracz nie ma ruchu.

### Losowanie z gwarancją jednoznaczności

Dwa moduły muszą pilnować, żeby zagadka miała **jedno** rozwiązanie:

- **Klawiatura** losuje cztery symbole z jednej kolumny, a potem sprawdza,
  czy nie zawiera ich także inna kolumna. Jeśli tak — losuje od nowa.
- **Hasło** losuje słowo i dokłada do każdej pozycji pięć losowych liter,
  po czym sprawdza, ile słów ze słownika da się z tego ułożyć. Musi wyjść
  dokładnie jedno.

Bez tych sprawdzeń gracz mógłby wpisać poprawną odpowiedź i dostać pomyłkę.

### Numer seryjny

Ostatni znak numeru to zawsze cyfra — kilka zasad pyta o jej parzystość, więc
losowanie musi to gwarantować, inaczej trafiłby się układ bez odpowiedzi.

---

## Testy

Zasady da się sprawdzić bez przeglądarki, bo `moduly.js` i `bomba.js` nie
dotykają DOM-u przy wczytaniu:

```js
require('./js/moduly.js');
require('./js/bomba.js');
const odp = Moduly.przewody.rozwiaz(dane, bomba);
```

Sprawdzone tą drogą: 4000 losowań przewodów (odpowiedź zawsze wskazuje
istniejący przewód), 2000 klawiatur (zawsze dokładnie jedna pasująca kolumna),
1500 haseł (zawsze dokładnie jedno możliwe słowo) i po 200 złożeń każdego
poziomu.
