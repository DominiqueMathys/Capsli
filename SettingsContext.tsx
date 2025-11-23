/**
 * «settings_context.tsx»
 *
 * Dieser Code verwaltet das gesamte Profil- und Einstellungsmanagement Ihrer App.
 * Er stellt sicher, dass Nutzer:innen ihre Angaben (Name, Vorname, Sprache,
 * Benachrichtigungen) einmal definieren und diese Werte dann zentral und
 * dauerhaft verfuegbar bleiben.
 *
 * Aufgaben dieses Moduls:
 * - gespeicherte Einstellungen beim App-Start aus AsyncStorage laden
 * - alle Einstellungen global ueber einen React Context bereitstellen
 * - jede Aenderung automatisch und persistent speichern
 * - einfache Aktualisierung einzelner Werte via updateSettings()
 *
 * Aufbau:
 * - SettingsContext: enthaelt aktuelle Daten und Update-Funktion
 * - SettingsProvider: lädt initiale Werte, speichert spaeter alle Updates
 * - useSettings(): komfortabler Zugriff fuer alle Screens
 *
 * Ziel:
 * Ein klarer, stabiler und zentraler Mechanismus, damit Profilinfos in der ganzen
 * App konsistent genutzt werden koennen.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sprach-Typ fuer das Profil
export type Language = 'de' | 'fr' | 'en' | 'it';

// Struktur der gespeicherten Profil-Einstellungen
export type Settings = {
  name: string;
  firstName: string;
  notificationsEnabled: boolean;
  language: Language;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
};

// Defaultwerte, falls noch nichts gespeichert wurde
const defaultSettings: Settings = {
  name: '',
  firstName: '',
  notificationsEnabled: false,
  language: 'de',
};

const PROFILE_STORAGE_KEY = '@capsli_profile';

// React Context mit Defaultinhalt
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

// Provider-Komponente:
// - lädt Einstellungen aus AsyncStorage
// - speichert jede Aenderung automatisch zurueck
export const SettingsProvider = ({children}: {children: ReactNode}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Beim ersten Start: Profil laden
  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json);
          setSettings({...defaultSettings, ...parsed});
        }
      } catch (e) {
        console.log('Fehler beim Laden der Settings', e);
      }
    };
    load();
  }, []);

  // Bei jeder Aenderung in AsyncStorage speichern
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify(settings),
        );
      } catch (e) {
        console.log('Fehler beim Speichern der Settings', e);
      }
    };
    save();
  }, [settings]);

  // Nur bestimmte Felder aktualisieren
  const updateSettings = (patch: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...patch}));
  };

  return (
    <SettingsContext.Provider value={{settings, updateSettings}}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom Hook fuer einfachen Zugriff in allen Screens
export const useSettings = () => useContext(SettingsContext);