# Capsli – Mobile Medikamentenverwaltung

«Capsli» ist eine mobile App, mit der Sie Medikamente übersichtlich verwalten können. Die App entstand als Semesterprojekt und bietet eine einfache Verwaltung von Einnahmezeiten, Dauer, Notizen und optionalen Fotos. Zusätzlich unterstützt ein Tageszeitplan die Übersicht während des Tages.

## Setup
### Voraussetzungen
- Node.js (LTS-Version)
- npm oder yarn
- Expo CLI oder Expo Go App
- optional: iOS- oder Android-Simulator

### Installation
- Repository klonen
  git clone <repo-url>
  cd capsli
- Abhängigkeiten installieren
  npm install
- App starten
  npx expo start
- Starten der App
  - via Expo Go (QR-Code scannen)
  - oder über Emulator (i für iOS, a für Android)

## Scripts
start → startet die App im Expo-Modus
android → baut und startet im Android-Emulator
ios → baut und startet im iOS-Simulator
web → startet Expo im Browser
lint → Codeprüfung
test → Platzhalter für zukünftige Tests

## Architektur-Skizze

Die App ist klar strukturiert, um Abläufe verständlich und wartbar zu halten:

### Navigation
- Native Stack Navigation
- Einstieg über «App.tsx»
- einheitliche Bottom-Bar

### Screens
- Dashboard: Übersicht aller Medikamente
- MedicationForm: Erfassen / Bearbeiten
- Clock: tägliche Timeline
- Profile: Angaben und Sprache

### State-Management
- SettingsContext für Name, Vorname, Sprache, Notifications
- verfügbar über eigenen Hook «useSettings»

### Persistenz / Storage
- AsyncStorage:
  - @capsli_profile → Profilangaben
  - @capsli_medications → Medikamentenliste
  - @capsli_taken_map → Einnahmestatus

## Screenshots / GIF
(Platzhalter, bitte mit eigenen Bildern ersetzen)

assets/screenshots/dashboard.png
assets/screenshots/medication-form.png
assets/screenshots/clock.png
assets/screenshots/profile.png

## Bekannte Issues
- Einnahmestatus nicht tagesspezifisch
- keine Push-Benachrichtigungen
- kein Export oder Import
- eingeschränkte Accessibility
- Datumsausgaben je nach Sprache leicht unterschiedlich

## Verantwortlichkeiten
Dieses Projekt wurde vollständig alleine entwickelt.

Verantwortlich: Ich
Bereiche: Architektur, UI/UX, Navigation, State-Management, Timeline-Logik, Formularvalidierung, Lokalisierung, Persistenz, Testing, Dokumentation


