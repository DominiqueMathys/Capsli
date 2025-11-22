import React, {useEffect, useState} from 'react';
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
import {SettingsProvider, useSettings} from './SettingsContext';

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
  MedicationForm: {medicationId?: string} | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* -------------------------------------------------------------
   Übersetzungen für Dashboard / Profil
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
    choose: 'wählen',
    infoDisclaimer: 'Info/Disclaimer',
    disclaimerText: '(Dies ist keine medizinische Beratung)',
    versionLabel: 'App-Version :',
    version: 'v 1.0',
    noMeds: 'keine Medikamente erfasst',
    save: 'Speichern',
    cancel: 'Abbrechen',
    chooseLanguageTitle: 'Sprache wählen',
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
    infoQuestion: 'Souhaitez-vous un conseil téléphonique ou un chat ?',
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
    infoQuestion: 'Desidera una consulenza telefonica o una chat?',
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
   Dashboard Screen
   ------------------------------------------------------------- */

type DashboardProps = {
  navigation: any;
};

const DashboardEmptyScreen: React.FC<DashboardProps> = ({navigation}) => {
  const {settings} = useSettings();
  const t = translations[settings.language];

  const [medications, setMedications] = useState<Medication[]>([]);

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
          source={require('./assets/logo-icon.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Inhalt */}
      <View style={styles.content}>
        {medications.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t.noMeds}</Text>
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.medListContent}
            showsVerticalScrollIndicator={false}>
            {medications.map(m => (
              <View key={m.id} style={styles.medCard}>
                <View style={styles.medTextArea}>
                  <Text style={styles.medName}>{m.name}</Text>

                  {(m.startDate || m.endDate) && (
                    <Text style={styles.medDate}>
                      {m.startDate ?? ''}
                      {m.startDate && m.endDate ? t.fromToConnector : ''}
                      {m.endDate ?? ''}
                    </Text>
                  )}

                  {getIntakeText(m) ? (
                    <Text style={styles.medIntake}>{getIntakeText(m)}</Text>
                  ) : null}

                  {m.note ? <Text style={styles.medNote}>{m.note}</Text> : null}
                </View>

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
                      navigation.navigate('MedicationForm', {
                        medicationId: m.id,
                      })
                    }>
                    <Text style={styles.editButtonText}>{t.edit}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Untere Navigationsleiste */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <Image
            source={require('./assets/clock_icon.png')}
            style={styles.smallIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MedicationForm')}>
          <Image
            source={require('./assets/Bild_Plus_Button.png')}
            style={styles.addButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
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

  const [localName, setLocalName] = useState(settings.name);
  const [localFirstName, setLocalFirstName] = useState(settings.firstName);
  const [localNotificationsEnabled, setLocalNotificationsEnabled] = useState(
    settings.notificationsEnabled,
  );
  const [localLanguage, setLocalLanguage] = useState<Language>(
    settings.language,
  );

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

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

      {/* Header mit Logo und Titel */}
      <View style={styles.profileHeader}>
        <Image
          source={require('./assets/logo-icon.png')}
          style={styles.profileLogo}
          resizeMode="contain"
        />
        <Text style={styles.profileTitle}>{currentTranslations.capsliUser}</Text>
      </View>

      {/* Profilformular */}
      <View style={styles.profileForm}>
        <View style={styles.profileFormInner}>
          {/* Name (Label links, Feld rechts) */}
          <View style={styles.inputRow}>
            <Text style={styles.rowLabel}>{currentTranslations.name}</Text>
            <TextInput
              style={styles.input}
              value={localName}
              onChangeText={setLocalName}
              placeholder={currentTranslations.name.replace(':', '')}
              placeholderTextColor="#888"
            />
          </View>

          {/* Vorname */}
          <View style={styles.inputRow}>
            <Text style={styles.rowLabel}>{currentTranslations.firstName}</Text>
            <TextInput
              style={styles.input}
              value={localFirstName}
              onChangeText={setLocalFirstName}
              placeholder={currentTranslations.firstName.replace(':', '')}
              placeholderTextColor="#888"
            />
          </View>

          {/* Benachrichtigungen */}
          <Text style={styles.fullLabel}>
            {currentTranslations.notifications}
          </Text>
          <View style={styles.row}>
            <Text style={styles.labelSmall}>{currentTranslations.on}</Text>
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

          {/* Sprache (Label links, Button rechts) */}
          <View style={styles.inputRow}>
            <Text style={styles.rowLabel}>{currentTranslations.language}</Text>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setLanguageModalVisible(true)}>
              <Text style={styles.languageButtonText}>{languageLabel}</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons Speichern / Abbrechen */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.buttonText}>{currentTranslations.save}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCancel}>
              <Text style={styles.buttonText}>{currentTranslations.cancel}</Text>
            </TouchableOpacity>
          </View>
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

      {/* Modal: Sprache wählen */}
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
            <Stack.Screen name="Dashboard" component={DashboardEmptyScreen} />
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
  /* Dashboard */
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#000000',
  },
  medListContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  medCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medTextArea: {
    flex: 1,
    marginRight: 8,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#000000',
  },
  medDate: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 2,
  },
  medIntake: {
    fontSize: 13,
    color: '#0280BE',
    marginBottom: 2,
  },
  medNote: {
    fontSize: 12,
    color: '#555555',
    marginTop: 4,
  },
  medRightArea: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medPhoto: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0280BE',
  },
  editButtonText: {
    fontSize: 12,
    color: '#0280BE',
  },
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

  /* Profil-Screen */
  profileContainer: {
    flex: 1,
    backgroundColor: '#0280BE',
    paddingTop: 16,
    paddingHorizontal: 0,
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
    alignItems: 'center',
  },
  profileFormInner: {
    width: 300, // schmale Spalte wie im Mockup
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  rowLabel: {
    color: '#ffffff',
    fontSize: 16,
    width: 90,
    marginRight: 8,
  },
  fullLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 60,
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
    flex: 1,
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  languageButtonText: {
    color: '#000000',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 65,
  },
  primaryButton: {
    width: 100,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 100,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
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
    paddingHorizontal: 24,
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

  /* Modals */
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