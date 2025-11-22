/**
 * screen_clock.tsx
 *
 * Zeitplan-Screen:
 * - zeigt alle Medikamente als Timeline über den Tag
 * - Zuordnung IntakeTimes -> Uhrzeiten (08:00, 12:00, 18:00, 22:00)
 * - Button pro Medikament: "einnehmen" <-> "genommen" (umschaltbar)
 * - oben: Header mit Zurück-Pfeil, Logo und Titel
 * - unten: gleiche Bottom-Bar wie im Dashboard (Uhr, Plus, Profil)
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// gleicher Storage-Key wie im Rest der App
const MEDS_STORAGE_KEY = '@capsli_medications';

/**
 * Typen wie in Ihrer Hauptdatei
 */
type IntakeTimes = {
  morning: boolean;
  noon: boolean;
  evening: boolean;
  night: boolean;
};

type Medication = {
  id: string;
  name: string;
  intakeTimes: IntakeTimes;
  permanent: boolean | null;
  startDate: string | null;
  endDate: string | null;
  note: string;
  photoUri?: string | null;
};

/**
 * Ein Eintrag in der Timeline:
 * - time: Uhrzeit (z. B. "08:00")
 * - label: Text wie "Morgen", "Mittag" usw.
 * - med: das eigentliche Medikament
 */
type ClockEvent = {
  time: string;
  label: string;
  med: Medication;
};

type ClockScreenProps = {
  navigation: any;
};

/**
 * Zuordnung IntakeTimes -> Uhrzeiten und Labels
 * Diese Definition bestimmt, welche Tageszeit zu welcher Uhrzeit gehört.
 */
const TIME_MAPPING = [
  {field: 'morning', time: '08:00', label: 'Morgen'},
  {field: 'noon', time: '12:00', label: 'Mittag'},
  {field: 'evening', time: '18:00', label: 'Abend'},
  {field: 'night', time: '22:00', label: 'Nacht'},
];

