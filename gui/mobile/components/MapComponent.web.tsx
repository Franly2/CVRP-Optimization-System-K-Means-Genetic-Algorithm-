import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MapComponent() {
  return (
    <View style={styles.webFallbackContainer}>
      <Text style={styles.webFallbackText}>Fitur Peta tidak didukung di versi Web.</Text>
      <Text style={styles.webFallbackText}>Silakan buka aplikasi ini menggunakan HP (Expo Go).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallbackContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  webFallbackText: { fontSize: 16, textAlign: 'center', marginBottom: 10, color: '#333', fontWeight: '500' }
});