#!/usr/bin/env python3
"""Generuje ikony aplikacji do katalogu icons/.

iOS bierze na ekran początkowy wyłącznie PNG (SVG ignoruje), a w tym
środowisku nie ma żadnej biblioteki graficznej — więc PNG składamy sami
ze zlib i struct. Rysunek to znak marki: siatka 3 x 3 z zaznaczonymi polami.

Uruchomienie:  python3 tools/zrob-ikony.py
"""

import os
import struct
import zlib

TLO = (0x16, 0x17, 0x1C)
AKCENT = (0xE4, 0x81, 0x3C)
JASNY = (0xE9, 0xE7, 0xE2)
CIEMNY = (0x32, 0x34, 0x3E)

# układ znaku — ten sam co .brand__mark w stylach
UKLAD = [
    AKCENT, JASNY, CIEMNY,
    AKCENT, AKCENT, JASNY,
    CIEMNY, AKCENT, CIEMNY,
]

PROBKI = 3  # nadpróbkowanie: 3 x 3 próbki na piksel wygładzają zaokrąglenia


def w_zaokraglonym(px, py, x0, y0, x1, y1, r):
    """Czy punkt leży w prostokącie o zaokrąglonych rogach."""
    if px < x0 or px > x1 or py < y0 or py > y1:
        return False
    # strefy przy rogach sprawdzamy odległością od środka łuku
    cx = min(max(px, x0 + r), x1 - r)
    cy = min(max(py, y0 + r), y1 - r)
    return (px - cx) ** 2 + (py - cy) ** 2 <= r * r


def kolor_punktu(px, py, rozmiar, margines):
    """Kolor w punkcie (px, py) albo None, jeśli to tło."""
    pole = (rozmiar - 2 * margines) / 3.0
    przerwa = pole * 0.14
    bok = pole - przerwa
    promien = bok * 0.22

    for wiersz in range(3):
        for kol in range(3):
            x0 = margines + kol * pole + przerwa / 2
            y0 = margines + wiersz * pole + przerwa / 2
            if w_zaokraglonym(px, py, x0, y0, x0 + bok, y0 + bok, promien):
                return UKLAD[wiersz * 3 + kol]
    return None


def narysuj(rozmiar, udzial_znaku=0.62):
    """Zwraca listę wierszy pikseli (bajty RGB)."""
    bok_znaku = rozmiar * udzial_znaku
    margines = (rozmiar - bok_znaku) / 2.0

    wiersze = []
    krok = 1.0 / PROBKI
    for y in range(rozmiar):
        linia = bytearray()
        for x in range(rozmiar):
            r = g = b = 0
            for sy in range(PROBKI):
                for sx in range(PROBKI):
                    px = x + (sx + 0.5) * krok
                    py = y + (sy + 0.5) * krok
                    kolor = kolor_punktu(px, py, rozmiar, margines) or TLO
                    r += kolor[0]
                    g += kolor[1]
                    b += kolor[2]
            n = PROBKI * PROBKI
            linia += bytes((r // n, g // n, b // n))
        wiersze.append(bytes(linia))
    return wiersze


def kawalek(typ, dane):
    surowe = typ + dane
    return struct.pack(">I", len(dane)) + surowe + struct.pack(">I", zlib.crc32(surowe) & 0xFFFFFFFF)


def zapisz_png(sciezka, rozmiar, wiersze):
    surowe = b"".join(b"\x00" + w for w in wiersze)  # filtr 0 na każdy wiersz
    naglowek = struct.pack(">IIBBBBB", rozmiar, rozmiar, 8, 2, 0, 0, 0)  # 8 bitów, RGB
    png = (b"\x89PNG\r\n\x1a\n"
           + kawalek(b"IHDR", naglowek)
           + kawalek(b"IDAT", zlib.compress(surowe, 9))
           + kawalek(b"IEND", b""))
    with open(sciezka, "wb") as f:
        f.write(png)
    return len(png)


def main():
    katalog = os.path.join(os.path.dirname(__file__), "..", "icons")
    os.makedirs(katalog, exist_ok=True)

    # maskable ma węższy znak — Android przycina ikonę do koła
    zadania = [
        ("icon-180.png", 180, 0.62),
        ("icon-192.png", 192, 0.62),
        ("icon-512.png", 512, 0.62),
        ("icon-maskable-512.png", 512, 0.46),
    ]

    for nazwa, rozmiar, udzial in zadania:
        sciezka = os.path.join(katalog, nazwa)
        bajty = zapisz_png(sciezka, rozmiar, narysuj(rozmiar, udzial))
        print("%-24s %4d x %-4d %6.1f kB" % (nazwa, rozmiar, rozmiar, bajty / 1024))


if __name__ == "__main__":
    main()
