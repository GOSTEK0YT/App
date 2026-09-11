const KATEGORIE = [
  { id: 'breloki', nazwa: 'Breloki' },
  { id: 'figurki', nazwa: 'Figurki i fidgety' },
  { id: 'dom', nazwa: 'Do domu' },
  { id: 'biuro', nazwa: 'Biurko i organizacja' },
  { id: 'swieta', nazwa: 'Prezenty i święta' },
  { id: 'custom', nazwa: 'Na zamówienie' }
];

const KOLORY = [
  { id: 'czarny', nazwa: 'Czarny', hex: '#1b1b1e' },
  { id: 'bialy', nazwa: 'Biały', hex: '#f2f2f2' },
  { id: 'pomaranczowy', nazwa: 'Pomarańczowy', hex: '#f26522' },
  { id: 'czerwony', nazwa: 'Czerwony', hex: '#c62828' },
  { id: 'niebieski', nazwa: 'Niebieski', hex: '#1e63c9' },
  { id: 'zielony', nazwa: 'Zielony', hex: '#2e9e5b' },
  { id: 'zolty', nazwa: 'Żółty', hex: '#f2c230' },
  { id: 'fioletowy', nazwa: 'Fioletowy', hex: '#7a3fc4' },
  { id: 'srebrny', nazwa: 'Srebrny', hex: '#b9bec4' },
  { id: 'zloty', nazwa: 'Złoty', hex: '#c9a227' },
  { id: 'rozowy', nazwa: 'Różowy', hex: '#e86aa6' },
  { id: 'przezroczysty', nazwa: 'Transparentny', hex: '#cfe6ef' }
];

