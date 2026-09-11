const KSZTALTY = {
  brelok: `<circle cx="34" cy="34" r="11" fill="none" stroke="#b9bec4" stroke-width="4"/>
    <rect x="30" y="42" width="62" height="34" rx="10" fill="#f26522"/>
    <rect x="38" y="54" width="34" height="6" rx="3" fill="#fff"/>
    <rect x="38" y="64" width="20" height="5" rx="2.5" fill="#ffffff" opacity=".6"/>`,
  tablica: `<rect x="16" y="36" width="88" height="30" rx="5" fill="#f2f2f2"/>
    <rect x="16" y="36" width="16" height="30" rx="5" fill="#1e63c9"/>
    <circle cx="24" cy="46" r="2" fill="#f2c230"/><circle cx="24" cy="56" r="2" fill="#f2c230"/>
    <rect x="40" y="46" width="8" height="12" fill="#1b1b1e"/><rect x="52" y="46" width="8" height="12" fill="#1b1b1e"/>
    <rect x="68" y="46" width="8" height="12" fill="#1b1b1e"/><rect x="80" y="46" width="8" height="12" fill="#1b1b1e"/>`,
  serce: `<path d="M60 84 24 52a18 18 0 0 1 26-25l10 10 10-10a18 18 0 0 1 26 25Z" fill="#f26522"/>
    <text x="60" y="58" text-anchor="middle" fill="#fff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">A+B</text>
    <circle cx="60" cy="22" r="6" fill="none" stroke="#b9bec4" stroke-width="3"/>`,
  zeton: `<circle cx="60" cy="56" r="26" fill="#f26522"/><circle cx="60" cy="56" r="19" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>
    <circle cx="60" cy="20" r="8" fill="none" stroke="#b9bec4" stroke-width="4"/>
    <text x="60" y="64" text-anchor="middle" fill="#fff" font-family="system-ui, sans-serif" font-size="22" font-weight="700">5</text>`,
  smok: `<path d="M16 70c14 6 24 2 34-6s18-16 30-16 22 8 24 16" fill="none" stroke="#f26522" stroke-width="12" stroke-linecap="round"/>
    <path d="M26 62l6-10 8 8 8-12 8 10 8-12" fill="none" stroke="#ff7a1a" stroke-width="4"/>
    <circle cx="98" cy="58" r="3" fill="#141416"/>`,
  slider: `<rect x="22" y="40" width="76" height="26" rx="13" fill="#1b1b22" stroke="#f26522" stroke-width="3"/>
    <circle cx="44" cy="53" r="9" fill="#f26522"/><circle cx="76" cy="53" r="9" fill="#b9bec4"/>`,
  osmiornica: `<circle cx="60" cy="46" r="24" fill="#f26522"/>
    <path d="M38 60c-4 12-10 16-16 18m26-14c-2 12-6 18-10 22m20-22c0 12 2 18 4 22m14-26c4 12 8 16 14 18" fill="none" stroke="#f26522" stroke-width="6" stroke-linecap="round"/>
    <circle cx="52" cy="44" r="3" fill="#141416"/><circle cx="68" cy="44" r="3" fill="#141416"/>
    <path d="M52 54q8 6 16 0" fill="none" stroke="#141416" stroke-width="3" stroke-linecap="round"/>`,
  kot: `<polygon points="40,36 44,16 58,32" fill="#b9bec4"/><polygon points="80,36 76,16 62,32" fill="#b9bec4"/>
    <polygon points="38,34 82,34 86,58 60,78 34,58" fill="#f2f2f2"/>
    <polygon points="34,58 60,78 60,92 40,80" fill="#cfd4d8"/>
    <polygon points="86,58 60,78 60,92 80,80" fill="#9aa1a8"/>
    <polygon points="46,46 56,44 50,54" fill="#141416"/><polygon points="74,46 64,44 70,54" fill="#141416"/>
    <polygon points="54,60 66,60 60,68" fill="#f26522"/>`,
  lampka: `<circle cx="60" cy="44" r="24" fill="#f2f2f2" opacity=".9"/>
    <circle cx="52" cy="38" r="5" fill="#cfd4d8"/><circle cx="68" cy="50" r="7" fill="#cfd4d8"/>
    <path d="M44 70h32l6 12H38Z" fill="#8a5a33"/>`,
  doniczka: `<path d="M60 48c0-14 8-22 20-25-1 16-8 23-20 25Z" fill="#2e9e5b"/>
    <path d="M56 48c-3-12-11-17-22-18 4 13 11 18 22 18Z" fill="#3fb571"/>
    <path d="M58 30v20" stroke="#2e9e5b" stroke-width="3"/>
    <path d="M34 50h52l-8 34H42Z" fill="#f26522"/>
    <path d="M34 50h52v8H34Z" fill="#ff7a1a"/>
    <path d="M40 84h40l2 6H38Z" fill="#c24d15"/>`,
  uchwyt: `<rect x="22" y="30" width="10" height="48" rx="3" fill="#b9bec4"/>
    <path d="M32 40h22a12 12 0 0 1 0 24H44" fill="none" stroke="#f26522" stroke-width="9" stroke-linecap="round"/>
    <path d="M44 64c14 8 26 6 38-4" fill="none" stroke="#f2f2f2" stroke-width="5" stroke-linecap="round"/>
    <rect x="80" y="52" width="16" height="10" rx="3" fill="#b9bec4"/>`,
  organizer: `<rect x="22" y="44" width="34" height="36" rx="5" fill="#f26522"/>
    <rect x="60" y="34" width="22" height="46" rx="5" fill="#ff7a1a"/>
    <rect x="86" y="52" width="16" height="28" rx="5" fill="#b9bec4"/>
    <rect x="66" y="24" width="4" height="14" rx="2" fill="#f2f2f2"/><rect x="74" y="20" width="4" height="18" rx="2" fill="#f2f2f2"/>`,
  podstawka: `<path d="M30 78h58l-8-12H38Z" fill="#f26522"/>
    <rect x="48" y="24" width="30" height="46" rx="4" transform="rotate(10 63 47)" fill="#1b1b22" stroke="#b9bec4" stroke-width="2"/>`,
  hak: `<rect x="24" y="30" width="72" height="8" rx="4" fill="#b9bec4"/>
    <path d="M60 38v16a14 14 0 0 0 28 0" fill="none" stroke="#f26522" stroke-width="8" stroke-linecap="round"/>
    <path d="M46 56a16 16 0 0 1 32 0" fill="none" stroke="#f2f2f2" stroke-width="6"/>`,
  tabliczka: `<rect x="18" y="38" width="84" height="30" rx="6" fill="#f26522"/>
    <rect x="28" y="48" width="40" height="5" rx="2.5" fill="#fff"/>
    <rect x="28" y="57" width="24" height="4" rx="2" fill="#fff" opacity=".6"/>
    <circle cx="88" cy="53" r="4" fill="#141416" opacity=".3"/>`,
  bombka: `<circle cx="60" cy="56" r="24" fill="none" stroke="#f26522" stroke-width="4"/>
    <path d="M36 56h48M60 32v48M43 39l34 34M77 39L43 73" stroke="#ff7a1a" stroke-width="3"/>
    <rect x="54" y="24" width="12" height="8" rx="2" fill="#b9bec4"/>`,
  pudelko: `<path d="M28 46h64v34H28Z" fill="#f26522"/><path d="M28 46l12-12h64l-12 12Z" fill="#ff7a1a"/>
    <path d="M92 46l12-12v34l-12 12Z" fill="#c24d15"/>
    <rect x="44" y="58" width="32" height="6" rx="3" fill="#fff"/>`,
  litofania: `<rect x="26" y="24" width="68" height="48" rx="4" fill="#f2f2f2"/>
    <polygon points="34,66 52,42 64,58 74,48 86,66" fill="#b9bec4"/>
    <circle cx="76" cy="36" r="6" fill="#f26522"/>
    <rect x="42" y="76" width="36" height="6" rx="3" fill="#1b1b22" stroke="#f26522" stroke-width="2"/>`,
  plik: `<path d="M38 22h30l16 16v44H38Z" fill="#1b1b22" stroke="#f26522" stroke-width="3"/>
    <path d="M68 22v16h16" fill="none" stroke="#f26522" stroke-width="3"/>
    <polygon points="61,48 76,57 61,66 46,57" fill="#f26522"/>
    <polygon points="46,57 61,66 61,78 46,69" fill="#ff7a1a"/><polygon points="76,57 61,66 61,78 76,69" fill="#c24d15"/>`,
  projekt: `<polygon points="60,22 94,42 94,70 60,90 26,70 26,42" fill="none" stroke="#f26522" stroke-width="3"/>
    <polygon points="60,22 94,42 60,62 26,42" fill="#f26522" opacity=".85"/>
    <path d="M60 62v28M26 42v28m68-28v28" stroke="#ff7a1a" stroke-width="3"/>`
};

