# Stromkostenrechner 2026

[![Tests und Coverage](https://github.com/Ni7i/Vorprojekt-Stromkostenrechner/actions/workflows/tests.yml/badge.svg?branch=codex%2Finitial-stromkostenrechner)](https://github.com/Ni7i/Vorprojekt-Stromkostenrechner/actions/workflows/tests.yml?query=branch%3Acodex%2Finitial-stromkostenrechner)

Ein browserbasierter Stromkostenrechner für das IDPA-Vorprojekt. Die Anwendung berechnet und vergleicht die vereinfachten Lehrtarife von EKZ und IWB für das Jahr 2026.

## Start

1. Repository herunterladen oder klonen.
2. `index.html` in einem aktuellen Browser öffnen.
3. Jahresverbrauch eingeben und EKZ, IWB oder den Vergleich auswählen.

Es sind keine Installation, kein Server und keine Internetverbindung erforderlich. Externe Links zu den Tarifquellen werden nur beim Anklicken geöffnet.

## Funktionen

- Jahresverbrauch von 0 bis 12’999 kWh
- Vorgabewert 2’500 kWh
- Einzelberechnung für EKZ oder IWB
- Vergleich beider Tarife mit Kostendifferenz
- Aufschlüsselung nach Energie, Netznutzung, Abgaben, Grund- und Messtarif
- separater Ausweis des bereits enthaltenen MWST-Anteils
- lokale Berechnung ohne Speicherung oder Übertragung der Eingaben
- responsive Darstellung für Computer, Tablet und Smartphone

## Tests

Die automatisierten Tests benötigen Node.js 22 oder neuer, aber keine zusätzlichen Pakete.
Alle Tests ausführst du mit:

```bash
npm test
```

Den vollständigen Coverage-Bericht zeigst du direkt im Terminal an mit:

```bash
npm run test:coverage
```

Der Coverage-Lauf schlägt automatisch fehl, wenn die getestete Rechenlogik weniger als
100&nbsp;% Zeilen-, 100&nbsp;% Funktions- oder 75&nbsp;% Branch-Coverage erreicht. Derselbe
Lauf wird bei jedem Push und Pull Request unter **GitHub → Actions → Tests und Coverage**
ausgeführt.

Die verbindliche Kontrollrechnung bei 2’500 kWh ergibt:

| Tarif | Total | MWST-Anteil |
| --- | ---: | ---: |
| EKZ | CHF 693.93 | CHF 52.00 |
| IWB | CHF 1’006.07 | CHF 75.39 |

Der EKZ-Modelltarif ist in dieser Kontrollrechnung um CHF 312.15 günstiger. Die Differenz wird aus den ungerundeten Werten berechnet und erst für die Ausgabe gerundet.

## Projektstruktur

```text
index.html                 Benutzeroberfläche
css/style.css              Gestaltung und responsive Darstellung
js/tarife.js               Tarifdaten 2026
js/rechner.js              Berechnung und Validierung
js/app.js                  Verbindung zwischen Oberfläche und Berechnung
data/Tarifdaten_Stromkosten_2026.csv   Verbindliche Tarifdaten
tests/rechner.test.js      Automatisierte Tests
```

Geldbeträge werden intern als skalierte Ganzzahlen verarbeitet. Dadurch wird der Kontrollwert CHF 693.925 korrekt auf CHF 693.93 gerundet, ohne typische Gleitkommafehler.

## Projektgruppe

Vincent Hug, Enis Shorra und Lorena Campell – Gruppe 2026-5.

Schulprojekt im Rahmen einer Vor-Abschlussarbeit (IDPA), 2026.
