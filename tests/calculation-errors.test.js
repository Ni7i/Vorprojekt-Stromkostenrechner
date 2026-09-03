"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calculator = require("../js/rechner.js");

test("weist unbekannte Tarife zurück", () => {
  assert.throws(
    () => calculator.calculateTariff("NICHT_VORHANDEN", 250_000),
    /Unbekannter Tarif: NICHT_VORHANDEN/
  );
});

test("weist ungültige interne Verbrauchswerte zurück", () => {
  for (const value of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 1_299_901]) {
    assert.throws(
      () => calculator.calculateTariff("EKZ_2026_BASIS", value),
      /Ungültiger Jahresverbrauch/
    );
  }
});

test("gibt Verbrauch und Tarif im Resultat mit zurück", () => {
  const result = calculator.calculateTariff("EKZ_2026_BASIS", 123_456);

  assert.equal(result.kwh, 1234.56);
  assert.equal(result.tariff.id, "EKZ_2026_BASIS");
  assert.ok(Number.isFinite(result.totalUnits));
  assert.ok(Number.isInteger(result.totalCents));
});

test("Vergleich enthält beide Tarife genau einmal", () => {
  const comparison = calculator.compareTariffs(250_000);

  assert.deepEqual(
    comparison.results.map((result) => result.tariff.id),
    ["EKZ_2026_BASIS", "IWB_2026_SMALL_ET"]
  );
});
