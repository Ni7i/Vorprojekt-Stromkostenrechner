"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const calculatorPath = require.resolve("../js/rechner.js");

function loadCalculatorWithTariffs(tariffs) {
  const previousTariffs = globalThis.TARIFE;
  const previousCalculator = globalThis.StromkostenRechner;

  globalThis.TARIFE = tariffs;
  delete require.cache[calculatorPath];

  try {
    return require(calculatorPath);
  } finally {
    if (previousTariffs === undefined) {
      delete globalThis.TARIFE;
    } else {
      globalThis.TARIFE = previousTariffs;
    }

    if (previousCalculator === undefined) {
      delete globalThis.StromkostenRechner;
    } else {
      globalThis.StromkostenRechner = previousCalculator;
    }

    delete require.cache[calculatorPath];
  }
}

function tariffWith(overrides = {}) {
  return {
    id: "TEST",
    energyQuarterRpKwh: ["1", "1", "1", "1"],
    gridRpKwh: "1",
    leviesRpKwh: "1",
    baseChfMonth: "1",
    meterChfMonth: "1",
    ...overrides
  };
}

test("normalisiert Leerraum und Dezimalkommas in Tarifwerten", () => {
  const calculator = loadCalculatorWithTariffs({
    TEST: tariffWith({
      energyQuarterRpKwh: [" 1,0 ", " 1,0 ", " 1,0 ", " 1,0 "],
      gridRpKwh: " 1,0 ",
      leviesRpKwh: " 1,0 ",
      baseChfMonth: " 1,0 ",
      meterChfMonth: " 1,0 "
    })
  });

  const result = calculator.calculateTariff("TEST", 10_000);

  assert.equal(result.components.energyCents, 100);
  assert.equal(result.components.gridCents, 100);
  assert.equal(result.components.leviesCents, 100);
  assert.equal(result.components.baseCents, 1_200);
  assert.equal(result.components.meterCents, 1_200);
  assert.equal(result.totalCents, 2_700);
});

test("ergänzt fehlende Nachkommastellen bei Tarifwerten korrekt", () => {
  const calculator = loadCalculatorWithTariffs({ TEST: tariffWith() });
  assert.equal(calculator.calculateTariff("TEST", 10_000).totalCents, 2_700);
});

test("meldet nicht numerische Tarifwerte exakt", () => {
  const calculator = loadCalculatorWithTariffs({
    TEST: tariffWith({ energyQuarterRpKwh: ["ungueltig", "1", "1", "1"] })
  });

  assert.throws(
    () => calculator.calculateTariff("TEST", 10_000),
    (error) => error.message === "Ungültiger Tarifwert: ungueltig"
  );
});

test("weist Tarifwerte mit zu vielen Nachkommastellen zurück", () => {
  const calculator = loadCalculatorWithTariffs({
    TEST: tariffWith({ gridRpKwh: "1.1234567" })
  });

  assert.throws(
    () => calculator.calculateTariff("TEST", 10_000),
    (error) => error.message === "Ungültiger Tarifwert: 1.1234567"
  );
});

test("weist Tarifwerte mit Zeichen vor oder nach der Zahl zurück", () => {
  for (const value of ["x1.00", "1.00x"]) {
    const calculator = loadCalculatorWithTariffs({
      TEST: tariffWith({ gridRpKwh: value })
    });

    assert.throws(
      () => calculator.calculateTariff("TEST", 10_000),
      (error) => error.message === `Ungültiger Tarifwert: ${value}`
    );
  }
});

test("akzeptiert exakt sechs Nachkommastellen bei Rappenpreisen", () => {
  const calculator = loadCalculatorWithTariffs({
    TEST: tariffWith({
      energyQuarterRpKwh: ["0", "0", "0", "0"],
      gridRpKwh: "1.123456",
      leviesRpKwh: "0",
      baseChfMonth: "0",
      meterChfMonth: "0"
    })
  });

  const result = calculator.calculateTariff("TEST", 10_000);
  assert.equal(result.components.gridCents, 112);
  assert.equal(result.totalCents, 112);
});
