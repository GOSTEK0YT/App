#!/usr/bin/env python3
"""Skleja stronę w jeden plik HTML — do podglądu i wysyłania bez hostingu.

CSS, JavaScript i obrazki SVG lądują wewnątrz pliku, więc działa
otwarty z dysku, z pendrive'a albo wysłany komuś mailem.

Użycie:
    python3 tools/bundle.py [plik-wyjściowy]      # domyślnie dist/fox3d-podglad.html
    python3 tools/bundle.py --fragment plik.html  # bez <!doctype>, <html>, <head>, <body>
"""

import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def data_uri(rel):
    raw = (ROOT / rel).read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(raw).decode("ascii")


def build(fragment=False):
    html = read("index.html")
    css = read("assets/css/style.css")
    js = read("assets/js/main.js")

    html = html.replace('<link rel="stylesheet" href="assets/css/style.css">',
                        "<style>\n" + css + "\n</style>")
    html = html.replace('<script src="assets/js/main.js"></script>',
                        "<script>\n" + js + "\n</script>")
    html = html.replace('href="favicon.svg"', 'href="' + data_uri("favicon.svg") + '"')
    html = html.replace('src="assets/img/placeholder.svg"',
                        'src="' + data_uri("assets/img/placeholder.svg") + '"')

    if fragment:
        # zostaw samą treść: <title>, <style>, zawartość <body>, <script>
        title = re.search(r"<title>.*?</title>", html, re.S).group(0)
        style = re.search(r"<style>.*?</style>", html, re.S).group(0)
        body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
        html = title + "\n" + style + "\n" + body.strip() + "\n"

    return html


def main():
    args = [a for a in sys.argv[1:]]
    fragment = "--fragment" in args
    args = [a for a in args if a != "--fragment"]
    out = pathlib.Path(args[0]) if args else ROOT / "dist" / "fox3d-podglad.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build(fragment), encoding="utf-8")
    print(f"{out} — {out.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
