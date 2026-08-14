/* ==========================================================================
   BOMBA — powłoka gry
   Ekrany, zegar, licznik pomyłek, rozbrajanie modułów po kolei i instrukcja.
   Zasady modułów siedzą w moduly.js, skład ładunku w bomba.js.
   ========================================================================== */

(function () {
  "use strict";

  var Moduly = window.Moduly;
  var Ladunek = window.Ladunek;

  var KLUCZ_POSTEP = "bomba-postep";

  function $(id) { return document.getElementById(id); }
  function el(tag, klasa, tekst) {
    var e = document.createElement(tag);
    if (klasa) e.className = klasa;
    if (tekst !== undefined) e.textContent = tekst;
    return e;
  }

  var postep = Pamiec.czytaj(KLUCZ_POSTEP, { odblokowane: 1, rekordy: {} });

  var gra = {
    poziom: null,
    nrPoziomu: 0,
    bomba: null,
    pozostalo: 0,
    bledy: 0,
    trwa: false
  };

  var zegarek = null;

  /* ------------------------------------------------------------- ekrany */

  function pokazEkran(ktory) {
    $("menuScreen").classList.toggle("is-active", ktory === "menu");
    $("gameScreen").classList.toggle("is-active", ktory === "gra");
  }

  /* --------------------------------------------------------------- menu */

  function zbudujMenu() {
    var lista = $("poziomy");
    lista.innerHTML = "";

    Ladunek.POZIOMY.forEach(function (poziom, i) {
      var odblokowany = i < postep.odblokowane;
      var kafel = el("button", "btn poziom");
      if (!odblokowany) kafel.disabled = true;

      var glowna = el("span", "btn__main", (i + 1) + ". " + poziom.nazwa);
      var nota = el("span", "btn__note");

      if (!odblokowany) {
        nota.textContent = "Zablokowany — rozbrój poprzedni ładunek";
      } else {
        var rekord = postep.rekordy[i];
        nota.textContent = poziom.opis +
          (rekord ? "  ·  najlepszy zapas: " + zegarNa(rekord) : "");
      }

      var pasek = el("span", "poziom__meta",
        (poziom.moduly ? poziom.moduly.length : 5) + " modułów · " +
        zegarNa(poziom.czas) + " · " + poziom.bledy + " pomyłki");

      kafel.appendChild(glowna);
      kafel.appendChild(nota);
      kafel.appendChild(pasek);

      kafel.addEventListener("click", function () {
        if (!odblokowany) return;
        start(i);
      });
      lista.appendChild(kafel);
    });
  }

  /* -------------------------------------------------------------- start */

  function start(nr) {
    gra.nrPoziomu = nr;
    gra.poziom = Ladunek.POZIOMY[nr];
    gra.bomba = Ladunek.utworz(gra.poziom);
    gra.pozostalo = gra.poziom.czas;
    gra.bledy = 0;
    gra.trwa = true;

    $("nazwaPoziomu").textContent = (nr + 1) + ". " + gra.poziom.nazwa;
    odswiezDane();
    odswiezModuly();
    odswiezZegar();
    odswiezBledy();
    pokazEkran("gra");
    ruszZegar();

    Dzwiek.zagraj(300, 120, 0.05, "square");
  }

  function ruszZegar() {
    zatrzymajZegar();
    zegarek = setInterval(function () {
      if (!gra.trwa) return;
      gra.pozostalo--;
      odswiezZegar();
      if (gra.pozostalo <= 10 && gra.pozostalo > 0) Dzwiek.zagraj(880, 60, 0.03, "square");
      if (gra.pozostalo <= 0) przegrana("Czas minął");
    }, 1000);
  }
  function zatrzymajZegar() {
    if (zegarek) { clearInterval(zegarek); zegarek = null; }
  }

  function zegarNa(sekundy) {
    if (sekundy < 0) sekundy = 0;
    var m = Math.floor(sekundy / 60);
    var s = sekundy % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  function odswiezZegar() {
    var tekst = zegarNa(gra.pozostalo);
    $("zegar").textContent = tekst;
    $("zegar").classList.toggle("is-krytyczny", gra.pozostalo <= 30);
  }

  function odswiezBledy() {
    var box = $("bledy");
    box.innerHTML = "";
    for (var i = 0; i < gra.poziom.bledy; i++) {
      var kropka = el("span", "blad-kropka" + (i < gra.bledy ? " is-on" : ""));
      box.appendChild(kropka);
    }
    box.setAttribute("aria-label", "Pomyłki: " + gra.bledy + " z " + gra.poziom.bledy);
  }

  function odswiezDane() {
    var b = gra.bomba;
    $("seria").textContent = b.seria;
    $("baterie").textContent = String(b.baterie);
    $("wskazniki").textContent = b.wskazniki.length ? b.wskazniki.join(", ") : "żadne";
  }

  /* ------------------------------------------------------------- moduły */

  function aktywnyIndeks() {
    for (var i = 0; i < gra.bomba.moduly.length; i++) {
      if (!gra.bomba.moduly[i].rozwiazany) return i;
    }
    return -1;
  }

  function odswiezModuly() {
    var lista = $("moduly");
    lista.innerHTML = "";
    var aktywny = aktywnyIndeks();

    gra.bomba.moduly.forEach(function (modul, i) {
      var karta = el("section", "modul");
      var stan = modul.rozwiazany ? "zrobiony" : (i === aktywny ? "aktywny" : "zamkniety");
      karta.classList.add("modul--" + stan);

      var naglowek = el("header", "modul__head");
      naglowek.appendChild(el("span", "modul__nr", String(i + 1)));

      var tytul = el("div", "modul__tytul");
      tytul.appendChild(el("span", "modul__nazwa", modul.nazwa));
      tytul.appendChild(el("span", "modul__krotko",
        modul.rozwiazany ? "rozbrojony" :
        (i === aktywny ? modul.krotko : "czeka na swoją kolej")));
      naglowek.appendChild(tytul);

      var znacznik = el("span", "modul__znak");
      znacznik.textContent = modul.rozwiazany ? "✓" : (i === aktywny ? "●" : "");
      naglowek.appendChild(znacznik);
      karta.appendChild(naglowek);

      if (i === aktywny && !modul.rozwiazany) {
        var cialo = el("div", "modul__cialo");
        Moduly[modul.typ].zbuduj(modul.dane, cialo, zrobApi(modul));
        karta.appendChild(cialo);
      }

      lista.appendChild(karta);
    });

    /* instrukcja sama przeskakuje na aktualnie rozbrajany moduł */
    if (aktywny >= 0) ustawStroneInstrukcji(gra.bomba.moduly[aktywny].typ);
  }

  function zrobApi(modul) {
    return {
      bomba: gra.bomba,
      bledy: function () { return gra.bledy; },
      zegar: function () { return zegarNa(gra.pozostalo); },

      sukces: function () {
        if (!gra.trwa) return;
        modul.rozwiazany = true;
        Dzwiek.zagraj(660, 90, 0.05);
        setTimeout(function () { Dzwiek.zagraj(990, 160, 0.05); }, 100);
        powiedz("Moduł rozbrojony");
        odswiezModuly();
        if (aktywnyIndeks() === -1) wygrana();
      },

      blad: function (powod) {
        if (!gra.trwa) return;
        gra.bledy++;
        gra.pozostalo = Math.max(1, gra.pozostalo - 15);
        odswiezBledy();
        odswiezZegar();
        Dzwiek.szum(220, 0.2);
        document.body.classList.add("trzesie");
        setTimeout(function () { document.body.classList.remove("trzesie"); }, 400);

        if (gra.bledy >= gra.poziom.bledy) {
          przegrana(powod || "Za dużo pomyłek");
        } else {
          powiedz((powod || "Pomyłka") + " — tracisz 15 sekund");
        }
      }
    };
  }

  /* ---------------------------------------------------------- instrukcja */

  var stronaInstrukcji = null;

  function ustawStroneInstrukcji(typ) {
    stronaInstrukcji = typ;
    if (!$("instrukcja").hidden) rysujInstrukcje();
  }

  function rysujInstrukcje() {
    var zakladki = $("instrZakladki");
    var tresc = $("instrTresc");
    zakladki.innerHTML = "";
    tresc.innerHTML = "";

    var typy = gra.bomba
      ? gra.bomba.moduly.map(function (m) { return m.typ; })
      : ["przewody", "przycisk", "klawiatura", "sekwencja", "haslo"];

    /* bez powtórzeń — ten sam typ modułu może wystąpić dwa razy */
    typy = typy.filter(function (t, i) { return typy.indexOf(t) === i; });
    var strony = ["ladunek"].concat(typy);

    if (strony.indexOf(stronaInstrukcji) < 0) stronaInstrukcji = strony[0];

    strony.forEach(function (typ) {
      var nazwa = typ === "ladunek" ? "Ładunek" : Moduly[typ].nazwa;
      var zakladka = el("button", "zakladka" + (typ === stronaInstrukcji ? " is-on" : ""), nazwa);
      zakladka.addEventListener("click", function () {
        stronaInstrukcji = typ;
        rysujInstrukcje();
      });
      zakladki.appendChild(zakladka);
    });

    if (stronaInstrukcji === "ladunek") {
      tresc.appendChild(stronaLadunku());
    } else {
      tresc.appendChild(Moduly[stronaInstrukcji].instrukcja(gra.bomba, gra.bledy));
    }
    tresc.scrollTop = 0;
  }

  function stronaLadunku() {
    var box = el("div");
    box.appendChild(el("p", "instr__wstep",
      "Część zasad zależy nie od modułu, tylko od samego ładunku. Te dane masz " +
      "cały czas na pasku nad modułami."));

    var lista = el("ul", "instr__lista");
    lista.appendChild(el("li", null,
      "Numer seryjny — liczy się jego ostatnia cyfra (parzysta czy nieparzysta) " +
      "oraz to, czy w numerze jest samogłoska. Za samogłoski uznajemy A, E, I, O, U, Y."));
    lista.appendChild(el("li", null,
      "Wskaźniki — trzyliterowe napisy, które świecą się na obudowie. Zasady pytają o FRK i CAR."));
    lista.appendChild(el("li", null,
      "Baterie — ich liczba wpływa na zachowanie przycisku."));
    box.appendChild(lista);

    box.appendChild(el("h4", "instr__pod", "Zasady ogólne"));
    var og = el("ul", "instr__lista");
    og.appendChild(el("li", null, "Moduły rozbraja się po kolei, od góry. Kolejny odblokowuje się po poprzednim."));
    og.appendChild(el("li", null, "Każda pomyłka to minus 15 sekund. Po wyczerpaniu limitu pomyłek ładunek wybucha."));
    og.appendChild(el("li", null, "Zegar zatrzymuje się dopiero po rozbrojeniu ostatniego modułu."));
    box.appendChild(og);

    if (gra.bomba) {
      box.appendChild(el("h4", "instr__pod", "Ten ładunek"));
      var ten = el("ul", "instr__lista");
      ten.appendChild(el("li", null, "Numer seryjny: " + gra.bomba.seria +
        " — ostatnia cyfra " + (gra.bomba.ostatniaNieparzysta ? "nieparzysta" : "parzysta") +
        ", " + (gra.bomba.maSamogloske ? "jest samogłoska" : "brak samogłoski") + "."));
      ten.appendChild(el("li", null, "Wskaźniki: " +
        (gra.bomba.wskazniki.length ? gra.bomba.wskazniki.join(", ") : "żadne nie świecą") + "."));
      ten.appendChild(el("li", null, "Baterie: " + gra.bomba.baterie + "."));
      box.appendChild(ten);
    }
    return box;
  }

  $("instrBtn").addEventListener("click", function () {
    $("instrukcja").hidden = false;
    rysujInstrukcje();
  });
  $("instrZamknij").addEventListener("click", function () {
    $("instrukcja").hidden = true;
  });
  $("instrMenuBtn").addEventListener("click", function () {
    gra.bomba = null;
    $("instrukcja").hidden = false;
    rysujInstrukcje();
  });

  /* ------------------------------------------------------------- koniec */

  function wygrana() {
    gra.trwa = false;
    zatrzymajZegar();

    if (postep.odblokowane < gra.nrPoziomu + 2 &&
        gra.nrPoziomu + 2 <= Ladunek.POZIOMY.length) {
      postep.odblokowane = gra.nrPoziomu + 2;
    }
    var rekord = postep.rekordy[gra.nrPoziomu];
    if (!rekord || gra.pozostalo > rekord) postep.rekordy[gra.nrPoziomu] = gra.pozostalo;
    Pamiec.zapisz(KLUCZ_POSTEP, postep);

    $("wynikTytul").textContent = "Rozbrojona";
    $("wynikOko").textContent = "Bez wybuchu";
    $("wynikOko").className = "wynik__eyebrow wynik__eyebrow--ok";
    $("wynikOpis").textContent = "Zostało " + zegarNa(gra.pozostalo) +
      " i " + (gra.poziom.bledy - gra.bledy) + " nietkniętych pomyłek.";
    $("wynikDalej").hidden = gra.nrPoziomu + 1 >= Ladunek.POZIOMY.length;
    $("wynik").hidden = false;

    [660, 830, 990].forEach(function (f, i) {
      setTimeout(function () { Dzwiek.zagraj(f, 200, 0.05); }, i * 130);
    });
  }

  function przegrana(powod) {
    gra.trwa = false;
    zatrzymajZegar();

    $("wynikTytul").textContent = "Wybuch";
    $("wynikOko").textContent = powod;
    $("wynikOko").className = "wynik__eyebrow wynik__eyebrow--zle";
    $("wynikOpis").textContent = "Rozbrojone moduły: " +
      gra.bomba.moduly.filter(function (m) { return m.rozwiazany; }).length +
      " z " + gra.bomba.moduly.length + ".";
    $("wynikDalej").hidden = true;
    $("wynik").hidden = false;

    Dzwiek.szum(700, 0.35);
    document.body.classList.add("trzesie");
    setTimeout(function () { document.body.classList.remove("trzesie"); }, 600);
  }

  $("wynikPonow").addEventListener("click", function () {
    $("wynik").hidden = true;
    start(gra.nrPoziomu);
  });
  $("wynikDalej").addEventListener("click", function () {
    $("wynik").hidden = true;
    start(Math.min(gra.nrPoziomu + 1, Ladunek.POZIOMY.length - 1));
  });
  $("wynikMenu").addEventListener("click", function () {
    $("wynik").hidden = true;
    doMenu();
  });

  $("backBtn").addEventListener("click", doMenu);

  function doMenu() {
    gra.trwa = false;
    zatrzymajZegar();
    zbudujMenu();
    pokazEkran("menu");
  }

  /* -------------------------------------------------------------- start */

  Motyw.podepnij($("themeBtn"));
  Dzwiek.podepnij($("soundBtn"));

  zbudujMenu();
  pokazEkran("menu");

  window.Bomba = {
    gra: gra,
    start: start,
    moduly: function () { return gra.bomba ? gra.bomba.moduly : []; },
    postep: function () { return postep; }
  };
})();