const IKONY = {
  breloki: KSZTALTY.brelok,
  figurki: KSZTALTY.smok,
  dom: KSZTALTY.lampka,
  biuro: KSZTALTY.organizer,
  swieta: KSZTALTY.pudelko,
  custom: KSZTALTY.projekt
};

const grafika = (ksztalt) =>
  `<svg viewBox="0 0 120 100" aria-hidden="true">${KSZTALTY[ksztalt] || KSZTALTY.projekt}</svg>`;

const zl = (kwota) => kwota.toFixed(2).replace('.', ',') + ' zł';

const produkt = (id) => PRODUKTY.find((p) => p.id === id);

const kolor = (id) => KOLORY.find((k) => k.id === id);

const KLUCZ = 'fox3d-koszyk';

const wczytajKoszyk = () => {
  try {
    const dane = JSON.parse(localStorage.getItem(KLUCZ));
    return Array.isArray(dane) ? dane.filter((p) => produkt(p.id)) : [];
  } catch {
    return [];
  }
};

let koszyk = wczytajKoszyk();

const zapisz = () => {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify(koszyk));
  } catch {}
  odswiezLicznik();
  document.dispatchEvent(new CustomEvent('koszyk-zmiana'));
};

const sumaKoszyka = () =>
  koszyk.reduce((suma, poz) => suma + produkt(poz.id).cena * poz.ilosc, 0);

