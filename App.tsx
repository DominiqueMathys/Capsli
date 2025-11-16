import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

const DashboardEmptyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header mit Logo */}
      <View style={styles.header}>
        <Image
          source={require('./assets/logo.png')} // Dateinamen bei Bedarf anpassen
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Inhalt */}
      <View style={styles.content}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>keine Medikamente erfasst</Text>
        </View>
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
        <TouchableOpacity style={styles.addButton}>
          <Image
            source={require('./assets/Bild_Plus_Button.png')}
            style={styles.addButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Profil */}
        <TouchableOpacity>
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

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="light-content" />
      <DashboardEmptyScreen />
    </SafeAreaView>
  );
};

export default App;

const HEADER_HEIGHT = 80;
const BOTTOM_NAV_HEIGHT = 80;

const styles = StyleSheet.create({
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

  /* Hauptinhalt */
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#000000',
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

  /* Grosser Plus Button */
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

  /* Icons (Uhr & Typ) in der Leiste */
  smallIconImage: {
    width: 46,
    height: 46,
  },
  profileIcon: {
    width: 50,
    height: 50,
  },
});