/**
 * medication_form.tsx
 *
 * Screen zum Erfassen und Bearbeiten von Medikamenten:
 * - wird je nach Route entweder im «Neu anlegen»- oder im «Bearbeiten»-Modus angezeigt
 *   (erkennbar an route.params.medicationId)
 * - liest und speichert Medikamente im AsyncStorage unter dem Key «@capsli_medications»
 *
 * Formularinhalt:
 * - Textfeld für den Namen des Medikaments
 * - Auswahl «Permanent: Ja/Nein»
 * - Datumsbereich «von» / «bis» über DateTimePickerModal
 * - Einnahmezeiten als Checkboxen: Morgen, Mittag, Abend, Nacht
 * - optionales Foto (Auswahl aus der Fotobibliothek via expo-image-picker)
 * - freie Notiz als mehrzeiliges Textfeld
 *
 * Validierung:
 * - Name darf nicht leer sein
 * - es muss mindestens eine Einnahmezeit gewählt sein
 * - Fehlermeldungen werden direkt unter dem jeweiligen Bereich angezeigt
 *
 * Speicherung / Bearbeiten:
 * - beim Speichern wird entweder ein neues Medikament angelegt
 *   oder ein bestehendes (per medicationId) in der Liste ersetzt
 * - die gesamte Medikamentenliste wird im AsyncStorage persistiert
 * - «Abbrechen» verwirft alle Änderungen und navigiert zurück
 * - im Bearbeiten-Modus steht zusätzlich ein Button «Medikament löschen»
 *   zur Verfügung, der den Eintrag aus der Liste entfernt
 *
 * Weitere Punkte:
 * - alle statischen Texte kommen aus den sprachabhängigen Übersetzungen
 *   (de/fr/en/it) über den SettingsContext
 * - das Layout zeigt oben das Logo auf blauem Hintergrund
 *   und darunter das Formular in einem ScrollView (mit Keyboard-Handling)
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSettings} from '../SettingsContext';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

/* -------------------------------------------------------------
   Typen
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

type Props = {
  navigation: any;
  route: any;
};

/* -------------------------------------------------------------
   Uebersetzungen des Formulars
   ------------------------------------------------------------- */
const medTranslations: Record<
  Language,
  {
    title: string;
    name: string;
    permanent: string;
    yes: string;
    no: string;
    from: string;
    to: string;
    intakeTimes: string;
    morning: string;
    noon: string;
    evening: string;
    night: string;
    photo: string;
    note: string;
    save: string;
    cancel: string;
    nameRequired: string;
    intakeRequired: string;
  }
> = {
  de: {
    title: 'Medikament erfassen',
    name: 'Name :',
    permanent: 'Permanent :',
    yes: 'Ja',
    no: 'Nein',
    from: 'von',
    to: 'bis',
    intakeTimes: 'Einnahmezeiten:',
    morning: 'Morgen',
    noon: 'Mittag',
    evening: 'Abend',
    night: 'Nacht',
    photo: 'Foto:',
    note: 'Notiz :',
    save: 'Speichern',
    cancel: 'Abbrechen',
    nameRequired: 'Name ist erforderlich',
    intakeRequired: 'Mindestens eine Einnahmezeit wählen',
  },
  fr: {
    title: 'Enregistrer un médicament',
    name: 'Nom :',
    permanent: 'Permanent :',
    yes: 'Oui',
    no: 'Non',
    from: 'de',
    to: 'à',
    intakeTimes: 'Moments de prise :',
    morning: 'Matin',
    noon: 'Midi',
    evening: 'Soir',
    night: 'Nuit',
    photo: 'Photo :',
    note: 'Note :',
    save: 'Enregistrer',
    cancel: 'Annuler',
    nameRequired: 'Le nom est obligatoire',
    intakeRequired: 'Choisir au moins un moment de prise',
  },
  en: {
    title: 'Add medication',
    name: 'Name :',
    permanent: 'Permanent :',
    yes: 'Yes',
    no: 'No',
    from: 'from',
    to: 'to',
    intakeTimes: 'Intake times:',
    morning: 'Morning',
    noon: 'Noon',
    evening: 'Evening',
    night: 'Night',
    photo: 'Photo:',
    note: 'Note :',
    save: 'Save',
    cancel: 'Cancel',
    nameRequired: 'Name is required',
    intakeRequired: 'Select at least one intake time',
  },
  it: {
    title: 'Aggiungi farmaco',
    name: 'Nome :',
    permanent: 'Permanente :',
    yes: 'Si',
    no: 'No',
    from: 'da',
    to: 'a',
    intakeTimes: 'Orari di assunzione:',
    morning: 'Mattina',
    noon: 'Mezzogiorno',
    evening: 'Sera',
    night: 'Notte',
    photo: 'Foto:',
    note: 'Nota :',
    save: 'Salva',
    cancel: 'Annulla',
    nameRequired: 'Il nome è obbligatorio',
    intakeRequired: 'Seleziona almeno un orario di assunzione',
  },
};