const sztukiKoszyka = () => koszyk.reduce((suma, poz) => suma + poz.ilosc, 0);

const maWycene = () => koszyk.some((poz) => produkt(poz.id).odCeny);

const dodajDoKoszyka = (id, opcje = {}) => {
  const wariant = JSON.stringify([opcje.kolor || null, opcje.napis || '']);
  const istnieje = koszyk.find((poz) => poz.id === id && poz.wariant === wariant);
  if (istnieje) {
    istnieje.ilosc += opcje.ilosc || 1;
  } else {
    koszyk.push({
      id,
      wariant,
      kolor: opcje.kolor || null,
      napis: opcje.napis || '',
      ilosc: opcje.ilosc || 1
    });
  }
  zapisz();
  pokazKomunikat(produkt(id).nazwa + ' — dodane do koszyka');
};

const zmienIlosc = (indeks, roznica) => {
  const poz = koszyk[indeks];
  if (!poz) return;
  poz.ilosc += roznica;
  if (poz.ilosc < 1) koszyk.splice(indeks, 1);
  zapisz();
};

const usunZKoszyka = (indeks) => {
  koszyk.splice(indeks, 1);
  zapisz();
};

const wyczyscKoszyk = () => {
  koszyk = [];
  zapisz();
};

let licznikTimer;

function pokazKomunikat(tekst) {
  const box = document.getElementById('komunikat');
  if (!box) return;
  box.textContent = tekst;
  box.dataset.widoczny = '1';
  clearTimeout(licznikTimer);
  licznikTimer = setTimeout(() => (box.dataset.widoczny = '0'), 2600);
}

function odswiezLicznik() {
  document.querySelectorAll('[data-licznik]').forEach((el) => {
    const ile = sztukiKoszyka();
    el.textContent = ile;
    el.hidden = ile === 0;
  });
}

