"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const tariffs = require("../js/tarife.js");

function parseSemicolonLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
    } else if (character === ";" && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }

  fields.push(field);
  return fields;
}

function readTariffRows() {
  const csvPath = path.join(__dirname, "..", "data", "Tarifdaten_Stromkosten_2026.csv");
  const [headerLine, ...dataLines] = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
  const headers = parseSemicolonLine(headerLine);

  return dataLines.map((line) => Object.fromEntries(
    headers.map((header, index) => [header, parseSemicolonLine(line)[index]])
  ));
}

test("CSV und JavaScript enthalten dieselben Tarifkennungen", () => {
  const csvIds = readTariffRows().map((row) => row.tarif_id);
  assert.deepEqual(csvIds, Object.keys(tariffs));
});

test("Berechnungspreise stimmen mit den CSV-Quelldaten überein", () => {
  for (const row of readTariffRows()) {
    const tariff = tariffs[row.tarif_id];

    assert.deepEqual(tariff.energyQuarterRpKwh, [
      row.energie_q1_rp_kwh,
      row.energie_q2_rp_kwh,
      row.energie_q3_rp_kwh,
      row.energie_q4_rp_kwh
    ]);
    assert.equal(tariff.gridRpKwh, row.netznutzung_rp_kwh);
    assert.equal(tariff.leviesRpKwh, row.weitere_abgaben_rp_kwh);
    assert.equal(tariff.baseChfMonth, row.grundtarif_chf_monat);
    assert.equal(tariff.meterChfMonth, row.messtarif_chf_monat);
    assert.equal(tariff.source, row.quelle);
  }
});
