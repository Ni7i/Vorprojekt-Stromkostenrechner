(function initializeApplication() {
  "use strict";

  const form = document.querySelector("#calculator-form");
  const consumptionInput = document.querySelector("#consumption");
  const selectionInput = document.querySelector("#tariff-selection");
  const errorElement = document.querySelector("#consumption-error");
  const resultsElement = document.querySelector("#results");
  const calculator = window.StromkostenRechner;

  const currencyFormatter = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const consumptionFormatter = new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  function formatCurrency(cents) {
    return currencyFormatter.format(cents / 100);
  }

  function formatConsumption(kwh) {
    return `${consumptionFormatter.format(kwh)} kWh`;
  }

  function setValidationState(validation) {
    const hasError = !validation.valid;
    errorElement.textContent = hasError ? validation.message : "";
    consumptionInput.classList.toggle("has-error", hasError);
    consumptionInput.setAttribute("aria-invalid", String(hasError));
  }

  function costRows(result) {
    const costs = result.components;

    return `
      <table class="cost-table">
        <tbody>
          <tr><th scope="row">Energiekosten</th><td>${formatCurrency(costs.energyCents)}</td></tr>
          <tr><th scope="row">Netznutzung</th><td>${formatCurrency(costs.gridCents)}</td></tr>
          <tr><th scope="row">Weitere Abgaben</th><td>${formatCurrency(costs.leviesCents)}</td></tr>
          <tr><th scope="row">Grundtarif</th><td>${formatCurrency(costs.baseCents)}</td></tr>
          <tr><th scope="row">Messtarif</th><td>${formatCurrency(costs.meterCents)}</td></tr>
          <tr><th scope="row">Enthaltener MWST-Anteil</th><td>${formatCurrency(costs.vatCents)}</td></tr>
        </tbody>
        <tfoot>
          <tr><th scope="row">Jahreskosten</th><td>${formatCurrency(result.totalCents)}</td></tr>
        </tfoot>
      </table>
    `;
  }

  function resultTable(result, cheapestTariffId) {
    const isCheapest = result.tariff.id === cheapestTariffId;

    return `
      <section class="tariff-result">
        <h3>${result.tariff.provider}: ${result.tariff.name}</h3>
        ${isCheapest ? '<p><strong>Günstigerer Tarif im Vergleich</strong></p>' : ""}
        ${costRows(result)}
        <p><a href="${result.tariff.source}" target="_blank" rel="noreferrer">Tarifquelle öffnen</a></p>
      </section>
    `;
  }

  function renderResults(validation, selection) {
    const commonHeader = `
      <h2 id="results-title" tabindex="-1">Ergebnis für ${formatConsumption(validation.kwh)}</h2>
    `;

    if (selection === "compare") {
      const comparison = calculator.compareTariffs(validation.kwhHundredths);
      const cheaper = comparison.results.find(
        (result) => result.tariff.id === comparison.cheaperTariffId
      );

      resultsElement.innerHTML = `
        ${commonHeader}
        <p class="comparison-result">
          <strong>Vergleich:</strong> ${cheaper.tariff.provider} ist um
          ${formatCurrency(comparison.differenceCents)} günstiger.
        </p>
        <div class="result-list">
          ${comparison.results.map((result) => resultTable(result, comparison.cheaperTariffId)).join("")}
        </div>
        <p class="model-note">
          Hinweis: Dies ist ein vereinfachter Modellvergleich mit Lehrdaten und keine verbindliche Offerte oder Rechnung.
        </p>
      `;
      return;
    }

    const result = calculator.calculateTariff(selection, validation.kwhHundredths);
    resultsElement.innerHTML = `
      ${commonHeader}
      <div class="result-list is-single">
        ${resultTable(result, null)}
      </div>
      <p class="model-note">
        Hinweis: Dies ist eine vereinfachte Modellrechnung mit Lehrdaten und keine verbindliche Offerte oder Rechnung.
      </p>
    `;
  }

  function calculate(options = {}) {
    const validation = calculator.parseConsumption(consumptionInput.value);
    setValidationState(validation);

    if (!validation.valid) {
      consumptionInput.focus();
      return;
    }

    renderResults(validation, selectionInput.value);

    if (options.moveToResults) {
      document.querySelector("#results-title").focus({ preventScroll: true });
      resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate({ moveToResults: true });
  });

  consumptionInput.addEventListener("input", () => {
    if (consumptionInput.getAttribute("aria-invalid") === "true") {
      setValidationState(calculator.parseConsumption(consumptionInput.value));
    }
  });

  calculate();
})();
