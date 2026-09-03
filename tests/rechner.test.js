"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calculator = require("../js/rechner.js");

test("akzeptiert den Vorgabewert 2’500 kWh", () => {
  const parsed = calculator.parseConsumption("2’500");

  assert.equal(parsed.valid, true);
  assert.equal(parsed.kwhHundredths, 250000);
});

test("berechnet die EKZ-Kontrollrechnung korrekt", () => {
  const result = calculator.calculateTariff("EKZ_2026_BASIS", 250000);

  assert.equal(result.components.energyCents, 30138);
  assert.equal(result.components.gridCents, 20275);
  assert.equal(result.components.leviesCents, 8600);
  assert.equal(result.components.baseCents, 3888);
  assert.equal(result.components.meterCents, 6492);
  assert.equal(result.components.vatCents, 5200);
  assert.equal(result.totalCents, 69393);
});

test("berechnet die IWB-Kontrollrechnung korrekt", () => {
  const result = calculator.calculateTariff("IWB_2026_SMALL_ET", 250000);

  assert.equal(result.components.energyCents, 30000);
  assert.equal(result.components.gridCents, 37625);
  assert.equal(result.components.leviesCents, 27150);
  assert.equal(result.components.baseCents, 0);
  assert.equal(result.components.meterCents, 5832);
  assert.equal(result.components.vatCents, 7539);
  assert.equal(result.totalCents, 100607);
});

test("vergleicht beide Tarife vor der Ausgaberundung", () => {
  const comparison = calculator.compareTariffs(250000);

  assert.equal(comparison.cheaperTariffId, "EKZ_2026_BASIS");
  assert.equal(comparison.differenceCents, 31215);
});

test("berechnet bei 0 kWh weiterhin die festen Monatskosten", () => {
  const ekz = calculator.calculateTariff("EKZ_2026_BASIS", 0);
  const iwb = calculator.calculateTariff("IWB_2026_SMALL_ET", 0);

  assert.equal(ekz.totalCents, 10380);
  assert.equal(iwb.totalCents, 5832);
});

test("akzeptiert die Obergrenze 12’999 kWh", () => {
  const parsed = calculator.parseConsumption("12'999");

  assert.equal(parsed.valid, true);
  assert.equal(parsed.kwhHundredths, 1299900);
});

test("weist Werte oberhalb der Obergrenze zurück", () => {
  const parsed = calculator.parseConsumption("13000");

  assert.equal(parsed.valid, false);
});

test("weist negative, leere und nicht numerische Eingaben zurück", () => {
  assert.equal(calculator.parseConsumption("-1").valid, false);
  assert.equal(calculator.parseConsumption("").valid, false);
  assert.equal(calculator.parseConsumption("abc").valid, false);
});

test("akzeptiert bis zu zwei Nachkommastellen und ein Dezimalkomma", () => {
  const parsed = calculator.parseConsumption("2500,75");

  assert.equal(parsed.valid, true);
  assert.equal(parsed.kwhHundredths, 250075);
});
