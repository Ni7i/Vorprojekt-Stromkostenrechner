# Stromkostenrechner 2026

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

Die automatisierten Tests benötigen Node.js, aber keine zusätzlichen Pakete:

```bash
node --test tests/rechner.test.js
```

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
