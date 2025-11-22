/**
 * screen_clock.tsx
 *
 * Zeitplan-Screen:
 * - zeigt alle Medikamente als Timeline über den Tag
 * - Zuordnung IntakeTimes -> Uhrzeiten (08:00, 12:00, 18:00, 22:00)
 * - Button pro Medikament: "einnehmen" <-> "genommen" (umschaltbar, PERSISTENT)
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
// NEU: eigener Key für den «genommen»-Status
const TAKEN_MAP_STORAGE_KEY = '@capsli_taken_map';

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
 */
const TIME_MAPPING = [
  {field: 'morning', time: '08:00', label: 'Morgen'},
  {field: 'noon', time: '12:00', label: 'Mittag'},
  {field: 'evening', time: '18:00', label: 'Abend'},
  {field: 'night', time: '22:00', label: 'Nacht'},
];

const ClockScreen: React.FC<ClockScreenProps> = ({navigation}) => {
  const [events, setEvents] = useState<ClockEvent[]>([]);
  /**
   * Merkt sich, ob eine Einnahme schon als «genommen» markiert ist.
   * Key: Kombination aus Medikamenten-ID und Uhrzeit, z. B. "abc123-08:00".
   * Wert: true = genommen, false/undefined = noch einzunehmen.
   */
  const [takenMap, setTakenMap] = useState<Record<string, boolean>>({});

  /**
   * Beim Mount:
   * - Medikamente laden und in Events umwandeln
   * - gespeicherten «genommen»-Status laden
   */
  useEffect(() => {
    loadMedications();
    loadTakenMap();
  }, []);

  /**
   * Medikamente aus AsyncStorage holen und Timeline-Events bauen.
   */
  const loadMedications = async () => {
    try {
      const json = await AsyncStorage.getItem(MEDS_STORAGE_KEY);
      const meds: Medication[] = json ? JSON.parse(json) : [];

      const allEvents: ClockEvent[] = [];

      meds.forEach(med => {
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

      const sortedEvents = allEvents.sort((a, b) =>
        a.time.localeCompare(b.time),
      );

      setEvents(sortedEvents);
    } catch (e) {
      console.log('Fehler beim Laden der Timeline', e);
    }
  };

  /**
   * Gespeicherte «genommen»-Map laden
   */
  const loadTakenMap = async () => {
    try {
      const json = await AsyncStorage.getItem(TAKEN_MAP_STORAGE_KEY);
      const map: Record<string, boolean> = json ? JSON.parse(json) : {};
      setTakenMap(map);
    } catch (e) {
      console.log('Fehler beim Laden von takenMap', e);
    }
  };

  /**
   * Helper: updated Map in AsyncStorage speichern
   */
  const saveTakenMap = async (map: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem(TAKEN_MAP_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.log('Fehler beim Speichern von takenMap', e);
    }
  };

  /**
   * Klick auf «einnehmen» / «genommen»:
   * - toggelt den Status in takenMap
   * - speichert die neue Map in AsyncStorage (damit es bleibt)
   */
  const toggleTaken = (key: string) => {
    setTakenMap(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };
      // persistent speichern
      saveTakenMap(updated);
      return updated;
    });
  };

  return (
    <View style={styles.container}>
      {/* --------------------------------------------------
         Header mit Zurück-Pfeil, Logo und Titel
         -------------------------------------------------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require('../assets/logo-icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Zeitplan</Text>
        </View>

        <View style={{width: 32}} />
      </View>

      {/* --------------------------------------------------
         Hauptbereich: Timeline mit Uhrzeiten und Karten
         -------------------------------------------------- */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}>
        {/* durchgehender blauer Strich als Timeline-Hintergrund */}
        <View style={styles.verticalLine} />

        {TIME_MAPPING.map(slot => {
          const slotEvents = events.filter(e => e.time === slot.time);

          return (
            <View key={slot.time} style={styles.row}>
              {/* Uhrzeit links */}
              <Text style={styles.timeText}>{slot.time}</Text>

              {/* Timeline-Kugel auf dem Strich */}
              <View style={styles.timelineColumn}>
                <View style={styles.dot} />
              </View>

              {/* rechte Seite: Karten oder «Keine Einnahme» */}
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
         Untere Navigationsleiste
         -------------------------------------------------- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Clock')}>
          <Image
            source={require('../assets/clock_icon.png')}
            style={styles.bottomIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MedicationForm')}>
          <Image
            source={require('../assets/Bild_Plus_Button.png')}
            style={styles.addButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

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
   STYLES
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
    position: 'relative',
  },

  /* durchgehende Timeline-Linie im Hintergrund */
  verticalLine: {
    position: 'absolute',
    left: 70,
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

  timelineColumn: {
    width: 11,
    alignItems: 'center',
    marginRight: 20,
  },

  /* Timeline-Kugel – Position/Grösse/Farbe können Sie hier anpassen */
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

  /* Button «einnehmen» / «genommen» */
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

  /* Bottom-Bar */
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