/* ==========================================================================
   BOMBA — moduły
   Każdy typ modułu ma cztery rzeczy: losowanie zawartości, zasadę
   rozwiązania, budowę widoku i tekst do instrukcji.

   Ważne: zasady są zapisane jako dane, a nie jako kod w dwóch miejscach.
   Ta sama lista steruje sprawdzaniem odpowiedzi i tekstem w instrukcji —
   dzięki temu instrukcja nie może skłamać graczowi.
   ========================================================================== */

(function (global) {
  "use strict";

  /* ------------------------------------------------------------ pomocnicze */

  function ile(tablica, wartosc) {
    var n = 0;
    for (var i = 0; i < tablica.length; i++) if (tablica[i] === wartosc) n++;
    return n;
  }
  function ma(tablica, wartosc) { return ile(tablica, wartosc) > 0; }
  function ostatniIndeks(tablica, wartosc) {
    for (var i = tablica.length - 1; i >= 0; i--) if (tablica[i] === wartosc) return i;
    return -1;
  }
  function el(tag, klasa, tekst) {
    var e = document.createElement(tag);
    if (klasa) e.className = klasa;
    if (tekst !== undefined) e.textContent = tekst;
    return e;
  }

  var KOLORY_PRZEWODOW = {
    czerwony: "#D33A2C",
    niebieski: "#3B6FD4",
    zolty: "#E0B023",
    bialy: "#EDEAE3",
    czarny: "#2A2A30"
  };
  var NAZWY_PRZEWODOW = {
    czerwony: "czerwony", niebieski: "niebieski", zolty: "żółty",
    bialy: "biały", czarny: "czarny"
  };

  /* ====================================================== moduł: przewody */

  /* Zasady czytane po kolei — wygrywa pierwsza pasująca.
     Ostatnia w każdej grupie zawsze pasuje, więc odpowiedź istnieje zawsze. */
  var ZASADY_PRZEWODY = {
    3: [
      { opis: "nie ma czerwonego przewodu", tnij: "drugi",
        gdy: function (k) { return !ma(k, "czerwony"); },
        ktory: function () { return 1; } },
      { opis: "ostatni przewód jest biały", tnij: "ostatni",
        gdy: function (k) { return k[k.length - 1] === "bialy"; },
        ktory: function (k) { return k.length - 1; } },
      { opis: "jest więcej niż jeden niebieski", tnij: "ostatni niebieski",
        gdy: function (k) { return ile(k, "niebieski") > 1; },
        ktory: function (k) { return ostatniIndeks(k, "niebieski"); } },
      { opis: "w pozostałych przypadkach", tnij: "ostatni",
        gdy: function () { return true; },
        ktory: function (k) { return k.length - 1; } }
    ],
    4: [
      { opis: "jest więcej niż jeden czerwony, a ostatnia cyfra numeru seryjnego jest nieparzysta",
        tnij: "ostatni czerwony",
        gdy: function (k, b) { return ile(k, "czerwony") > 1 && b.ostatniaNieparzysta; },
        ktory: function (k) { return ostatniIndeks(k, "czerwony"); } },
      { opis: "ostatni przewód jest żółty i nie ma ani jednego czerwonego", tnij: "pierwszy",
        gdy: function (k) { return k[k.length - 1] === "zolty" && !ma(k, "czerwony"); },
        ktory: function () { return 0; } },
      { opis: "jest dokładnie jeden niebieski", tnij: "pierwszy",
        gdy: function (k) { return ile(k, "niebieski") === 1; },
        ktory: function () { return 0; } },
      { opis: "jest więcej niż jeden żółty", tnij: "ostatni",
        gdy: function (k) { return ile(k, "zolty") > 1; },
        ktory: function (k) { return k.length - 1; } },
      { opis: "w pozostałych przypadkach", tnij: "drugi",
        gdy: function () { return true; },
        ktory: function () { return 1; } }
    ],
    5: [
      { opis: "ostatni przewód jest czarny, a ostatnia cyfra numeru seryjnego jest nieparzysta",
        tnij: "czwarty",
        gdy: function (k, b) { return k[k.length - 1] === "czarny" && b.ostatniaNieparzysta; },
        ktory: function () { return 3; } },
      { opis: "jest dokładnie jeden czerwony i więcej niż jeden żółty", tnij: "pierwszy",
        gdy: function (k) { return ile(k, "czerwony") === 1 && ile(k, "zolty") > 1; },
        ktory: function () { return 0; } },
      { opis: "nie ma ani jednego czarnego", tnij: "drugi",
        gdy: function (k) { return !ma(k, "czarny"); },
        ktory: function () { return 1; } },
      { opis: "w pozostałych przypadkach", tnij: "pierwszy",
        gdy: function () { return true; },
        ktory: function () { return 0; } }
    ],
    6: [
      { opis: "nie ma ani jednego żółtego, a ostatnia cyfra numeru seryjnego jest nieparzysta",
        tnij: "trzeci",
        gdy: function (k, b) { return !ma(k, "zolty") && b.ostatniaNieparzysta; },
        ktory: function () { return 2; } },
      { opis: "jest dokładnie jeden żółty i więcej niż jeden biały", tnij: "czwarty",
        gdy: function (k) { return ile(k, "zolty") === 1 && ile(k, "bialy") > 1; },
        ktory: function () { return 3; } },
      { opis: "nie ma ani jednego czerwonego", tnij: "ostatni",
        gdy: function (k) { return !ma(k, "czerwony"); },
        ktory: function (k) { return k.length - 1; } },
      { opis: "w pozostałych przypadkach", tnij: "czwarty",
        gdy: function () { return true; },
        ktory: function () { return 3; } }
    ]
  };

  var przewody = {
    nazwa: "Przewody",
    krotko: "przetnij właściwy przewód",

    utworz: function (bomba, los) {
      var lista = Object.keys(KOLORY_PRZEWODOW);
      var ilePrzewodow = 3 + Math.floor(los() * 4);   /* 3–6 */
      var kolory = [];
      for (var i = 0; i < ilePrzewodow; i++) {
        kolory.push(lista[Math.floor(los() * lista.length)]);
      }
      return { kolory: kolory };
    },

    rozwiaz: function (dane, bomba) {
      var zasady = ZASADY_PRZEWODY[dane.kolory.length];
      for (var i = 0; i < zasady.length; i++) {
        if (zasady[i].gdy(dane.kolory, bomba)) return zasady[i].ktory(dane.kolory);
      }
      return 0;
    },

    zbuduj: function (dane, host, api) {
      var plansza = el("div", "przewody");
      dane.kolory.forEach(function (kolor, i) {
        var rzad = el("button", "przewod");
        rzad.setAttribute("aria-label", "Przetnij przewód " + (i + 1) + ", " + NAZWY_PRZEWODOW[kolor]);

        var numer = el("span", "przewod__nr", String(i + 1));
        var kabel = el("span", "przewod__kabel");
        kabel.style.background = KOLORY_PRZEWODOW[kolor];
        var nazwa = el("span", "przewod__nazwa", NAZWY_PRZEWODOW[kolor]);

        rzad.appendChild(numer);
        rzad.appendChild(kabel);
        rzad.appendChild(nazwa);

        rzad.addEventListener("click", function () {
          if (rzad.classList.contains("is-ciety")) return;
          rzad.classList.add("is-ciety");
          if (i === przewody.rozwiaz(dane, api.bomba)) api.sukces();
          else api.blad("Nie ten przewód");
        });

        plansza.appendChild(rzad);
      });
      host.appendChild(plansza);
    },

    instrukcja: function () {
      var box = el("div");
      box.appendChild(el("p", "instr__wstep",
        "Policz przewody, potem czytaj zasady dla tej liczby od góry. " +
        "Obowiązuje pierwsza, która pasuje — dalszych już nie sprawdzasz."));

      Object.keys(ZASADY_PRZEWODY).forEach(function (ile) {
        box.appendChild(el("h4", "instr__pod", ile + " przewody"));
        var lista = el("ol", "instr__lista");
        ZASADY_PRZEWODY[ile].forEach(function (z) {
          var li = el("li");
          li.appendChild(el("span", "instr__gdy", "Jeśli " + z.opis));
          li.appendChild(el("b", "instr__to", " przetnij " + z.tnij + "."));
          lista.appendChild(li);
        });
        box.appendChild(lista);
      });
      return box;
    }
  };

  /* ======================================================= moduł: przycisk */

  var NAPISY_PRZYCISKU = ["TRZYMAJ", "NATYCHMIAST", "ODPAL", "PRZERWIJ"];
  var KOLORY_PRZYCISKU = { czerwony: "#D33A2C", niebieski: "#3B6FD4", zolty: "#E0B023", bialy: "#EDEAE3" };

  var ZASADY_PRZYCISKU = [
    { opis: "przycisk jest niebieski i pisze na nim TRZYMAJ", akcja: "trzymaj",
      gdy: function (d) { return d.kolor === "niebieski" && d.napis === "TRZYMAJ"; } },
    { opis: "na bombie są więcej niż dwie baterie i pisze NATYCHMIAST", akcja: "kliknij",
      gdy: function (d, b) { return b.baterie > 2 && d.napis === "NATYCHMIAST"; } },
    { opis: "przycisk jest biały i świeci wskaźnik CAR", akcja: "trzymaj",
      gdy: function (d, b) { return d.kolor === "bialy" && b.wskazniki.indexOf("CAR") >= 0; } },
    { opis: "świeci wskaźnik FRK", akcja: "kliknij",
      gdy: function (d, b) { return b.wskazniki.indexOf("FRK") >= 0; } },
    { opis: "przycisk jest czerwony", akcja: "kliknij",
      gdy: function (d) { return d.kolor === "czerwony"; } },
    { opis: "w pozostałych przypadkach", akcja: "trzymaj",
      gdy: function () { return true; } }
  ];

  /* Przy trzymaniu pasek boczny mówi, na jakiej cyfrze zegara puścić. */
  var PASKI = {
    niebieski: { cyfra: "4", nazwa: "niebieski" },
    zolty: { cyfra: "5", nazwa: "żółty" },
    bialy: { cyfra: "1", nazwa: "biały" }
  };

  var przycisk = {
    nazwa: "Przycisk",
    krotko: "kliknij albo przytrzymaj",

    utworz: function (bomba, los) {
      var kolory = Object.keys(KOLORY_PRZYCISKU);
      var paski = Object.keys(PASKI);
      return {
        kolor: kolory[Math.floor(los() * kolory.length)],
        napis: NAPISY_PRZYCISKU[Math.floor(los() * NAPISY_PRZYCISKU.length)],
        pasek: paski[Math.floor(los() * paski.length)],
        trzymany: false
      };
    },

    rozwiaz: function (dane, bomba) {
      for (var i = 0; i < ZASADY_PRZYCISKU.length; i++) {
        if (ZASADY_PRZYCISKU[i].gdy(dane, bomba)) return ZASADY_PRZYCISKU[i].akcja;
      }
      return "trzymaj";
    },

    zbuduj: function (dane, host, api) {
      var box = el("div", "przycisk-box");
      var guzik = el("button", "guzik");
      guzik.style.background = KOLORY_PRZYCISKU[dane.kolor];
      guzik.style.color = (dane.kolor === "bialy" || dane.kolor === "zolty") ? "#1A1A20" : "#FFFFFF";
      guzik.textContent = dane.napis;

      var pasek = el("div", "pasek");
      var zegarek = el("div", "guzik-zegar");
      var podpis = el("p", "przycisk-podpowiedz",
        "Krótkie dotknięcie to kliknięcie. Przytrzymanie zapala pasek z boku.");

      box.appendChild(guzik);
      box.appendChild(pasek);
      box.appendChild(zegarek);
      box.appendChild(podpis);
      host.appendChild(box);

      var oczekiwane = przycisk.rozwiaz(dane, api.bomba);
      var start = 0;
      var trzyma = false;
      var licznik = null;
      var tykanie = null;
      var aktywnyPalec = null;

      function zacznij(ev) {
        /* drugi palec nie zaczyna drugiego trzymania */
        if (aktywnyPalec !== null) return;
        aktywnyPalec = ev.pointerId;
        ev.preventDefault();

        /* Bez przechwycenia wskaźnika palec zsunięty choćby o milimetr poza
           przycisk zabierał ze sobą zdarzenie puszczenia: pasek zostawał
           zapalony, a moduł przestawał reagować aż do kolejnego dotknięcia. */
        try { guzik.setPointerCapture(ev.pointerId); } catch (e) { /* starszy silnik */ }

        start = Date.now();
        trzyma = false;
        licznik = setTimeout(function () {
          trzyma = true;
          pasek.classList.add("is-on");
          pasek.style.background = KOLORY_PRZYCISKU[dane.pasek] || "#EDEAE3";
          /* na jasnym pasku biały napis byłby nieczytelny */
          pasek.style.color = (dane.pasek === "niebieski") ? "#FFFFFF" : "#1A1A20";
          pasek.textContent = "PUŚĆ NA " + PASKI[dane.pasek].cyfra;
          podpis.textContent = "Pasek " + PASKI[dane.pasek].nazwa +
            " — puść w chwili, gdy na zegarze widać gdziekolwiek cyfrę " +
            PASKI[dane.pasek].cyfra + ".";

          /* Zegar jest na górze ekranu, a palec trzyma przycisk na dole —
             bez podglądu tutaj trafienie w cyfrę byłoby zgadywanką. */
          zegarek.classList.add("is-on");
          zegarek.textContent = api.zegar();
          /* co 100 ms, żeby podgląd nie spóźniał się względem prawdziwego
             zegara — przy puszczaniu na konkretnej cyfrze to widać */
          tykanie = setInterval(function () { zegarek.textContent = api.zegar(); }, 100);

          Dzwiek.zagraj(220, 200, 0.04, "square");
        }, 450);
      }

      function zgasPasek() {
        pasek.classList.remove("is-on");
        pasek.textContent = "";
        zegarek.classList.remove("is-on");
        zegarek.textContent = "";
        podpis.textContent = "Krótkie dotknięcie to kliknięcie. Przytrzymanie zapala pasek z boku.";
      }

      function sprzataj(ev) {
        clearTimeout(licznik);
        clearInterval(tykanie);
        tykanie = null;
        aktywnyPalec = null;
        if (ev) zwolnij(ev.pointerId);
        zgasPasek();
      }

      function zwolnij(id) {
        try {
          if (guzik.hasPointerCapture(id)) guzik.releasePointerCapture(id);
        } catch (e) { /* nieistotne */ }
      }

      function skoncz(ev) {
        /* Puszczenie innego palca nie kończy trzymania tego właściwego.
           Bez zerowania aktywnyPalec przycisk zadziałałby tylko raz. */
        if (aktywnyPalec !== ev.pointerId) return;
        aktywnyPalec = null;
        zwolnij(ev.pointerId);

        ev.preventDefault();
        clearTimeout(licznik);
        clearInterval(tykanie);
        tykanie = null;
        var czasTrzymania = Date.now() - start;

        if (!trzyma) {
          /* krótkie dotknięcie */
          if (oczekiwane === "kliknij") api.sukces();
          else api.blad("Ten przycisk trzeba było przytrzymać");
          return;
        }

        zgasPasek();

        if (oczekiwane !== "trzymaj") {
          api.blad("Ten przycisk trzeba było kliknąć");
          return;
        }
        if (czasTrzymania < 700) {
          api.blad("Za krótko — pasek ledwo zdążył się zapalić");
          return;
        }
        /* zegar musi zawierać cyfrę przypisaną do koloru paska */
        if (api.zegar().indexOf(PASKI[dane.pasek].cyfra) >= 0) api.sukces();
        else api.blad("Puszczone na złej cyfrze zegara");
      }

      guzik.addEventListener("pointerdown", zacznij);
      guzik.addEventListener("pointerup", skoncz);
      guzik.addEventListener("pointercancel", sprzataj);
    },

    instrukcja: function () {
      var box = el("div");
      box.appendChild(el("p", "instr__wstep",
        "Czytaj od góry, obowiązuje pierwsza pasująca zasada."));

      var lista = el("ol", "instr__lista");
      ZASADY_PRZYCISKU.forEach(function (z) {
        var li = el("li");
        li.appendChild(el("span", "instr__gdy", "Jeśli " + z.opis));
        li.appendChild(el("b", "instr__to",
          z.akcja === "kliknij" ? " kliknij i puść od razu." : " przytrzymaj."));
        lista.appendChild(li);
      });
      box.appendChild(lista);

      box.appendChild(el("h4", "instr__pod", "Kiedy puścić przytrzymany przycisk"));
      box.appendChild(el("p", "instr__wstep",
        "Przy trzymaniu zapala się pasek, a pod nim podgląd zegara. Puść w chwili, " +
        "gdy na zegarze widać gdziekolwiek podaną cyfrę — pasek wypisuje ją wprost, " +
        "więc tej tabelki nie musisz pamiętać."));
      var tab = el("ul", "instr__lista");
      Object.keys(PASKI).forEach(function (k) {
        tab.appendChild(el("li", null, "Pasek " + PASKI[k].nazwa + " — puść na cyfrze " + PASKI[k].cyfra + "."));
      });
      box.appendChild(tab);
      return box;
    }
  };

  /* ==================================================== moduł: klawiatura */

  var KOLUMNY = [
    ["Ω", "Ψ", "Λ", "★", "¶", "©", "±"],
    ["Ψ", "Ξ", "Σ", "☆", "§", "®", "÷"],
    ["Λ", "Ξ", "Φ", "♦", "¶", "¿", "×"],
    ["Θ", "Σ", "Φ", "♣", "§", "¡", "±"],
    ["Δ", "Ξ", "Θ", "♠", "Æ", "©", "÷"],
    ["Π", "Ω", "Δ", "♥", "Ħ", "µ", "×"]
  ];

  var klawiatura = {
    nazwa: "Klawiatura",
    krotko: "wciśnij symbole we właściwej kolejności",

    utworz: function (bomba, los) {
      for (var proba = 0; proba < 200; proba++) {
        var nr = Math.floor(los() * KOLUMNY.length);
        var kolumna = KOLUMNY[nr].slice();

        /* cztery symbole z jednej kolumny */
        var wybrane = [];
        var kopia = kolumna.slice();
        while (wybrane.length < 4) {
          wybrane.push(kopia.splice(Math.floor(los() * kopia.length), 1)[0]);
        }

        /* muszą pasować tylko do tej jednej kolumny, inaczej zagadka
           miałaby dwie poprawne odpowiedzi */
        var pasujace = KOLUMNY.filter(function (k) {
          return wybrane.every(function (s) { return k.indexOf(s) >= 0; });
        });
        if (pasujace.length !== 1) continue;

        /* kolejność wyświetlania losowa, kolejność wciskania z kolumny */
        var pokaz = wybrane.slice().sort(function () { return los() - 0.5; });
        var kolejnosc = kolumna.filter(function (s) { return wybrane.indexOf(s) >= 0; });
        return { symbole: pokaz, kolejnosc: kolejnosc, wcisniete: [] };
      }
      /* awaryjnie pierwsze cztery z pierwszej kolumny */
      var k = KOLUMNY[0].slice(0, 4);
      return { symbole: k.slice(), kolejnosc: k.slice(), wcisniete: [] };
    },

    zbuduj: function (dane, host, api) {
      var siatka = el("div", "klawiatura");
      dane.symbole.forEach(function (symbol) {
        var klawisz = el("button", "klawisz", symbol);
        klawisz.addEventListener("click", function () {
          if (klawisz.classList.contains("is-on")) return;

          var oczekiwany = dane.kolejnosc[dane.wcisniete.length];
          if (symbol === oczekiwany) {
            dane.wcisniete.push(symbol);
            klawisz.classList.add("is-on");
            Dzwiek.zagraj(660 + dane.wcisniete.length * 80, 70, 0.04);
            if (dane.wcisniete.length === dane.kolejnosc.length) api.sukces();
          } else {
            dane.wcisniete = [];
            Array.prototype.forEach.call(siatka.children, function (k) { k.classList.remove("is-on"); });
            api.blad("Zły symbol — kolejność zaczyna się od nowa");
          }
        });
        siatka.appendChild(klawisz);
      });
      host.appendChild(siatka);
    },

    instrukcja: function () {
      var box = el("div");
      box.appendChild(el("p", "instr__wstep",
        "Znajdź kolumnę, w której występują wszystkie cztery pokazane symbole. " +
        "Taka kolumna jest tylko jedna. Wciskaj symbole w kolejności z góry na dół tej kolumny."));

      var tabela = el("div", "kolumny");
      KOLUMNY.forEach(function (kolumna, i) {
        var box2 = el("div", "kolumna");
        box2.appendChild(el("span", "kolumna__nr", String(i + 1)));
        kolumna.forEach(function (s) { box2.appendChild(el("span", "kolumna__sym", s)); });
        tabela.appendChild(box2);
      });
      box.appendChild(tabela);
      return box;
    }
  };

  /* ===================================================== moduł: sekwencja */

  var BARWY = ["czerwony", "niebieski", "zielony", "zolty"];
  var BARWY_HEX = { czerwony: "#D33A2C", niebieski: "#3B6FD4", zielony: "#3E9E5F", zolty: "#E0B023" };
  var BARWY_NAZWY = { czerwony: "czerwony", niebieski: "niebieski", zielony: "zielony", zolty: "żółty" };

  /* Odpowiedź zależy od tego, czy w numerze seryjnym jest samogłoska,
     oraz od liczby dotychczasowych pomyłek. */
  var TLUMACZ = {
    zSamogloska: [
      { czerwony: "niebieski", niebieski: "czerwony", zielony: "zolty", zolty: "zielony" },
      { czerwony: "zolty", niebieski: "zielony", zielony: "niebieski", zolty: "czerwony" },
      { czerwony: "zielony", niebieski: "zolty", zielony: "czerwony", zolty: "niebieski" }
    ],
    bezSamogloski: [
      { czerwony: "czerwony", niebieski: "zolty", zielony: "zielony", zolty: "niebieski" },
      { czerwony: "niebieski", niebieski: "zielony", zielony: "zolty", zolty: "czerwony" },
      { czerwony: "zolty", niebieski: "czerwony", zielony: "niebieski", zolty: "zielony" }
    ]
  };

  var sekwencja = {
    nazwa: "Sekwencja",
    krotko: "zamień kolory wg tabeli",

    utworz: function (bomba, los) {
      var pelna = [];
      for (var i = 0; i < 4; i++) pelna.push(BARWY[Math.floor(los() * BARWY.length)]);
      return { pelna: pelna, runda: 1, wcisniete: 0 };
    },

    tlumaczenie: function (bomba, bledy) {
      var tabela = bomba.maSamogloske ? TLUMACZ.zSamogloska : TLUMACZ.bezSamogloski;
      return tabela[Math.min(bledy, tabela.length - 1)];
    },

    zbuduj: function (dane, host, api) {
      var box = el("div", "sekwencja");
      var lampki = el("div", "lampki");
      var przyciski = el("div", "lampki");

      var mapaLampek = {};
      BARWY.forEach(function (barwa) {
        var lampka = el("div", "lampka");
        lampka.style.setProperty("--barwa", BARWY_HEX[barwa]);
        mapaLampek[barwa] = lampka;
        lampki.appendChild(lampka);
      });

      var info = el("p", "sekwencja__info", "Runda 1 z 4");
      var odtworz = el("button", "mini-btn", "Odtwórz błyski");

      /* Podczas pokazu i w przerwie między rundami przyciski są martwe.
         Wcześniej dotknięcie koloru w tym momencie liczyło się jako
         odpowiedź na kolejną rundę — i wyglądało to na losową pomyłkę. */
      var odtwarzanie = false;
      var timery = [];
      var klawisze = [];

      function ustawBlokade(zablokowane) {
        odtwarzanie = zablokowane;
        klawisze.forEach(function (k) { k.disabled = zablokowane; });
        odtworz.disabled = zablokowane;
      }

      BARWY.forEach(function (barwa) {
        var b = el("button", "lampka lampka--klik");
        b.style.setProperty("--barwa", BARWY_HEX[barwa]);
        b.setAttribute("aria-label", BARWY_NAZWY[barwa]);
        b.addEventListener("click", function () {
          if (odtwarzanie) return;

          var mapa = sekwencja.tlumaczenie(api.bomba, api.bledy());
          var oczekiwana = mapa[dane.pelna[dane.wcisniete]];
          if (barwa !== oczekiwana) {
            dane.wcisniete = 0;
            api.blad("Zły kolor — runda od nowa");
            /* pomyłka przesuwa tabelę o wiersz niżej, więc podpis musi się zmienić */
            odswiezOpisTabeli();
            return;
          }
          dane.wcisniete++;
          Dzwiek.zagraj(500 + dane.wcisniete * 90, 90, 0.04);
          if (dane.wcisniete === dane.runda) {
            dane.wcisniete = 0;
            if (dane.runda === dane.pelna.length) { api.sukces(); return; }
            dane.runda++;
            info.textContent = "Runda " + dane.runda + " z " + dane.pelna.length;
            ustawBlokade(true);
            timery.push(setTimeout(pokaz, 500));
          }
        });
        klawisze.push(b);
        przyciski.appendChild(b);
      });

      /* Dwa pokazy naraz gasiłyby sobie nawzajem lampki, a stary potrafił
         wejść w nową rundę. Nowy pokaz zawsze najpierw sprząta po poprzednim. */
      function pokaz() {
        timery.forEach(clearTimeout);
        timery = [];
        BARWY.forEach(function (b) { mapaLampek[b].classList.remove("is-on"); });
        ustawBlokade(true);

        var i = 0;
        (function krok() {
          if (i >= dane.runda) { ustawBlokade(false); return; }
          var barwa = dane.pelna[i];
          var lampka = mapaLampek[barwa];
          lampka.classList.add("is-on");
          Dzwiek.zagraj(340 + BARWY.indexOf(barwa) * 110, 220, 0.035);
          timery.push(setTimeout(function () {
            lampka.classList.remove("is-on");
            i++;
            timery.push(setTimeout(krok, 220));
          }, 420));
        })();
      }

      odtworz.addEventListener("click", pokaz);

      /* Najczęstszy błąd: gracz wciska to, co mrugnęło. Ostrzeżenie musi
         być widoczne bez zaglądania do instrukcji. */
      var ostrzezenie = el("p", "sekwencja__uwaga");
      ostrzezenie.innerHTML = "<b>Nie wciskaj tego, co mrugnęło.</b> " +
        "Każdy błysk zamień na inny kolor według tabeli z instrukcji.";

      var ktoraTabela = el("p", "sekwencja__info");
      function odswiezOpisTabeli() {
        ktoraTabela.textContent = "Twoja tabela: " +
          (api.bomba.maSamogloske ? "numer seryjny ma samogłoskę" : "brak samogłoski w numerze") +
          ", pomyłek " + api.bledy() + ".";
      }
      odswiezOpisTabeli();

      /* Oba rzędy to te same cztery kolory — bez podpisów nie wiadomo,
         który jest do patrzenia, a który do klikania. */
      box.appendChild(el("p", "sekwencja__etykieta", "Co mruga"));
      box.appendChild(lampki);
      box.appendChild(info);
      box.appendChild(odtworz);
      box.appendChild(ostrzezenie);
      box.appendChild(ktoraTabela);
      box.appendChild(el("p", "sekwencja__etykieta", "Twoja odpowiedź — tu klikasz"));
      box.appendChild(przyciski);
      host.appendChild(box);

      setTimeout(pokaz, 400);
    },

    instrukcja: function (bomba, bledy) {
      var box = el("div");
      box.appendChild(el("p", "instr__wstep",
        "Moduł mruga kolorami. Nie powtarzaj ich wprost — każdy błysk zamień " +
        "na kolor z tabeli i dopiero ten wciśnij. Po każdej rundzie dochodzi jeden błysk. " +
        "Tabela zależy od tego, czy w numerze seryjnym jest samogłoska, i od liczby pomyłek."));

      var mojKlucz = bomba ? (bomba.maSamogloske ? "zSamogloska" : "bezSamogloski") : null;
      var mojWiersz = bomba ? Math.min(bledy || 0, 2) : -1;

      ["zSamogloska", "bezSamogloski"].forEach(function (klucz) {
        box.appendChild(el("h4", "instr__pod",
          klucz === "zSamogloska"
            ? "Numer seryjny zawiera samogłoskę"
            : "Numer seryjny nie zawiera samogłoski"));

        TLUMACZ[klucz].forEach(function (mapa, ile) {
          /* Tabel jest sześć — bez zaznaczenia tej właściwej gracz i tak
             wybierze złą. Podświetlamy dokładnie tę, która obowiązuje teraz. */
          var moja = klucz === mojKlucz && ile === mojWiersz;
          var naglowek = el("p", "instr__wstep" + (moja ? " instr__teraz" : ""),
            ile + " pomyłek na koncie:" + (moja ? "  ← ta obowiązuje" : ""));
          box.appendChild(naglowek);

          var lista = el("ul", "instr__lista" + (moja ? " instr__lista--teraz" : ""));
          BARWY.forEach(function (b) {
            lista.appendChild(el("li", null,
              "mruga " + BARWY_NAZWY[b] + " → wciśnij " + BARWY_NAZWY[mapa[b]]));
          });
          box.appendChild(lista);
        });
      });
      return box;
    }
  };

  /* ========================================================= moduł: hasło */

  var SLOWNIK = [
    "KOTEK", "DOMEK", "ZAMEK", "RYNEK", "PIWKO", "MLEKO", "SERCE", "WIATR",
    "KWIAT", "RZEKA", "DROGA", "LAMPA", "SZAFA", "KRZAK", "TORBA", "KARTA",
    "RAMKA", "WODKA", "SOKOL", "TRAWA", "ZIMNO", "PLOTY", "MOSTY", "BUREK",
    "PALMA", "CEGLA", "DYNIA", "FARBA", "GRUDA", "HALAS"
  ];
  var ALFABET = "ABCDEFGHIJKLMNOPRSTUWYZ";

  var haslo = {
    nazwa: "Hasło",
    krotko: "ustaw jedyne sensowne słowo",

    utworz: function (bomba, los) {
      for (var proba = 0; proba < 300; proba++) {
        var cel = SLOWNIK[Math.floor(los() * SLOWNIK.length)];
        var kolumny = [];

        for (var i = 0; i < 5; i++) {
          var litery = [cel[i]];
          while (litery.length < 6) {
            var l = ALFABET[Math.floor(los() * ALFABET.length)];
            if (litery.indexOf(l) < 0) litery.push(l);
          }
          litery.sort(function () { return los() - 0.5; });
          kolumny.push(litery);
        }

        /* tylko jedno słowo ze słownika może dać się ułożyć — inaczej
           gracz mógłby wpisać inne poprawne i dostać pomyłkę */
        var mozliwe = SLOWNIK.filter(function (slowo) {
          for (var j = 0; j < 5; j++) if (kolumny[j].indexOf(slowo[j]) < 0) return false;
          return true;
        });
        if (mozliwe.length === 1) {
          return { kolumny: kolumny, cel: cel, pozycje: [0, 0, 0, 0, 0] };
        }
      }
      return null;   /* praktycznie nieosiągalne; poziom podmieni moduł */
    },

    zbuduj: function (dane, host, api) {
      var box = el("div", "haslo");
      var slots = [];

      for (var i = 0; i < 5; i++) {
        (function (idx) {
          var kolumna = el("div", "haslo__kol");
          var gora = el("button", "haslo__strzalka", "▲");
          var litera = el("div", "haslo__litera", dane.kolumny[idx][0]);
          var dol = el("button", "haslo__strzalka", "▼");

          gora.setAttribute("aria-label", "Poprzednia litera na pozycji " + (idx + 1));
          dol.setAttribute("aria-label", "Następna litera na pozycji " + (idx + 1));

          function przesun(o) {
            var n = dane.kolumny[idx].length;
            dane.pozycje[idx] = (dane.pozycje[idx] + o + n) % n;
            litera.textContent = dane.kolumny[idx][dane.pozycje[idx]];
            Dzwiek.zagraj(420, 40, 0.03);
          }
          gora.addEventListener("click", function () { przesun(-1); });
          dol.addEventListener("click", function () { przesun(1); });

          kolumna.appendChild(gora);
          kolumna.appendChild(litera);
          kolumna.appendChild(dol);
          box.appendChild(kolumna);
          slots.push(litera);
        })(i);
      }

      var zatwierdz = el("button", "mini-btn mini-btn--szeroki", "Zatwierdź hasło");
      zatwierdz.addEventListener("click", function () {
        var slowo = slots.map(function (s) { return s.textContent; }).join("");
        if (slowo === dane.cel) api.sukces();
        else api.blad("„" + slowo + "” nic nie znaczy");
      });

      host.appendChild(box);
      host.appendChild(zatwierdz);
    },

    instrukcja: function () {
      var box = el("div");
      box.appendChild(el("p", "instr__wstep",
        "Każda z pięciu pozycji przewija sześć liter. Tylko jedno słowo z listy " +
        "da się ułożyć z dostępnych liter — ustaw je i zatwierdź."));
      var lista = el("div", "slownik");
      SLOWNIK.forEach(function (s) { lista.appendChild(el("span", "slownik__slowo", s)); });
      box.appendChild(lista);
      return box;
    }
  };

  global.Moduly = {
    przewody: przewody,
    przycisk: przycisk,
    klawiatura: klawiatura,
    sekwencja: sekwencja,
    haslo: haslo,
    KOLORY_PRZEWODOW: KOLORY_PRZEWODOW,
    ZASADY_PRZEWODY: ZASADY_PRZEWODY,
    ZASADY_PRZYCISKU: ZASADY_PRZYCISKU,
    KOLUMNY: KOLUMNY,
    SLOWNIK: SLOWNIK
  };
})(typeof window !== "undefined" ? window : globalThis);
