import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import {
  NavigationContainer,
  useFocusEffect,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MedicationFormScreen from './screens/screen_medi';

/* -------------------------------------------------------------
   Basis Typen (Sprache, Einnahmezeiten, Medikamente)
   ------------------------------------------------------------- */

type Language = 'de' | 'fr' | 'en' | 'it';

type IntakeTimes = {
  morning: boolean;
  noon: boolean;
  evening: boolean;
  night: boolean;
};

type Medication = {
  id: string;
  name: string;
  permanent: boolean | null;
  startDate: string | null;
  endDate: string | null;
  intakeTimes: IntakeTimes;
  note: string;
  photoUri?: string | null;
};

const MEDS_STORAGE_KEY = '@capsli_medications';

/* -------------------------------------------------------------
   Navigation Typen
   ------------------------------------------------------------- */

type RootStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  MedicationForm: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* -------------------------------------------------------------
   Uebersetzungen fuer Dashboard / Profil
   ------------------------------------------------------------- */

const translations: Record<
  Language,
  {
    capsliUser: string;
    name: string;
    firstName: string;
    notifications: string;
    on: string;
    off: string;
    language: string;
    choose: string;
    infoDisclaimer: string;
    disclaimerText: string;
    versionLabel: string;
    version: string;
    noMeds: string;
    save: string;
    cancel: string;
    chooseLanguageTitle: string;
    infoQuestion: string;
    infoPhone: string;
    infoChat: string;
    infoPhoneNumber: string;
    infoClose: string;
    edit: string;
    fromToConnector: string;

    // Labels fuer Einnahmezeiten im Dashboard
    morning: string;
    noon: string;
    evening: string;
    night: string;
  }
> = {
  de: {
    capsliUser: 'Capsli-User',
    name: 'Name :',
    firstName: 'Vorname :',
    notifications: 'Benachrichtigungen :',
    on: 'Ein',
    off: 'Aus',
    language: 'Sprache :',
    choose: 'waehlen',
    infoDisclaimer: 'Info/Disclaimer',
    disclaimerText: '(Dies ist keine medizinische Beratung)',
    versionLabel: 'App-Version :',
    version: 'v 1.0',
    noMeds: 'keine Medikamente erfasst',
    save: 'Speichern',
    cancel: 'Abbrechen',
    chooseLanguageTitle: 'Sprache waehlen',
    infoQuestion: 'Möchten Sie eine telefonische Beratung oder einen Chat?',
    infoPhone: 'Telefonberatung',
    infoChat: 'Chat',
    infoPhoneNumber: 'Telefon: 044 235 65 41',
    infoClose: 'Schliessen',
    edit: 'Bearbeiten',
    fromToConnector: ' bis ',
    morning: 'Morgen',
    noon: 'Mittag',
    evening: 'Abend',
    night: 'Nacht',
  },
  fr: {
    capsliUser: 'Utilisateur·rice Capsli',
    name: 'Nom :',
    firstName: 'Prénom :',
    notifications: 'Notifications :',
    on: 'Oui',
    off: 'Non',
    language: 'Langue :',
    choose: 'choisir',
    infoDisclaimer: 'Infos/Disclaimer',
    disclaimerText: '(Ceci ne constitue pas un avis médical)',
    versionLabel: 'Version de l’app :',
    version: 'v 1.0',
    noMeds: 'aucun médicament saisi',
    save: 'Enregistrer',
    cancel: 'Annuler',
    chooseLanguageTitle: 'Choisir la langue',
    infoQuestion:
      'Souhaitez-vous un conseil téléphonique ou un chat ?',
    infoPhone: 'Conseil téléphonique',
    infoChat: 'Chat',
    infoPhoneNumber: 'Téléphone : 044 235 65 41',
    infoClose: 'Fermer',
    edit: 'Modifier',
    fromToConnector: ' au ',
    morning: 'Matin',
    noon: 'Midi',
    evening: 'Soir',
    night: 'Nuit',
  },
  en: {
    capsliUser: 'Capsli User',
    name: 'Last name :',
    firstName: 'First name :',
    notifications: 'Notifications :',
    on: 'On',
    off: 'Off',
    language: 'Language :',
    choose: 'select',
    infoDisclaimer: 'Info/Disclaimer',
    disclaimerText: '(This is not medical advice)',
    versionLabel: 'App version :',
    version: 'v 1.0',
    noMeds: 'no medication recorded',
    save: 'Save',
    cancel: 'Cancel',
    chooseLanguageTitle: 'Choose language',
    infoQuestion: 'Would you like a phone consultation or a chat?',
    infoPhone: 'Phone consultation',
    infoChat: 'Chat',
    infoPhoneNumber: 'Phone: 044 235 65 41',
    infoClose: 'Close',
    edit: 'Edit',
    fromToConnector: ' to ',
    morning: 'Morning',
    noon: 'Noon',
    evening: 'Evening',
    night: 'Night',
  },
  it: {
    capsliUser: 'Utente Capsli',
    name: 'Cognome :',
    firstName: 'Nome :',
    notifications: 'Notifiche :',
    on: 'Si',
    off: 'No',
    language: 'Lingua :',
    choose: 'scegli',
    infoDisclaimer: 'Info/Disclaimer',
    disclaimerText: '(Questa non è una consulenza medica)',
    versionLabel: 'Versione app :',
    version: 'v 1.0',
    noMeds: 'nessun farmaco registrato',
    save: 'Salva',
    cancel: 'Annulla',
    chooseLanguageTitle: 'Seleziona lingua',
    infoQuestion:
      'Desidera una consulenza telefonica o una chat?',
    infoPhone: 'Consulenza telefonica',
    infoChat: 'Chat',
    infoPhoneNumber: 'Telefono: 044 235 65 41',
    infoClose: 'Chiudi',
    edit: 'Modifica',
    fromToConnector: ' a ',
    morning: 'Mattina',
    noon: 'Mezzogiorno',
    evening: 'Sera',
    night: 'Notte',
  },
};

/* -------------------------------------------------------------
   Settings Context (Profil / Sprache etc.)
   ------------------------------------------------------------- */

type Settings = {
  name: string;
  firstName: string;
  notificationsEnabled: boolean;
  language: Language;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
};

const defaultSettings: Settings = {
  name: '',
  firstName: '',
  notificationsEnabled: false,
  language: 'de',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

const PROFILE_STORAGE_KEY = '@capsli_profile';

const SettingsProvider = ({children}: {children: ReactNode}) => {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  // Profil aus Speicher laden
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

  // Profil in Speicher schreiben
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

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings(prev => ({...prev, ...patch}));
  };

  return (
    <SettingsContext.Provider value={{settings, updateSettings}}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

/* -------------------------------------------------------------
   Dashboard Screen
   ------------------------------------------------------------- */

type DashboardProps = {
  navigation: any;
};

const DashboardEmptyScreen: React.FC<DashboardProps> = ({
  navigation,
}) => {
  const {settings} = useSettings();
  const t = translations[settings.language];

  const [medications, setMedications] = useState<Medication[]>([]);

  // Medikamente laden, wenn Dashboard im Fokus ist
  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const loadMeds = async () => {
        try {
          const json = await AsyncStorage.getItem(MEDS_STORAGE_KEY);
          const list: Medication[] = json ? JSON.parse(json) : [];
          if (active) {
            setMedications(list);
          }
        } catch (e) {
          console.log('Fehler beim Laden der Medikamente', e);
        }
      };

      loadMeds();
      return () => {
        active = false;
      };
    }, []),
  );

  /* Hilfstext fuer Einnahmezeiten */
  const getIntakeText = (m: Medication) => {
    const parts: string[] = [];
    if (m.intakeTimes.morning) parts.push(t.morning);
    if (m.intakeTimes.noon) parts.push(t.noon);
    if (m.intakeTimes.evening) parts.push(t.evening);
    if (m.intakeTimes.night) parts.push(t.night);
    return parts.join(', ');
  };

  return (
    <View style={styles.container}>
      {/* Header mit Logo */}
      <View style={styles.header}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Inhalt: entweder leerer Hinweis oder Liste mit Medikamenten */}
      <View style={styles.content}>
        {medications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t.noMeds}</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.medListContent}
            showsVerticalScrollIndicator={false}>
            {medications.map(m => (
              <View key={m.id} style={styles.medCard}>
                {/* Linke Seite: Texte */}
                <View style={styles.medTextArea}>
                  <Text style={styles.medName}>{m.name}</Text>

                  {(m.startDate || m.endDate) && (
                    <Text style={styles.medDate}>
                      {m.startDate ?? ''}
                      {m.startDate && m.endDate
                        ? t.fromToConnector
                        : ''}
                      {m.endDate ?? ''}
                    </Text>
                  )}

                  {getIntakeText(m) ? (
                    <Text style={styles.medIntake}>
                      {getIntakeText(m)}
                    </Text>
                  ) : null}

                  {m.note ? (
                    <Text style={styles.medNote}>{m.note}</Text>
                  ) : null}
                </View>

                {/* Rechte Seite: Bild + Bearbeiten Button */}
                <View style={styles.medRightArea}>
                  {m.photoUri ? (
                    <Image
                      source={{uri: m.photoUri}}
                      style={styles.medPhoto}
                      resizeMode="cover"
                    />
                  ) : null}

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      navigation.navigate('MedicationForm')
                    }>
                    <Text style={styles.editButtonText}>{t.edit}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Navigation unten */}
      <View style={styles.bottomBar}>
        {/* Uhr */}
        <TouchableOpacity>
          <Image
            source={require('./assets/clock_icon.png')}
            style={styles.smallIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Grosser Plus Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MedicationForm')}>
          <Image
            source={require('./assets/Bild_Plus_Button.png')}
            style={styles.addButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Profil */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('./assets/profil_icon.png')}
            style={styles.profileIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------
   Profil Screen
   ------------------------------------------------------------- */

type ProfileProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileProps> = ({navigation}) => {
  const {settings, updateSettings} = useSettings();
  const t = translations[settings.language];

  // Lokaler State fuer Formular
  const [localName, setLocalName] = useState(settings.name);
  const [localFirstName, setLocalFirstName] =
    useState(settings.firstName);
  const [localNotificationsEnabled, setLocalNotificationsEnabled] =
    useState(settings.notificationsEnabled);
  const [localLanguage, setLocalLanguage] =
    useState<Language>(settings.language);

  const [languageModalVisible, setLanguageModalVisible] =
    useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  // Settings Aenderungen in Formular spiegeln
  useEffect(() => {
    setLocalName(settings.name);
    setLocalFirstName(settings.firstName);
    setLocalNotificationsEnabled(settings.notificationsEnabled);
    setLocalLanguage(settings.language);
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      name: localName,
      firstName: localFirstName,
      notificationsEnabled: localNotificationsEnabled,
      language: localLanguage,
    });
    navigation.goBack();
  };

  const handleCancel = () => {
    setLocalName(settings.name);
    setLocalFirstName(settings.firstName);
    setLocalNotificationsEnabled(settings.notificationsEnabled);
    setLocalLanguage(settings.language);
    navigation.goBack();
  };

  const currentTranslations = translations[localLanguage];

  const languageLabel =
    localLanguage === 'de'
      ? 'Deutsch'
      : localLanguage === 'fr'
      ? 'Français'
      : localLanguage === 'en'
      ? 'English'
      : 'Italiano';

  return (
    <SafeAreaView style={styles.profileContainer}>
      <StatusBar barStyle="light-content" />

      {/* Header mit Logo */}
      <View style={styles.profileHeader}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.profileLogo}
          resizeMode="contain"
        />
        <Text style={styles.profileTitle}>
          {currentTranslations.capsliUser}
        </Text>
      </View>

      {/* Hauptinhalt Profilformular */}
      <View style={styles.profileForm}>
        {/* Name */}
        <Text style={styles.label}>{currentTranslations.name}</Text>
        <TextInput
          style={styles.input}
          value={localName}
          onChangeText={setLocalName}
          placeholder={currentTranslations.name.replace(':', '')}
          placeholderTextColor="#888"
        />

        {/* Vorname */}
        <Text style={styles.label}>
          {currentTranslations.firstName}
        </Text>
        <TextInput
          style={styles.input}
          value={localFirstName}
          onChangeText={setLocalFirstName}
          placeholder={currentTranslations.firstName.replace(
            ':',
            '',
          )}
          placeholderTextColor="#888"
        />

        {/* Benachrichtigungen */}
        <Text style={styles.label}>
          {currentTranslations.notifications}
        </Text>
        <View style={styles.row}>
          <Text style={styles.labelSmall}>
            {currentTranslations.on}
          </Text>
          <TouchableOpacity
            style={[
              styles.checkbox,
              localNotificationsEnabled && styles.checkboxActive,
            ]}
            onPress={() => setLocalNotificationsEnabled(true)}
          />
          <Text style={[styles.labelSmall, {marginLeft: 24}]}>
            {currentTranslations.off}
          </Text>
          <TouchableOpacity
            style={[
              styles.checkbox,
              !localNotificationsEnabled && styles.checkboxActive,
            ]}
            onPress={() => setLocalNotificationsEnabled(false)}
          />
        </View>

        {/* Sprache */}
        <Text style={styles.label}>
          {currentTranslations.language}
        </Text>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguageModalVisible(true)}>
          <Text style={styles.languageButtonText}>
            {languageLabel}
          </Text>
        </TouchableOpacity>

        {/* Buttons Speichern / Abbrechen */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}>
            <Text style={styles.buttonText}>
              {currentTranslations.save}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCancel}>
            <Text style={styles.buttonText}>
              {currentTranslations.cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info / Disclaimer */}
      <View style={styles.profileFooter}>
        <View>
          <Text style={styles.infoTitle}>
            {currentTranslations.infoDisclaimer}
          </Text>
          <Text style={styles.infoText}>
            {currentTranslations.disclaimerText}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setShowPhoneNumber(false);
            setInfoModalVisible(true);
          }}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App-Version */}
      <Text style={styles.versionText}>
        {currentTranslations.versionLabel} {currentTranslations.version}
      </Text>

      {/* Modal: Sprache waehlen */}
      <Modal
        transparent
        visible={languageModalVisible}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentTranslations.chooseLanguageTitle}
            </Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLocalLanguage('de');
                setLanguageModalVisible(false);
              }}>
              <Text style={styles.modalOptionText}>Deutsch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLocalLanguage('fr');
                setLanguageModalVisible(false);
              }}>
              <Text style={styles.modalOptionText}>Français</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLocalLanguage('en');
                setLanguageModalVisible(false);
              }}>
              <Text style={styles.modalOptionText}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setLocalLanguage('it');
                setLanguageModalVisible(false);
              }}>
              <Text style={styles.modalOptionText}>Italiano</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => setLanguageModalVisible(false)}>
              <Text style={styles.modalOptionText}>
                {currentTranslations.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Info / i-Icon */}
      <Modal
        transparent
        visible={infoModalVisible}
        animationType="fade"
        onRequestClose={() => {
          setInfoModalVisible(false);
          setShowPhoneNumber(false);
        }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {!showPhoneNumber ? (
              <>
                <Text style={styles.modalTitle}>
                  {currentTranslations.infoQuestion}
                </Text>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => setShowPhoneNumber(true)}>
                  <Text style={styles.modalOptionText}>
                    {currentTranslations.infoPhone}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setInfoModalVisible(false);
                    setShowPhoneNumber(false);
                  }}>
                  <Text style={styles.modalOptionText}>
                    {currentTranslations.infoChat}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, styles.modalCancel]}
                  onPress={() => {
                    setInfoModalVisible(false);
                    setShowPhoneNumber(false);
                  }}>
                  <Text style={styles.modalOptionText}>
                    {currentTranslations.infoClose}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {currentTranslations.infoPhoneNumber}
                </Text>
                <TouchableOpacity
                  style={[styles.modalOption, styles.modalCancel]}
                  onPress={() => {
                    setInfoModalVisible(false);
                    setShowPhoneNumber(false);
                  }}>
                  <Text style={styles.modalOptionText}>
                    {currentTranslations.infoClose}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* -------------------------------------------------------------
   App Root
   ------------------------------------------------------------- */

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
          <StatusBar barStyle="light-content" />
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
              name="Dashboard"
              component={DashboardEmptyScreen}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="MedicationForm"
              component={MedicationFormScreen}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SettingsProvider>
  );
};