function kartaProduktu(p) {
  const tag = p.tagi.includes('bestseller') ? 'Bestseller' : p.tagi.includes('usługa') ? 'Usługa' : '';
  return `<article class="karta">
    <button class="karta__obraz" data-podglad="${p.id}" aria-label="Zobacz szczegóły: ${p.nazwa}">
      ${tag ? `<span class="karta__tag">${tag}</span>` : ''}
      ${grafika(p.ksztalt)}
    </button>
    <div class="karta__tresc">
      <h3>${p.nazwa}</h3>
      <p class="karta__opis">${p.opis}</p>
      <div class="karta__stopka">
        <span class="cena">${p.odCeny ? 'Wycena' : zl(p.cena)}<small>${p.czas}</small></span>
        <button class="karta__btn" data-podglad="${p.id}">${p.odCeny ? 'Zapytaj' : 'Wybierz'}</button>
      </div>
    </div>
  </article>`;
}

function wyswietlProdukty(kontener, lista) {
  kontener.innerHTML = lista.length
    ? lista.map(kartaProduktu).join('')
    : '<p class="pusto">Brak produktów w tej kategorii.</p>';
}

let wybranyKolor = KOLORY[0].id;

function otworzPodglad(id) {
  const p = produkt(id);
  const okno = document.getElementById('modalTresc');
  if (!p || !okno) return;
  wybranyKolor = KOLORY[0].id;
  okno.innerHTML = `
    <div class="modal__siatka">
      <div class="modal__obraz">${grafika(p.ksztalt)}</div>
      <div class="modal__tresc">
        <p class="nadtytul">${KATEGORIE.find((k) => k.id === p.kategoria).nazwa}</p>
        <h2>${p.nazwa}</h2>
        <p class="modal__opis">${p.opis}</p>
        <ul class="dane">${p.dane.map((d) => `<li>${d}</li>`).join('')}</ul>
        <label class="pole">
          <span>Kolor filamentu — <b id="nazwaKoloru">${KOLORY[0].nazwa}</b></span>
          <div class="kolory" id="kolory">
            ${KOLORY.map(
              (k) =>
                `<button type="button" class="kolor" data-kolor="${k.id}" title="${k.nazwa}" aria-label="${k.nazwa}" aria-pressed="${k.id === wybranyKolor}" style="background:${k.hex}"></button>`
            ).join('')}
          </div>
        </label>
        ${
          p.personalizacja
            ? `<label class="pole"><span>${p.personalizacja}</span><input id="napis" type="text" maxlength="80" placeholder="np. Fox3D"></label>`
            : ''
        }
        <label class="pole"><span>Ilość</span><input id="ilosc" type="number" min="1" max="99" value="1"></label>
        <div class="karta__stopka">
          <span class="cena">${p.odCeny ? 'Wycena indywidualna' : zl(p.cena)}<small>Realizacja: ${p.czas}</small></span>
        </div>
        <button class="btn btn--pelny" id="dodaj" data-id="${p.id}">${p.odCeny ? 'Wyślij do wyceny' : 'Dodaj do koszyka'}</button>
        <p class="uwaga">Kolor możesz zmienić także w wiadomości po złożeniu zamówienia. Jeśli danego koloru chwilowo brakuje, odzywam się przed drukiem.</p>
      </div>
    </div>`;
  document.getElementById('modal').dataset.otwarte = '1';
  document.body.style.overflow = 'hidden';
}

function zamknijModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.dataset.otwarte = '0';
  document.body.style.overflow = '';
}

