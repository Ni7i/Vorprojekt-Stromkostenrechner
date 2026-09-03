"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calculator = require("../js/rechner.js");

test("akzeptiert Nullverbrauch und beide Dezimaltrennzeichen", () => {
  for (const input of ["0", "0.00", "0,00"]) {
    assert.deepEqual(calculator.parseConsumption(input), {
      valid: true,
      kwhHundredths: 0,
      kwh: 0
    });
  }
});

test("entfernt erlaubte Tausendertrennzeichen und Leerraum", () => {
  assert.equal(calculator.parseConsumption(" 12 999 ").kwhHundredths, 1_299_900);
  assert.equal(calculator.parseConsumption("12’999").kwhHundredths, 1_299_900);
  assert.equal(calculator.parseConsumption("12'999").kwhHundredths, 1_299_900);
});

test("meldet fehlende Eingaben verständlich", () => {
  const expected = "Bitte gib deinen Jahresverbrauch ein.";

  assert.equal(calculator.parseConsumption("").message, expected);
  assert.equal(calculator.parseConsumption("   ").message, expected);
  assert.equal(calculator.parseConsumption(null).message, expected);
  assert.equal(calculator.parseConsumption(undefined).message, expected);
});

test("weist ungültige Zahlenformate zurück", () => {
  const inputs = ["1.234,50", "1,234.50", "2.500,123", "+2500", "2e3", "NaN"];

  for (const input of inputs) {
    const parsed = calculator.parseConsumption(input);
    assert.equal(parsed.valid, false, `${input} muss ungültig sein`);
    assert.equal(
      parsed.message,
      "Bitte verwende eine Zahl mit höchstens zwei Nachkommastellen."
    );
  }
});

test("weist negative und zu grosse Werte mit Bereichsmeldung zurück", () => {
  assert.equal(calculator.parseConsumption("-0.01").valid, false);

  for (const input of ["12999.01", "13000", "999999999999999999999999"]) {
    const parsed = calculator.parseConsumption(input);
    assert.equal(parsed.valid, false, `${input} muss ungültig sein`);
    assert.equal(
      parsed.message,
      "Der Jahresverbrauch muss zwischen 0 und 12’999 kWh liegen."
    );
  }
});