const ClockScreen: React.FC<ClockScreenProps> = ({navigation}) => {
  // Alle Events (Medikament + Uhrzeit) in der Timeline
  const [events, setEvents] = useState<ClockEvent[]>([]);
  /**
   * Merkt sich, ob eine Einnahme schon als "genommen" markiert ist.
   * Key: Kombination aus Medikamenten-ID und Uhrzeit, z. B. "abc123-08:00".
   * Wert: true = genommen, false/undefined = noch einzunehmen.
   */
  const [takenMap, setTakenMap] = useState<Record<string, boolean>>({});

  /**
   * Beim ersten Laden alle Medikamente holen und Events erzeugen.
   */
  useEffect(() => {
    loadMedications();
  }, []);

  /**
   * Lädt Medikamente aus AsyncStorage und baut daraus Timeline-Events.
   */
  const loadMedications = async () => {
    try {
      const json = await AsyncStorage.getItem(MEDS_STORAGE_KEY);
      const meds: Medication[] = json ? JSON.parse(json) : [];

      const allEvents: ClockEvent[] = [];

      meds.forEach(med => {
        // Für jede IntakeTime prüfen, ob sie aktiv ist
        TIME_MAPPING.forEach(slot => {
          if (med.intakeTimes[slot.field as keyof IntakeTimes]) {
            allEvents.push({
              time: slot.time,
              label: slot.label,
              med: med,
            });
          }
        });
      });

      // Events nach Uhrzeit sortieren
      const sortedEvents = allEvents.sort((a, b) =>
        a.time.localeCompare(b.time),
      );

      setEvents(sortedEvents);
    } catch (e) {
      console.log('Fehler beim Laden der Timeline', e);
    }
  };

  /**
   * Klick auf "einnehmen" / "genommen":
   * - toggelt den Status in takenMap
   * - derselbe Button kann also auch wieder rückgängig gemacht werden.
   */
  const toggleTaken = (key: string) => {
    setTakenMap(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <View style={styles.container}>
      {/* --------------------------------------------------
         Header mit Zurück-Pfeil, Logo und Titel
         -------------------------------------------------- */}
      <View style={styles.header}>
        {/* einfacher Text-Pfeil als Zurück-Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>

        {/* Mitte: Logo + Titel "Zeitplan" */}
        <View style={styles.headerCenter}>
          <Image
            source={require('../assets/logo-icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Zeitplan</Text>
        </View>

        {/* Platzhalter rechts, damit Inhalt in der Mitte wirklich zentriert ist */}
        <View style={{width: 32}} />
      </View>

      {/* --------------------------------------------------
         Hauptbereich: Timeline mit Uhrzeiten und Karten
         -------------------------------------------------- */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}>
        {/* Durchgehender blauer Strich als Timeline-Hintergrund.
           Wichtig: position:absolute, damit er hinter allen Punkten liegt. */}
        <View style={styles.verticalLine} />

        {TIME_MAPPING.map(slot => {
          // alle Events für diese Uhrzeit (z. B. alle Medikamente um 08:00)
          const slotEvents = events.filter(e => e.time === slot.time);

          return (
            <View key={slot.time} style={styles.row}>
              {/* Uhrzeit links */}
              <Text style={styles.timeText}>{slot.time}</Text>

              {/* Kleine Timeline-Kugel auf dem blauen Strich */}
              <View style={styles.timelineColumn}>
                {/* HIER können Sie die Kugel optisch ändern:
                   - Grösse, Farbe, Rand etc. in styles.dot */}
                <View style={styles.dot} />
              </View>

              {/* Rechte Seite: Karten mit Medikamenten (oder "Keine Einnahme") */}
              <View style={styles.rightContainer}>
                {slotEvents.length === 0 ? (
                  <Text style={styles.noMedsText}>Keine Einnahme</Text>
                ) : (
                  slotEvents.map(e => {
                    const eventKey = `${e.med.id}-${slot.time}`;
                    const isTaken = !!takenMap[eventKey];

                    return (
                      <View key={eventKey} style={styles.medCard}>
                        <Text style={styles.medName}>{e.med.name}</Text>
                        <Text style={styles.medLabel}>{slot.label}</Text>

                        {/* Button: einnehmen <-> genommen */}
                        <TouchableOpacity
                          style={[
                            styles.takeButton,
                            isTaken && styles.takeButtonTaken,
                          ]}
                          onPress={() => toggleTaken(eventKey)}>
                          <Text
                            style={[
                              styles.takeButtonText,
                              isTaken && styles.takeButtonTextTaken,
                            ]}>
                            {isTaken ? 'genommen' : 'einnehmen'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* --------------------------------------------------
         Untere Navigationsleiste (wie in Ihrem Dashboard)
         -------------------------------------------------- */}
      <View style={styles.bottomBar}>
        {/* Uhr-Icon: bleibt auf dem Zeitplan-Screen */}
        <TouchableOpacity onPress={() => navigation.navigate('Clock')}>
          <Image
            source={require('../assets/clock_icon.png')}
            style={styles.bottomIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Plus-Button: neues Medikament erfassen */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MedicationForm')}>
          <Image
            source={require('../assets/Bild_Plus_Button.png')}
            style={styles.addButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Profil-Icon */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('../assets/profil_icon.png')}
            style={styles.bottomIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClockScreen;

/* -----------------------------------------------------------
   STYLES – hier können Sie das Aussehen anpassen
   ----------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* Header-Bereich */
  header: {
    height: 90,
    backgroundColor: '#0280BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLogo: {
    width: 34,
    height: 34,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },

  /* Scroll-Bereich mit der Timeline */
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
    position: 'relative', // wichtig für verticalLine (absolute)
  },

  /**
   * DURCHGEHENDER TIMELINE-STRICH
   * - wenn Sie ihn verschieben möchten, ändern Sie "left"
   * - wenn er dicker/dünner sein soll, ändern Sie "width"
   */
  verticalLine: {
    position: 'absolute',
    left: 70, // horizontale Position der Linie (zwischen Zeit und Karten)
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#0280BE',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
  },

  timeText: {
    width: 50,
    fontSize: 15,
    marginTop: 2,
    color: '#444444',
  },

  /* Spalte für die Timeline-Kugel */
  timelineColumn: {
    width: 11,
    alignItems: 'center',
    marginRight: 20,
  },

  /**
   * TIMELINE-KUGEL
   *
   * → HIER können Sie die Kugel optisch verändern:
   *   - width / height: Grösse
   *   - borderRadius: Rundheit (Hälfte von width/height = Kreis)
   *   - backgroundColor: Farbe
   */
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0280BE',
  },

  rightContainer: {
    flex: 1,
  },

  noMedsText: {
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 4,
  },

  /* Medikamentenkarten rechts */
  medCard: {
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 2,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  medLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },

  /* Button "einnehmen" / "genommen" */
  takeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0280BE',
    backgroundColor: '#ffffff',
  },
  takeButtonTaken: {
    backgroundColor: '#0280BE',
  },
  takeButtonText: {
    fontSize: 13,
    color: '#0280BE',
  },
  takeButtonTextTaken: {
    color: '#ffffff',
  },

  /* Bottom-Bar wie im Dashboard */
  bottomBar: {
    height: 90,
    backgroundColor: '#0280BE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomIcon: {
    width: 40,
    height: 40,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  addButtonImage: {
    width: 50,
    height: 50,
  },
});