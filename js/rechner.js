(function exposeCalculator(globalObject, factory) {
  "use strict";

  const tariffs = globalObject.TARIFE ||
    (typeof module === "object" && module.exports ? require("./tarife.js") : null);
  const calculator = factory(tariffs);

  globalObject.StromkostenRechner = calculator;

  if (typeof module === "object" && module.exports) {
    module.exports = calculator;
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function buildCalculator(TARIFE) {
  "use strict";

  const MAX_KWH_HUNDREDTHS = 1_299_900;
  const RATE_UNITS_PER_RAPPEN = 1_000_000;
  const VAT_NUMERATOR = 81;
  const VAT_GROSS_DENOMINATOR = 1081;

  function decimalToInteger(value, decimalPlaces) {
    const normalized = String(value).trim().replace(",", ".");
    const match = normalized.match(/^(\d+)(?:\.(\d+))?$/);

    if (!match || (match[2] || "").length > decimalPlaces) {
      throw new Error(`Ungültiger Tarifwert: ${value}`);
    }

    const whole = Number(match[1]);
    const fraction = (match[2] || "").padEnd(decimalPlaces, "0");
    return whole * (10 ** decimalPlaces) + Number(fraction || 0);
  }

  function parseConsumption(value) {
    const original = String(value ?? "").trim();

    if (!original) {
      return { valid: false, message: "Bitte gib deinen Jahresverbrauch ein." };
    }

    const normalized = original
      .replace(/[\s'’]/g, "")
      .replace(",", ".");

    const match = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/);

    if (!match) {
      return {
        valid: false,
        message: "Bitte verwende eine Zahl mit höchstens zwei Nachkommastellen."
      };
    }

    const fraction = (match[2] || "").padEnd(2, "0");
    const kwhHundredths = Number(match[1]) * 100 + Number(fraction || 0);

    if (!Number.isSafeInteger(kwhHundredths) || kwhHundredths > MAX_KWH_HUNDREDTHS) {
      return {
        valid: false,
        message: "Der Jahresverbrauch muss zwischen 0 und 12’999 kWh liegen."
      };
    }

    return {
      valid: true,
      kwhHundredths,
      kwh: kwhHundredths / 100
    };
  }

  function roundPositiveFraction(numerator, denominator) {
    return Math.floor((numerator + denominator / 2) / denominator);
  }

  function unitsToCents(units) {
    return roundPositiveFraction(units, RATE_UNITS_PER_RAPPEN);
  }

  function calculateTariff(tariffId, kwhHundredths) {
    const tariff = TARIFE[tariffId];

    if (!tariff) {
      throw new Error(`Unbekannter Tarif: ${tariffId}`);
    }

    if (!Number.isSafeInteger(kwhHundredths) || kwhHundredths < 0 || kwhHundredths > MAX_KWH_HUNDREDTHS) {
      throw new Error("Ungültiger Jahresverbrauch.");
    }

    const energyRates = tariff.energyQuarterRpKwh.map((value) => decimalToInteger(value, 6));
    const energyUnits = kwhHundredths * energyRates.reduce((sum, rate) => sum + rate, 0) / 400;
    const gridUnits = kwhHundredths * decimalToInteger(tariff.gridRpKwh, 6) / 100;
    const leviesUnits = kwhHundredths * decimalToInteger(tariff.leviesRpKwh, 6) / 100;
    const baseUnits = decimalToInteger(tariff.baseChfMonth, 8) * 12;
    const meterUnits = decimalToInteger(tariff.meterChfMonth, 8) * 12;
    const totalUnits = energyUnits + gridUnits + leviesUnits + baseUnits + meterUnits;

    const vatCents = roundPositiveFraction(
      totalUnits * VAT_NUMERATOR,
      VAT_GROSS_DENOMINATOR * RATE_UNITS_PER_RAPPEN
    );

    return {
      tariff,
      kwh: kwhHundredths / 100,
      totalUnits,
      components: {
        energyCents: unitsToCents(energyUnits),
        gridCents: unitsToCents(gridUnits),
        leviesCents: unitsToCents(leviesUnits),
        baseCents: unitsToCents(baseUnits),
        meterCents: unitsToCents(meterUnits),
        vatCents
      },
      totalCents: unitsToCents(totalUnits)
    };
  }

  function compareTariffs(kwhHundredths) {
    const ekz = calculateTariff("EKZ_2026_BASIS", kwhHundredths);
    const iwb = calculateTariff("IWB_2026_SMALL_ET", kwhHundredths);
    const differenceUnits = Math.abs(ekz.totalUnits - iwb.totalUnits);
    const cheaper = ekz.totalUnits <= iwb.totalUnits ? ekz : iwb;

    return {
      results: [ekz, iwb],
      cheaperTariffId: cheaper.tariff.id,
      differenceCents: unitsToCents(differenceUnits)
    };
  }

  return Object.freeze({
    parseConsumption,
    calculateTariff,
    compareTariffs
  });
});
