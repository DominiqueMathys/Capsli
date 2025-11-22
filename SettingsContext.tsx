import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sprach-Typ für das Profil
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

// Defaultwerte, wenn noch nichts im Storage ist
const defaultSettings: Settings = {
  name: '',
  firstName: '',
  notificationsEnabled: false,
  language: 'de',
};

const PROFILE_STORAGE_KEY = '@capsli_profile';

// Eigentlicher React Context mit Defaultwerten
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

// Provider-Komponente: 
// - lädt Settings beim Start aus AsyncStorage
// - speichert Aenderungen wieder zurück
export const SettingsProvider = ({children}: {children: ReactNode}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Beim ersten Rendern Profil aus dem lokalen Speicher holen
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

  // Immer wenn sich Settings ändern, in AsyncStorage sichern
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

  // Hilfsfunktion, um nur Teile der Settings zu aktualisieren
  const updateSettings = (patch: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...patch}));
  };

  return (
    <SettingsContext.Provider value={{settings, updateSettings}}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom Hook, damit Screens bequem auf das Profil zugreifen können
export const useSettings = () => useContext(SettingsContext);