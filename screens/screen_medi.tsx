import React, {useState} from 'react';
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
import {useSettings} from '../App';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

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

/* -------------------------------------------------------------
   Übersetzungen des Formulars
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
   Props-Typ für Navigation
   ------------------------------------------------------------- */
type Props = {
  navigation: any;
};

/* -------------------------------------------------------------
   Start des Screens
   ------------------------------------------------------------- */
const MedicationFormScreen: React.FC<Props> = ({navigation}) => {
  const {settings} = useSettings();
  const t = medTranslations[settings.language as Language];

  /* -----------------------------------------------------------
     Lokale States des Formulars
     ----------------------------------------------------------- */
  const [name, setName] = useState('');
  const [permanent, setPermanent] = useState<boolean | null>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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
     Date helper
     ----------------------------------------------------------- */
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  };

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

    if (
      !intakeTimes.morning &&
      !intakeTimes.noon &&
      !intakeTimes.evening &&
      !intakeTimes.night
    ) {
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
     Speichern
     ----------------------------------------------------------- */
  const handleSave = async () => {
    if (!validate()) return;

    const newMedication: Medication = {
      id: Date.now().toString(),
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
      const list: Medication[] = existing ? JSON.parse(existing) : [];
      list.push(newMedication);
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
     Abbrechen
     ----------------------------------------------------------- */
  const handleCancel = () => {
    navigation.goBack();
  };

  const isValidForm = !!name.trim();

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
            
            {/* ---------------------------------------------------
                Logo oben
               --------------------------------------------------- */}
            <View style={styles.header}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>

            {/* ---------------------------------------------------
                Formularbereich
               --------------------------------------------------- */}
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

              {/* Datum: Von / Bis */}
              <View style={[styles.row, {marginTop: 20}]}>
                <Text style={[styles.labelSmall, {flex: 1}]}>
                  {t.from}
                </Text>
                <Text
                  style={[
                    styles.labelSmall,
                    {flex: 1, textAlign: 'right'},
                  ]}>
                  {t.to}
                </Text>
              </View>

              <View style={[styles.row, {marginTop: 4}]}>

                {/* Startdatum */}
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => setShowStartPicker(true)}>
                  {startDate ? (
                    <Text style={styles.dateText}>{startDate}</Text>
                  ) : (
                    <Image
                      source={require('../assets/calendar_icon.png')}
                      style={styles.calendarIcon}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>

                {/* Enddatum */}
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => setShowEndPicker(true)}>
                  {endDate ? (
                    <Text style={styles.dateText}>{endDate}</Text>
                  ) : (
                    <Image
                      source={require('../assets/calendar_icon.png')}
                      style={styles.calendarIcon}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* DatePicker anzeigen */}
              {showStartPicker && (
                <DateTimePicker
                  mode="date"
                  value={new Date()}
                  onChange={(_, date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(formatDate(date));
                  }}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  mode="date"
                  value={new Date()}
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(formatDate(date));
                  }}
                />
              )}

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

              {/* Buttons */}
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
  calendarButton: {
    flex: 1,
    alignItems: 'center',
  },
  calendarIcon: {
    width: 40,
    height: 40,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 16,
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
    marginBottom: 16,
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
  errorText: {
    color: '#ffdddd',
    fontSize: 12,
    marginTop: 2,
  },
});