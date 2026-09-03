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

test("berechnet auch den maximal zulässigen Verbrauch", () => {
  const result = calculator.calculateTariff("EKZ_2026_BASIS", 1_299_900);

  assert.equal(result.kwh, 12_999);
  assert.ok(result.totalCents > 0);
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

test("erkennt bei Nullverbrauch IWB als günstigeren Tarif", () => {
  const comparison = calculator.compareTariffs(0);

  assert.equal(comparison.cheaperTariffId, "IWB_2026_SMALL_ET");
  assert.equal(comparison.differenceCents, 4_548);
});