function rysujKoszyk() {
  const lista = document.getElementById('panelLista');
  const suma = document.getElementById('panelSuma');
  if (!lista) return;
  if (!koszyk.length) {
    lista.innerHTML = '<p class="pusto">Koszyk jest pusty.<br>Wybierz coś ze sklepu — albo zamów wydruk z własnego pliku.</p>';
  } else {
    lista.innerHTML = koszyk
      .map((poz, i) => {
        const p = produkt(poz.id);
        const k = kolor(poz.kolor);
        return `<div class="poz">
          <span class="poz__obraz">${grafika(p.ksztalt)}</span>
          <div>
            <b>${p.nazwa}</b>
            <div class="poz__meta">${k ? k.nazwa : 'Kolor do ustalenia'}${poz.napis ? ` · „${poz.napis}”` : ''}</div>
            <div class="ilosc">
              <button type="button" data-mniej="${i}" aria-label="Mniej">−</button>
              <span>${poz.ilosc}</span>
              <button type="button" data-wiecej="${i}" aria-label="Więcej">+</button>
            </div>
          </div>
          <div class="poz__prawo">
            <b>${p.odCeny ? 'wycena' : zl(p.cena * poz.ilosc)}</b>
            <button class="karta__btn" type="button" data-usun="${i}">Usuń</button>
          </div>
        </div>`;
      })
      .join('');
  }
  if (suma) suma.textContent = zl(sumaKoszyka());
  const przycisk = document.getElementById('doZamowienia');
  if (przycisk) {
    const pusty = koszyk.length === 0;
    przycisk.classList.toggle('btn--nieaktywny', pusty);
    przycisk.setAttribute('aria-disabled', String(pusty));
  }
}

function obslugaPanelu() {
  const panel = document.getElementById('panel');
  const zaslona = document.getElementById('zaslona');
  if (!panel) return;
  const otworz = () => {
    rysujKoszyk();
    panel.dataset.otwarte = '1';
    zaslona.dataset.otwarte = '1';
  };
  const zamknij = () => {
    panel.dataset.otwarte = '0';
    zaslona.dataset.otwarte = '0';
  };
  document.querySelectorAll('[data-koszyk]').forEach((b) => b.addEventListener('click', otworz));
  document.querySelectorAll('[data-zamknij-panel]').forEach((b) => b.addEventListener('click', zamknij));
  zaslona.addEventListener('click', zamknij);
  document.addEventListener('koszyk-zmiana', rysujKoszyk);
}

function obslugaMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const otwarte = menu.dataset.otwarte === '1';
    menu.dataset.otwarte = otwarte ? '0' : '1';
    burger.setAttribute('aria-expanded', String(!otwarte));
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.dataset.otwarte = '0';
      burger.setAttribute('aria-expanded', 'false');
    })
  );
}

document.addEventListener('click', (e) => {
  const podglad = e.target.closest('[data-podglad]');
  if (podglad) {
    otworzPodglad(podglad.dataset.podglad);
    return;
  }
  if (e.target.closest('[data-zamknij-modal]')) zamknijModal();
  const kolorBtn = e.target.closest('[data-kolor]');
  if (kolorBtn) {
    wybranyKolor = kolorBtn.dataset.kolor;
    document
      .querySelectorAll('[data-kolor]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kolor === wybranyKolor)));
    const nazwa = document.getElementById('nazwaKoloru');
    if (nazwa) nazwa.textContent = kolor(wybranyKolor).nazwa;
  }
  const dodaj = e.target.closest('#dodaj');
  if (dodaj) {
    const napis = document.getElementById('napis');
    const ilosc = document.getElementById('ilosc');
    dodajDoKoszyka(dodaj.dataset.id, {
      kolor: wybranyKolor,
      napis: napis ? napis.value.trim() : '',
      ilosc: Math.max(1, Math.min(99, Number(ilosc ? ilosc.value : 1) || 1))
    });
    zamknijModal();
  }
  const mniej = e.target.closest('[data-mniej]');
  if (mniej) zmienIlosc(Number(mniej.dataset.mniej), -1);
  const wiecej = e.target.closest('[data-wiecej]');
  if (wiecej) zmienIlosc(Number(wiecej.dataset.wiecej), 1);
  const usun = e.target.closest('[data-usun]');
  if (usun) usunZKoszyka(Number(usun.dataset.usun));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') zamknijModal();
});

document.addEventListener('DOMContentLoaded', () => {
  odswiezLicznik();
  obslugaPanelu();
  obslugaMenu();
  const rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();
});
