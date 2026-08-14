/* Sprawdza zestaw obrazków z js/art.js:
   — czy każdy jest prostokątem o zgodnych bokach,
   — czy da się go rozwiązać samą logiką (bez zgadywania),
   — i rysuje podgląd w terminalu.

   Uruchomienie:  node tools/sprawdz-obrazki.js
   Kod wyjścia 1, gdy cokolwiek jest nie tak — nadaje się do CI. */

var path = require("path");
var base = path.join(__dirname, "..", "js");

require(path.join(base, "solver.js"));
require(path.join(base, "generator.js"));
require(path.join(base, "art.js"));

var Solver = globalThis.Solver;
var Generator = globalThis.Generator;
var Art = globalThis.Art;

var problems = 0;
var total = 0;

Object.keys(Art).forEach(function (size) {
  var n = parseInt(size, 10);
  console.log("\n=== " + n + "x" + n + " ===");

  Art[size].forEach(function (entry) {
    total++;
    var rows = entry.rows;
    var bad = [];

    if (rows.length !== n) bad.push("wierszy " + rows.length + ", ma być " + n);
    rows.forEach(function (r, i) {
      if (r.length !== n) bad.push("wiersz " + i + " ma " + r.length + " znaków, ma być " + n);
      if (/[^#.]/.test(r)) bad.push("wiersz " + i + " zawiera coś innego niż # i .");
    });

    if (bad.length) {
      problems++;
      console.log("  ✗ " + entry.name + " — " + bad.join("; "));
      return;
    }

    var puzzle = Generator.fromArt(entry);
    var logical = Generator.isLogical(puzzle.solution, puzzle.w, puzzle.h);
    var filled = 0;
    for (var i = 0; i < puzzle.solution.length; i++) filled += puzzle.solution[i];

    if (!logical) {
      problems++;
      var score = Generator.logicScore(puzzle.solution, puzzle.w, puzzle.h);
      console.log("  ✗ " + entry.name + " — wymaga zgadywania (logika ustala " +
        score + "/" + (n * n) + " pól)");
    } else {
      console.log("  ✓ " + entry.name + " — " + filled + " pól");
    }

    var art = "";
    for (var y = 0; y < n; y++) {
      art += "      ";
      for (var x = 0; x < n; x++) art += puzzle.solution[y * n + x] ? "██" : "· ";
      art += "\n";
    }
    console.log(art);
  });
});

console.log("Sprawdzono " + total + " obrazków, problemów: " + problems);
process.exit(problems ? 1 : 0);
