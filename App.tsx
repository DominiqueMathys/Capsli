import React, {useState} from 'react';
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
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const HEADER_HEIGHT = 80;
const BOTTOM_NAV_HEIGHT = 80;

/* Dashboard (als leerer Inhalt)*/

type DashboardProps = {
  navigation: any;
};

const DashboardEmptyScreen: React.FC<DashboardProps> = ({navigation}) => {
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
        <TouchableOpacity onPress={() => navigation.navigate('User')}>
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

/* Capsli-User */

const CapsliUserScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [vorname, setVorname] = useState('');
  const [benachrichtigungEin, setBenachrichtigungEin] = useState<
    boolean | null
  >(null);
  const [sprache, setSprache] = useState<string | null>(null);
  const [spracheModalVisible, setSpracheModalVisible] = useState(false);

  const renderRadioBox = (active: boolean) => (
    <View style={[styles.radioBox, active && styles.radioBoxActive]} />
  );

  return (
    <SafeAreaView style={styles.userSafeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.userContainer}>
        <Text style={styles.userTitle}>Capsli-User</Text>

        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.userLabel}>Name :</Text>
          <TextInput
            style={styles.userInput}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#cccccc"
          />
        </View>

        {/* Vorname */}
        <View style={styles.fieldGroup}>
          <Text style={styles.userLabel}>Vorname :</Text>
          <TextInput
            style={styles.userInput}
            value={vorname}
            onChangeText={setVorname}
            placeholder="Vorname"
            placeholderTextColor="#cccccc"
          />
        </View>

        {/* Benachrichtigungen */}
        <View style={styles.fieldGroup}>
          <Text style={styles.userLabel}>Benachrichtigungen :</Text>
          <View style={styles.rowBetween}>
            <View style={styles.rowCenter}>
              <Text style={styles.userRadioLabel}>Ein</Text>
              <TouchableOpacity onPress={() => setBenachrichtigungEin(true)}>
                {renderRadioBox(benachrichtigungEin === true)}
              </TouchableOpacity>
            </View>

            <View style={styles.rowCenter}>
              <Text style={styles.userRadioLabel}>Aus</Text>
              <TouchableOpacity onPress={() => setBenachrichtigungEin(false)}>
                {renderRadioBox(benachrichtigungEin === false)}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sprache */}
        <View style={styles.fieldGroup}>
          <Text style={styles.userLabel}>Sprache :</Text>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setSpracheModalVisible(true)}>
            <Text style={styles.languageButtonText}>
              {sprache ?? 'wählen'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info / Disclaimer */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.infoTitle}>Info/Disclaimer</Text>
            <Text style={styles.infoSubtitle}>
              (Dies ist keine medizinische Beratung)
            </Text>
          </View>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
        </View>

        {/* App-Version */}
        <Text style={styles.versionText}>App-Version : v 1.0</Text>
      </View>

      {/* Sprache-Auswahl Modal */}
      <Modal
        transparent
        visible={spracheModalVisible}
        animationType="fade"
        onRequestClose={() => setSpracheModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sprache wählen</Text>
            {['Deutsch', 'Französisch', 'Englisch'].map(option => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setSprache(option);
                  setSpracheModalVisible(false);
                }}>
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => setSpracheModalVisible(false)}>
              <Text style={styles.modalOptionText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const App: React.FC = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Dashboard" component={DashboardEmptyScreen} />
          <Stack.Screen name="User" component={CapsliUserScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;

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