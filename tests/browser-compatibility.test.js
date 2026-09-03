"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadBrowserBuild() {
  const context = vm.createContext({});
  const tariffsPath = path.join(__dirname, "..", "js", "tarife.js");
  const calculatorPath = path.join(__dirname, "..", "js", "rechner.js");

  vm.runInContext(fs.readFileSync(tariffsPath, "utf8"), context, { filename: tariffsPath });
  vm.runInContext(fs.readFileSync(calculatorPath, "utf8"), context, { filename: calculatorPath });

  return context;
}

function loadCalculatorWithTariffs(tariffs) {
  const context = vm.createContext({ TARIFE: tariffs });
  const calculatorPath = path.join(__dirname, "..", "js", "rechner.js");

  vm.runInContext(fs.readFileSync(calculatorPath, "utf8"), context, { filename: calculatorPath });
  return context.StromkostenRechner;
}

test("Browser-Build stellt Tarifdaten und Rechner global bereit", () => {
  const context = loadBrowserBuild();

  assert.ok(context.TARIFE);
  assert.ok(context.StromkostenRechner);
  assert.equal(typeof context.StromkostenRechner.parseConsumption, "function");
});

test("Browser-Build liefert dieselbe Kontrollrechnung", () => {
  const context = loadBrowserBuild();
  const result = context.StromkostenRechner.calculateTariff("EKZ_2026_BASIS", 250_000);

  assert.equal(result.totalCents, 69_393);
  assert.equal(context.StromkostenRechner.compareTariffs(250_000).differenceCents, 31_215);
});

test("weist fehlerhafte Tarifwerte zurück", () => {
  const calculator = loadCalculatorWithTariffs({
    BROKEN: {
      id: "BROKEN",
      energyQuarterRpKwh: ["ungueltig", "1.00", "1.00", "1.00"],
      gridRpKwh: "1.00",
      leviesRpKwh: "1.00",
      baseChfMonth: "1.00",
      meterChfMonth: "1.00"
    }
  });

  assert.throws(
    () => calculator.calculateTariff("BROKEN", 100),
    /Ungültiger Tarifwert: ungueltig/
  );
});