/* -------------------------------------------------------------
   Datum formatieren (z. B. 22 Nov 2025)
   ------------------------------------------------------------- */
const formatDate = (date: Date) => {
  return date.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/* -------------------------------------------------------------
   Screen: neu erfassen oder bearbeiten
   ------------------------------------------------------------- */
const MedicationFormScreen: React.FC<Props> = ({navigation, route}) => {
  const {settings} = useSettings();
  const t = medTranslations[settings.language as Language];

  const editingMedicationId = route?.params?.medicationId as
    | string
    | undefined;

  /* -----------------------------------------------------------
     Lokale States
     ----------------------------------------------------------- */
  const [name, setName] = useState('');
  const [permanent, setPermanent] = useState<boolean | null>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const [intakeTimes, setIntakeTimes] = useState<IntakeTimes>({
    morning: false,
    noon: false,
    evening: false,
    night: false,
  });

  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [nameError, setNameError] = useState('');
  const [intakeError, setIntakeError] = useState('');

  /* -----------------------------------------------------------
     Init
     ----------------------------------------------------------- */
  useEffect(() => {
    const init = async () => {
      if (!editingMedicationId) {
        return;
      }

      try {
        const existing = await AsyncStorage.getItem(MEDS_STORAGE_KEY);
        if (!existing) return;
        const list: Medication[] = JSON.parse(existing);
        const med = list.find(m => m.id === editingMedicationId);
        if (!med) return;

        setName(med.name);
        setPermanent(med.permanent);
        setStartDate(med.startDate);
        setEndDate(med.endDate);
        setIntakeTimes(med.intakeTimes);
        setNote(med.note);
        setPhotoUri(med.photoUri ?? null);
      } catch (e) {
        console.log('Fehler beim Laden des Medikaments', e);
      }
    };

    init();
  }, [editingMedicationId]);

  /* -----------------------------------------------------------
     Einnahmezeiten umschalten
     ----------------------------------------------------------- */
  const toggleIntake = (key: keyof IntakeTimes) => {
    setIntakeTimes(prev => ({...prev, [key]: !prev[key]}));
  };

  /* -----------------------------------------------------------
     Formular prüfen
     ----------------------------------------------------------- */
  const validate = () => {
    let ok = true;

    if (!name.trim()) {
      setNameError(t.nameRequired);
      ok = false;
    } else {
      setNameError('');
    }

    const hasIntake =
      intakeTimes.morning ||
      intakeTimes.noon ||
      intakeTimes.evening ||
      intakeTimes.night;

    if (!hasIntake) {
      setIntakeError(t.intakeRequired);
      ok = false;
    } else {
      setIntakeError('');
    }

    return ok;
  };

  /* -----------------------------------------------------------
     Bild aus Bibliothek wählen
     ----------------------------------------------------------- */
  const pickImage = async () => {
    const {status} =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Zugriff auf die Fotobibliothek ist nötig.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  /* -----------------------------------------------------------
     DatePicker-Handler
     ----------------------------------------------------------- */
  const openStartPicker = () => {
    setStartPickerVisible(true);
  };

  const openEndPicker = () => {
    setEndPickerVisible(true);
  };

  const handleStartConfirm = (date: Date) => {
    setStartDate(formatDate(date));
    setStartPickerVisible(false);
  };

  const handleEndConfirm = (date: Date) => {
    setEndDate(formatDate(date));
    setEndPickerVisible(false);
  };

  const handleDateCancel = () => {
    setStartPickerVisible(false);
    setEndPickerVisible(false);
  };

  /* -----------------------------------------------------------
     Speichern
     ----------------------------------------------------------- */
  const handleSave = async () => {
    if (!validate()) return;

    const newMedication: Medication = {
      id: editingMedicationId ?? Date.now().toString(),
      name: name.trim(),
      permanent,
      startDate,
      endDate,
      intakeTimes,
      note: note.trim(),
      photoUri,
    };

    try {
      const existing = await AsyncStorage.getItem(MEDS_STORAGE_KEY);
      let list: Medication[] = existing ? JSON.parse(existing) : [];

      if (editingMedicationId) {
        list = list.map(m =>
          m.id === editingMedicationId ? newMedication : m,
        );
      } else {
        list.push(newMedication);
      }

      await AsyncStorage.setItem(
        MEDS_STORAGE_KEY,
        JSON.stringify(list),
      );
    } catch (e) {
      console.log('Fehler beim Speichern:', e);
    }

    navigation.goBack();
  };

  /* -----------------------------------------------------------
     Löschen
     ----------------------------------------------------------- */
  const handleDelete = async () => {
    if (!editingMedicationId) {
      navigation.goBack();
      return;
    }

    try {
      const existing = await AsyncStorage.getItem(MEDS_STORAGE_KEY);
      const list: Medication[] = existing ? JSON.parse(existing) : [];
      const filtered = list.filter(m => m.id !== editingMedicationId);
      await AsyncStorage.setItem(
        MEDS_STORAGE_KEY,
        JSON.stringify(filtered),
      );
    } catch (e) {
      console.log('Fehler beim Löschen:', e);
    }

    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const hasIntake =
    intakeTimes.morning ||
    intakeTimes.noon ||
    intakeTimes.evening ||
    intakeTimes.night;

  const isValidForm = !!name.trim() && hasIntake;

  /* -----------------------------------------------------------
     UI
     ----------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {/* Logo oben */}
            <View style={styles.header}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>

            {/* Formularbereich */}
            <View style={styles.form}>
              {/* Name */}
              <Text style={styles.label}>{t.name}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder=""
                placeholderTextColor="#ccc"
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}

              {/* Permanent */}
              <Text style={[styles.label, {marginTop: 16}]}>
                {t.permanent}
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    permanent === true && styles.checkboxActive,
                  ]}
                  onPress={() => setPermanent(true)}
                />
                <Text style={styles.labelSmall}>{t.yes}</Text>

                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    permanent === false && styles.checkboxActive,
                    {marginLeft: 24},
                  ]}
                  onPress={() => setPermanent(false)}
                />
                <Text style={styles.labelSmall}>{t.no}</Text>
              </View>

              {/* Datum: von / bis mit Icon oben und Datum darunter */}
              <View style={styles.dateRow}>
                {/* von */}
                <View style={styles.dateColumn}>
                  <Text style={styles.dateLabel}>{t.from}</Text>

                  <TouchableOpacity onPress={openStartPicker}>
                    <Image
                      source={require('../assets/calendar_icon.png')}
                      style={styles.dateIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  {startDate && (
                    <Text style={styles.dateValue}>{startDate}</Text>
                  )}
                </View>

                {/* bis */}
                <View style={styles.dateColumn}>
                  <Text
                    style={[styles.dateLabel, {textAlign: 'right'}]}>
                    {t.to}
                  </Text>

                  <TouchableOpacity onPress={openEndPicker}>
                    <Image
                      source={require('../assets/calendar_icon.png')}
                      style={styles.dateIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  {endDate && (
                    <Text
                      style={[
                        styles.dateValue,
                        {textAlign: 'right'},
                      ]}>
                      {endDate}
                    </Text>
                  )}
                </View>
              </View>

              {/* Modal DatePicker «von» */}
              <DateTimePickerModal
                isVisible={isStartPickerVisible}
                mode="date"
                display="spinner"
                locale="de-CH"
                themeVariant="light"
                isDarkModeEnabled={false}
                onConfirm={handleStartConfirm}
                onCancel={handleDateCancel}
              />

              {/* Modal DatePicker «bis» */}
              <DateTimePickerModal
                isVisible={isEndPickerVisible}
                mode="date"
                display="spinner"
                locale="de-CH"
                themeVariant="light"
                isDarkModeEnabled={false}
                onConfirm={handleEndConfirm}
                onCancel={handleDateCancel}
              />

              {/* Einnahmezeiten */}
              <Text style={[styles.label, {marginTop: 20}]}>
                {t.intakeTimes}
              </Text>

              <View style={styles.row}>
                {/* Morgen */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    intakeTimes.morning && styles.checkboxActive,
                  ]}
                  onPress={() => toggleIntake('morning')}
                />
                <Text style={styles.labelSmall}>{t.morning}</Text>

                {/* Mittag */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    intakeTimes.noon && styles.checkboxActive,
                    {marginLeft: 24},
                  ]}
                  onPress={() => toggleIntake('noon')}
                />
                <Text style={styles.labelSmall}>{t.noon}</Text>
              </View>

              <View style={[styles.row, {marginTop: 8}]}>
                {/* Abend */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    intakeTimes.evening && styles.checkboxActive,
                  ]}
                  onPress={() => toggleIntake('evening')}
                />
                <Text style={styles.labelSmall}>{t.evening}</Text>

                {/* Nacht */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    intakeTimes.night && styles.checkboxActive,
                    {marginLeft: 24},
                  ]}
                  onPress={() => toggleIntake('night')}
                />
                <Text style={styles.labelSmall}>{t.night}</Text>
              </View>

              {intakeError ? (
                <Text style={styles.errorText}>{intakeError}</Text>
              ) : null}

              {/* Foto */}
              <Text style={[styles.label, {marginTop: 20}]}>
                {t.photo}
              </Text>

              <TouchableOpacity
                style={styles.photoBox}
                onPress={pickImage}>
                {photoUri ? (
                  <Image
                    source={{uri: photoUri}}
                    style={styles.photoSelected}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../assets/photo_placeholder.png')}
                    style={styles.photoIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>

              {/* Notiz */}
              <Text style={[styles.label, {marginTop: 20}]}>
                {t.note}
              </Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={note}
                onChangeText={setNote}
                multiline
              />

              {/* Buttons Speichern / Abbrechen */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !isValidForm && {opacity: 0.5},
                  ]}
                  disabled={!isValidForm}
                  onPress={handleSave}>
                  <Text style={styles.buttonText}>{t.save}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCancel}>
                  <Text style={styles.buttonText}>{t.cancel}</Text>
                </TouchableOpacity>
              </View>

              {/* Löschen Button nur im Bearbeiten Modus */}
              {editingMedicationId && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>
                    Medikament löschen
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default MedicationFormScreen;

/* -------------------------------------------------------------
   Styles
   ------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0280BE',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  headerLogo: {
    width: 70,
    height: 70,
  },
  form: {
    paddingHorizontal: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
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
  noteInput: {
    height: 60,
    textAlignVertical: 'top',
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
  },
  checkboxActive: {
    backgroundColor: '#ffffff',
  },

  /* Datum-Bereich */
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  dateIcon: {
    width: 32,
    height: 32,
  },
  dateValue: {
    marginTop: 6,
    color: '#ffffff',
    fontSize: 14,
  },

  photoBox: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  photoIcon: {
    width: 40,
    height: 40,
  },
  photoSelected: {
    width: '100%',
    height: '100%',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff5555',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
    marginBottom: 16,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 13,
  },
  errorText: {
    color: '#ffdddd',
    fontSize: 12,
    marginTop: 2,
  },
});