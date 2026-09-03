(function exposeTariffs(globalObject) {
  "use strict";

  const tariffs = Object.freeze({
    EKZ_2026_BASIS: Object.freeze({
      id: "EKZ_2026_BASIS",
      provider: "EKZ",
      name: "Energie Erneuerbar + Netz 400F",
      energyQuarterRpKwh: Object.freeze(["14.38", "9.73", "9.73", "14.38"]),
      gridRpKwh: "8.11",
      leviesRpKwh: "3.44",
      baseChfMonth: "3.24",
      meterChfMonth: "5.41",
      vatPercent: "8.1",
      assumption: "Jahresverbrauch gleichmässig auf vier Quartale verteilt",
      source: "https://www.ekz.ch/de/angebote/strom/tarife/stromtarife-privatkunden.html"
    }),
    IWB_2026_SMALL_ET: Object.freeze({
      id: "IWB_2026_SMALL_ET",
      provider: "IWB",
      name: "IWB Strom small, Einfachtarif",
      energyQuarterRpKwh: Object.freeze(["12.00", "12.00", "12.00", "12.00"]),
      gridRpKwh: "15.05",
      leviesRpKwh: "10.86",
      baseChfMonth: "0.00",
      meterChfMonth: "4.86",
      vatPercent: "8.1",
      assumption: "Vereinfachter Einfachtarif für das ganze Jahr",
      source: "https://www.iwb.ch/servicecenter/stromtarife/aktuelle-tarife"
    })
  });

  globalObject.TARIFE = tariffs;

  if (typeof module === "object" && module.exports) {
    module.exports = tariffs;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
