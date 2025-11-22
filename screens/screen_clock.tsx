import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

type ClockScreenProps = {
  navigation: any;
};

const timeSlots = [
  {time: '08:00', meds: ['Ibuprofen 400 mg'], label: 'Morgen'},
  {time: '12:00', meds: ['Vitamin D'], label: 'Mittag'},
  {time: '18:00', meds: ['Blutdruckmittel'], label: 'Abend'},
  {time: '22:00', meds: [], label: ''},
];

const ClockScreen: React.FC<ClockScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('./assets/back_icon.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Zeitplan</Text>

        <TouchableOpacity>
          <Image
            source={require('./assets/bell_icon.png')}
            style={styles.bellIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* ZEITPLAN */}
      <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {/* linker Zeitstrahl */}
          <View style={styles.timeline}>
            {timeSlots.map((slot, index) => (
              <View key={index} style={styles.timeRow}>
                <Text style={styles.timeLabel}>{slot.time}</Text>

                <View style={styles.dotAndLine}>
                  <View style={styles.timelineDot} />

                  {/* Linie nach unten ausser beim letzten */}
                  {index < timeSlots.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* rechte Info */}
                <View style={styles.medicationContainer}>
                  {slot.meds.length > 0 ? (
                    slot.meds.map((m, i) => (
                      <View key={i} style={styles.medCard}>
                        <Text style={styles.medName}>{m}</Text>
                        <Text style={styles.medLabel}>{slot.label}</Text>
                        <TouchableOpacity style={styles.statusButton}>
                          <Text style={styles.statusButtonText}>genommen</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptySlot} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <Image
            source={require('./assets/clock_icon.png')}
            style={styles.bottomIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MedicationForm')}
          style={styles.addButton}>
          <Image
            source={require('./assets/Bild_Plus_Button.png')}
            style={styles.addButtonImage}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={require('./assets/profil_icon.png')}
            style={styles.bottomIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClockScreen;

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* HEADER */
  header: {
    height: 70,
    backgroundColor: '#0280BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  bellIcon: {
    width: 22,
    height: 22,
  },

  /* TIMELINE */
  timelineScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  timelineContainer: {
    flexDirection: 'row',
  },

  timeline: {
    flexDirection: 'column',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },

  timeLabel: {
    width: 50,
    fontSize: 14,
    color: '#555555',
    marginTop: 3,
  },

  dotAndLine: {
    alignItems: 'center',
    marginRight: 20,
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0280BE',
  },

  timelineLine: {
    width: 2,
    height: 60,
    backgroundColor: '#0280BE',
    marginTop: 2,
  },

  medicationContainer: {
    flex: 1,
  },

  medCard: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    width: '85%',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 2,
    marginBottom: 10,
  },

  medName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  medLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },

  statusButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0280BE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },

  emptySlot: {
    height: 20,
  },

  /* BOTTOM NAV */
  bottomBar: {
    height: 90,
    backgroundColor: '#0280BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
    borderWidth: 2,
    borderColor: '#000000',
  },

  addButtonImage: {
    width: 50,
    height: 50,
  },
});