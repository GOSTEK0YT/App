const DOSTAWY = [
  { id: 'paczkomat', nazwa: 'Paczkomat InPost', cena: 12, opis: 'Dostawa 1–2 dni robocze' },
  { id: 'kurier', nazwa: 'Kurier InPost', cena: 17, opis: 'Dostawa następnego dnia roboczego' },
  { id: 'odbior', nazwa: 'Odbiór osobisty', cena: 0, opis: 'Po umówieniu terminu' }
];

const DARMOWA_OD = 200;

const numerZamowienia = () =>
  'FOX-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 900) + 100);

document.addEventListener('DOMContentLoaded', () => {
  const podsumowanie = document.getElementById('podsumowanie');
  const wyborDostawy = document.getElementById('dostawa');
  const formularz = document.getElementById('formularzZamowienia');
  const potwierdzenie = document.getElementById('potwierdzenie');
  if (!podsumowanie || !formularz) return;

  wyborDostawy.innerHTML = DOSTAWY.map(
    (d) => `<option value="${d.id}">${d.nazwa} — ${d.cena ? zl(d.cena) : 'gratis'} (${d.opis})</option>`
  ).join('');

  const kosztDostawy = () => {
    const wybrana = DOSTAWY.find((d) => d.id === wyborDostawy.value) || DOSTAWY[0];
    if (wybrana.id !== 'odbior' && sumaKoszyka() >= DARMOWA_OD) return 0;
    return wybrana.cena;
  };

  const rysuj = () => {
    if (!koszyk.length) {
      podsumowanie.innerHTML =
        '<p class="pusto">Koszyk jest pusty.<br><a class="btn btn--obrys" style="margin-top:18px" href="sklep.html">Wróć do sklepu</a></p>';
      formularz.hidden = true;
      return;
    }
    formularz.hidden = false;
    const wiersze = koszyk
      .map((poz) => {
        const p = produkt(poz.id);
        const k = kolor(poz.kolor);
        return `<div class="wiersz">
          <span>${p.nazwa} × ${poz.ilosc}<br><small>${k ? k.nazwa : 'kolor do ustalenia'}${poz.napis ? ` · „${poz.napis}”` : ''}</small></span>
          <span>${p.odCeny ? 'wycena' : zl(p.cena * poz.ilosc)}</span>
        </div>`;
      })
      .join('');
    const dostawa = kosztDostawy();
    podsumowanie.innerHTML =
      wiersze +
      `<div class="wiersz"><span>Dostawa</span><span>${dostawa ? zl(dostawa) : 'gratis'}</span></div>` +
      (maWycene()
        ? '<div class="wiersz"><span>Pozycje na wycenę</span><span>doliczę po sprawdzeniu pliku</span></div>'
        : '') +
      `<div class="wiersz wiersz--suma"><span>Do zapłaty</span><span>${zl(sumaKoszyka() + dostawa)}</span></div>` +
      (sumaKoszyka() < DARMOWA_OD
        ? `<p class="uwaga">Do darmowej wysyłki brakuje ${zl(DARMOWA_OD - sumaKoszyka())}.</p>`
        : '<p class="uwaga">Wysyłka gratis — zamówienie przekracza 200 zł.</p>');
  };

  const trescZamowienia = (dane, numer) => {
    const dostawa = DOSTAWY.find((d) => d.id === wyborDostawy.value);
    const pozycje = koszyk
      .map((poz) => {
        const p = produkt(poz.id);
        const k = kolor(poz.kolor);
        return `- ${p.nazwa} × ${poz.ilosc} | ${k ? k.nazwa : 'kolor do ustalenia'}${poz.napis ? ` | napis: ${poz.napis}` : ''} | ${p.odCeny ? 'do wyceny' : zl(p.cena * poz.ilosc)}`;
      })
      .join('\n');
    return [
      `Zamówienie ${numer}`,
      '',
      pozycje,
      '',
      `Dostawa: ${dostawa.nazwa} (${kosztDostawy() ? zl(kosztDostawy()) : 'gratis'})`,
      `Razem: ${zl(sumaKoszyka() + kosztDostawy())}${maWycene() ? ' + wycena pozycji indywidualnych' : ''}`,
      '',
      `Imię i nazwisko: ${dane.imie}`,
      `E-mail: ${dane.email}`,
      `Telefon: ${dane.telefon}`,
      `Adres / paczkomat: ${dane.adres}`,
      `Uwagi: ${dane.uwagi || 'brak'}`
    ].join('\n');
  };

  wyborDostawy.addEventListener('change', rysuj);
  document.addEventListener('koszyk-zmiana', rysuj);

  formularz.addEventListener('submit', (e) => {
    e.preventDefault();
    const dane = Object.fromEntries(new FormData(formularz).entries());
    const numer = numerZamowienia();
    const tresc = trescZamowienia(dane, numer);
    potwierdzenie.hidden = false;
    potwierdzenie.innerHTML = `
      <h3>Zamówienie ${numer} gotowe do wysłania</h3>
      <p class="uwaga">Kliknij przycisk poniżej — otworzy się wiadomość do kontakt@fox3d.pl z całym zamówieniem. Odpisuję z potwierdzeniem i danymi do przelewu w ciągu 24 godzin.</p>
      <pre class="podglad">${tresc.replace(/</g, '&lt;')}</pre>
      <div class="hero__akcje">
        <a class="btn" href="mailto:kontakt@fox3d.pl?subject=${encodeURIComponent('Zamówienie ' + numer)}&body=${encodeURIComponent(tresc)}">Wyślij e-mailem</a>
        <button class="btn btn--obrys" type="button" id="kopiuj">Skopiuj treść</button>
      </div>`;
    potwierdzenie.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('kopiuj').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(tresc);
        pokazKomunikat('Treść zamówienia skopiowana');
      } catch {
        pokazKomunikat('Zaznacz treść i skopiuj ręcznie');
      }
    });
  });

  rysuj();
});
