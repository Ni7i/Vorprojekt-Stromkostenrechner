"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const tariffs = require("../js/tarife.js");

test("enthält genau die unterstützten Tarife", () => {
  assert.deepEqual(Object.keys(tariffs), ["EKZ_2026_BASIS", "IWB_2026_SMALL_ET"]);
});

test("Tarifobjekte und Quartalspreise sind unveränderlich", () => {
  assert.equal(Object.isFrozen(tariffs), true);

  for (const tariff of Object.values(tariffs)) {
    assert.equal(Object.isFrozen(tariff), true);
    assert.equal(Object.isFrozen(tariff.energyQuarterRpKwh), true);
  }
});

test("jeder Tarif enthält vier Quartalspreise und eine HTTPS-Quelle", () => {
  for (const tariff of Object.values(tariffs)) {
    assert.equal(tariff.energyQuarterRpKwh.length, 4);
    assert.ok(tariff.energyQuarterRpKwh.every((rate) => /^\d+\.\d{2}$/.test(rate)));
    assert.match(tariff.source, /^https:\/\//);
    assert.equal(tariff.vatPercent, "8.1");
  }
});

test("Tarifkennung stimmt mit dem Objektschlüssel überein", () => {
  for (const [tariffId, tariff] of Object.entries(tariffs)) {
    assert.equal(tariff.id, tariffId);
  }
});