const PRODUKTY = [
  {
    id: 'brelok-imie',
    nazwa: 'Brelok z imieniem',
    kategoria: 'breloki',
    cena: 19,
    opis: 'Brelok z dowolnym imieniem lub napisem do 12 znaków. Litery drukowane w drugim kolorze, bez naklejek i farby — napis nie schodzi.',
    dane: ['Wymiar: ok. 70 × 25 mm', 'Materiał: PLA', 'Kółko metalowe w zestawie'],
    tagi: ['personalizacja', 'bestseller'],
    personalizacja: 'Napis na breloku',
    czas: '2–3 dni',
    ksztalt: 'brelok'
  },
  {
    id: 'brelok-tablica',
    nazwa: 'Brelok tablica rejestracyjna',
    kategoria: 'breloki',
    cena: 24,
    opis: 'Miniatura tablicy rejestracyjnej z Twoim numerem. Niebieski pasek z eurogwiazdkami, czarne znaki na białym tle.',
    dane: ['Wymiar: ok. 80 × 18 mm', 'Materiał: PLA', 'Trzy kolory w jednym druku'],
    tagi: ['personalizacja', 'motoryzacja'],
    personalizacja: 'Numer rejestracyjny',
    czas: '2–3 dni',
    ksztalt: 'tablica'
  },
  {
    id: 'brelok-serce',
    nazwa: 'Brelok serce z inicjałami',
    kategoria: 'breloki',
    cena: 22,
    opis: 'Serce z dwiema literami i datą. Popularne na rocznicę i walentynki, pakowane w woreczek prezentowy.',
    dane: ['Wymiar: ok. 45 × 45 mm', 'Materiał: PLA silk', 'Woreczek prezentowy gratis'],
    tagi: ['personalizacja', 'prezent'],
    personalizacja: 'Inicjały i data',
    czas: '2–3 dni',
    ksztalt: 'serce'
  },
  {
    id: 'brelok-zeton',
    nazwa: 'Żeton do wózka',
    kategoria: 'breloki',
    cena: 14,
    opis: 'Żeton wielkości monety 5 zł na kółku do kluczy. Wypuszczasz wózek jednym ruchem, nie szukasz bilonu.',
    dane: ['Średnica: 24 mm', 'Materiał: PETG', 'Możliwy grawer napisu'],
    tagi: ['praktyczne'],
    personalizacja: 'Napis na żetonie (opcjonalnie)',
    czas: '1–2 dni',
    ksztalt: 'zeton'
  },
  {
    id: 'smok-artykulowany',
    nazwa: 'Smok artykułowany',
    kategoria: 'figurki',
    cena: 55,
    opis: 'Ruchomy smok drukowany w całości — wychodzi z drukarki gotowy, każdy segment się rusza. Dostępny w wersji jednolitej i cieniowanej.',
    dane: ['Długość: ok. 24 cm', 'Materiał: PLA / PLA silk', 'Bez klejenia i montażu'],
    tagi: ['bestseller', 'prezent'],
    czas: '3–5 dni',
    ksztalt: 'smok'
  },
  {
    id: 'fidget-slider',
    nazwa: 'Fidget slider',
    kategoria: 'figurki',
    cena: 29,
    opis: 'Magnetyczny slider do ręki. Klik, który uspokaja ręce na nudnym spotkaniu i nie robi hałasu na pół pokoju.',
    dane: ['Wymiar: ok. 70 × 30 mm', 'Materiał: PETG', 'Magnesy neodymowe w zestawie'],
    tagi: ['antystres'],
    czas: '2–3 dni',
    ksztalt: 'slider'
  },
  {
    id: 'osmiornica',
    nazwa: 'Ośmiornica nastrojowa',
    kategoria: 'figurki',
    cena: 25,
    opis: 'Dwustronna ośmiornica — uśmiech z jednej strony, smutek z drugiej. Odwracasz zamiast tłumaczyć, jak się czujesz.',
    dane: ['Średnica: ok. 8 cm', 'Materiał: PLA', 'Dostępna też w rozmiarze XL'],
    tagi: ['bestseller'],
    czas: '2–3 dni',
    ksztalt: 'osmiornica'
  },
  {
    id: 'kot-figurka',
    nazwa: 'Kot low-poly',
    kategoria: 'figurki',
    cena: 39,
    opis: 'Geometryczny kot na półkę lub biurko. Ostre krawędzie ładnie łapią światło, wygląda jak rzeźba, a nie jak wydruk.',
    dane: ['Wysokość: 14 cm', 'Materiał: PLA matowy', 'Podstawa antypoślizgowa'],
    tagi: ['dekoracja'],
    czas: '3–4 dni',
    ksztalt: 'kot'
  },
  {
    id: 'lampka-ksiezyc',
    nazwa: 'Lampka księżyc',
    kategoria: 'dom',
    cena: 89,
    opis: 'Abażur z fakturą księżyca na drewnianej podstawie, ciepłe światło LED z włącznikiem na kablu USB.',
    dane: ['Średnica: 12 cm', 'Materiał: PLA transparentny', 'Zasilanie USB, kabel 1,5 m'],
    tagi: ['dekoracja', 'prezent'],
    czas: '4–6 dni',
    ksztalt: 'lampka'
  },
  {
    id: 'doniczka-geo',
    nazwa: 'Doniczka geometryczna',
    kategoria: 'dom',
    cena: 45,
    opis: 'Osłonka na doniczkę z podstawką łapiącą wodę. Trzy rozmiary, pasuje do sukulentów i ziół z parapetu.',
    dane: ['Wysokość: 10 / 14 / 18 cm', 'Materiał: PETG', 'Odporna na wilgoć'],
    tagi: ['dom'],
    czas: '3–5 dni',
    ksztalt: 'doniczka'
  },
  {
    id: 'wieszak-sciana',
    nazwa: 'Wieszak na kable',
    kategoria: 'dom',
    cena: 18,
    opis: 'Zestaw trzech uchwytów na taśmę 3M. Kable ładowarki zostają na biurku zamiast spadać za mebel.',
    dane: ['Zestaw: 3 sztuki', 'Materiał: PETG', 'Taśma montażowa w zestawie'],
    tagi: ['praktyczne'],
    czas: '1–2 dni',
    ksztalt: 'uchwyt'
  },
  {
    id: 'organizer-biurko',
    nazwa: 'Organizer na biurko',
    kategoria: 'biuro',
    cena: 59,
    opis: 'Moduły na długopisy, karteczki i drobiazgi, łączone na zatrzask. Dokładasz kolejne, kiedy biurko znów rośnie.',
    dane: ['Moduł: 90 × 90 mm', 'Materiał: PLA matowy', 'Zestaw startowy: 3 moduły'],
    tagi: ['praktyczne'],
    czas: '3–5 dni',
    ksztalt: 'organizer'
  },
  {
    id: 'podstawka-telefon',
    nazwa: 'Podstawka pod telefon',
    kategoria: 'biuro',
    cena: 27,
    opis: 'Składana podstawka z regulacją kąta. Mieści się w kieszeni plecaka, trzyma telefon też w etui.',
    dane: ['Trzy kąty nachylenia', 'Materiał: PETG', 'Silikonowe podkładki'],
    tagi: ['praktyczne', 'bestseller'],
    czas: '2–3 dni',
    ksztalt: 'podstawka'
  },
  {
    id: 'uchwyt-sluchawki',
    nazwa: 'Uchwyt na słuchawki',
    kategoria: 'biuro',
    cena: 32,
    opis: 'Wieszak pod blat biurka, montowany na wkręty lub taśmę. Szeroki hak nie odkształca pałąka słuchawek.',
    dane: ['Udźwig: do 2 kg', 'Materiał: PETG', 'Wkręty i taśma w zestawie'],
    tagi: ['gaming'],
    czas: '2–3 dni',
    ksztalt: 'hak'
  },
  {
    id: 'tabliczka-drzwi',
    nazwa: 'Tabliczka na drzwi',
    kategoria: 'biuro',
    cena: 35,
    opis: 'Tabliczka z nazwiskiem lub nazwą firmy, litery w kontrze. Wersja na taśmę albo na wkręty.',
    dane: ['Wymiar: 200 × 60 mm', 'Materiał: PLA', 'Do 24 znaków'],
    tagi: ['personalizacja'],
    personalizacja: 'Treść tabliczki',
    czas: '3–4 dni',
    ksztalt: 'tabliczka'
  },
  {
    id: 'bombki-zestaw',
    nazwa: 'Bombki ażurowe — zestaw',
    kategoria: 'swieta',
    cena: 69,
    opis: 'Sześć bombek z geometrycznym wzorem, lekkich i nietłukących. Przetrwają kota i przeprowadzkę.',
    dane: ['Zestaw: 6 sztuk, średnica 7 cm', 'Materiał: PLA silk', 'Wstążki w zestawie'],
    tagi: ['prezent', 'sezonowe'],
    czas: '4–6 dni',
    ksztalt: 'bombka'
  },
  {
    id: 'pudelko-prezent',
    nazwa: 'Pudełko na drobny prezent',
    kategoria: 'swieta',
    cena: 38,
    opis: 'Pudełko z zasuwanym wieczkiem i napisem na wierzchu. Dobre na bilet, biżuterię albo kopertę z gotówką.',
    dane: ['Wymiar: 90 × 60 × 35 mm', 'Materiał: PLA', 'Napis do 20 znaków'],
    tagi: ['personalizacja', 'prezent'],
    personalizacja: 'Napis na wieczku',
    czas: '3–4 dni',
    ksztalt: 'pudelko'
  },
  {
    id: 'litografia',
    nazwa: 'Litofania ze zdjęcia',
    kategoria: 'swieta',
    cena: 79,
    opis: 'Twoje zdjęcie wydrukowane jako płytka — pod światło pokazuje pełny obraz. Z ramką i podstawką na LED.',
    dane: ['Wymiar: 140 × 100 mm', 'Materiał: PLA biały', 'Podświetlenie USB w zestawie'],
    tagi: ['personalizacja', 'prezent', 'bestseller'],
    personalizacja: 'Zdjęcie wyślij po złożeniu zamówienia',
    czas: '4–6 dni',
    ksztalt: 'litofania'
  },
  {
    id: 'wydruk-projekt',
    nazwa: 'Wydruk z Twojego pliku',
    kategoria: 'custom',
    cena: 0,
    odCeny: true,
    opis: 'Masz gotowy model STL lub 3MF — drukujemy. Wyceniam po obejrzeniu pliku: liczy się masa materiału i czas druku.',
    dane: ['Pole robocze: 256 × 256 × 256 mm', 'Materiały: PLA, PETG, TPU, ASA', 'Warstwa od 0,08 mm'],
    tagi: ['usługa'],
    personalizacja: 'Opisz plik i ilość sztuk',
    czas: 'wycena w 24 h',
    ksztalt: 'plik'
  },
  {
    id: 'projekt-modelu',
    nazwa: 'Projekt modelu 3D',
    kategoria: 'custom',
    cena: 0,
    odCeny: true,
    opis: 'Nie masz pliku, masz pomysł albo zepsutą część. Projektuję model od zera i drukuję pierwszą sztukę.',
    dane: ['Wycena po rozmowie', 'Plik źródłowy przekazuję po opłaceniu', 'Poprawki w cenie projektu'],
    tagi: ['usługa'],
    personalizacja: 'Opisz, co ma powstać',
    czas: 'termin ustalamy',
    ksztalt: 'projekt'
  }
];