export default App;

/* -------------------------------------------------------------
   Styles
   ------------------------------------------------------------- */

const HEADER_HEIGHT = 80;
const BOTTOM_NAV_HEIGHT = 80;

const styles = StyleSheet.create({
  /* Allgemein */
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },

  /* Header mit Logo */
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#0280BE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 60,
    height: 60,
  },

  /* Hauptinhalt Dashboard */
  content: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  /* Wenn keine Medikamente vorhanden sind */
  emptyBox: {
    alignSelf: 'center',
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#000000',
  },

  /* Liste der Medikamente */
  medListContent: {
    paddingBottom: 8,
  },
  medCard: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 8,
    marginBottom: 8,
  },
  medTextArea: {
    flex: 1,
    paddingRight: 8,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  medDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  medIntake: {
    fontSize: 13,
    marginBottom: 4,
  },
  medNote: {
    fontSize: 12,
  },
  medRightArea: {
    width: 90,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  medPhoto: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  editButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#00b0aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#ffffff',
  },

  /* Untere Leiste */
  bottomBar: {
    height: BOTTOM_NAV_HEIGHT,
    backgroundColor: '#0280BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -75,
  },
  addButtonImage: {
    width: 54,
    height: 54,
  },
  smallIconImage: {
    width: 46,
    height: 46,
  },
  profileIcon: {
    width: 50,
    height: 50,
  },

  /* Profil Screen */
  profileContainer: {
    flex: 1,
    backgroundColor: '#0280BE',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileLogo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '600',
  },
  profileForm: {
    flexGrow: 1,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  labelSmall: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 6,
  },
  input: {
    height: 36,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginLeft: 6,
  },
  checkboxActive: {
    backgroundColor: '#ffffff',
  },
  languageButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  languageButtonText: {
    color: '#000000',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
  },
  profileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 10,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  versionText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },

  /* Modals allgemein */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
  },
  modalCancel: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
});