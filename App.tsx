import React from 'react';
import { SafeAreaView, StatusBar, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardEmptyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard leer</Text>

        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>C</Text>
          </View>
        </View>
      </View>

      {/* Inhalt */}
      <View style={styles.content}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>keine Medikamente erfasst</Text>
        </View>
      </View>

      {/* Navigation unten */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.smallIconButton}>
          <Text style={styles.smallIconText}>🕒</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallIconButton}>
          <Text style={styles.smallIconText}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="light-content" />
      <DashboardEmptyScreen />
    </SafeAreaView>
  );
}

const HEADER_HEIGHT = 60;
const BOTTOM_NAV_HEIGHT = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#0280BE',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#dcdcdc',
    fontSize: 14,
  },
  logoWrapper: {
    position: 'absolute',
    right: 16,
    top: HEADER_HEIGHT / 2 - 16,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#00b894',
    fontWeight: 'bold',
  },
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
  bottomBar: {
    height: BOTTOM_NAV_HEIGHT,
    backgroundColor: '#0280BE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  smallIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconText: {
    fontSize: 22,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  addButtonText: {
    fontSize: 32,
    color: '#00b894',
    marginTop: -4,
  },
});