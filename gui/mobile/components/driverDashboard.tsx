import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function DriverDashboard({ userName }: { userName: string }) {
  return (
    <View style={styles.content}>
      <ThemedText type="defaultSemiBold" style={styles.menuTitle}>Menu Utama Kurir</ThemedText>
      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="map.fill" size={32} color="#4991CC" />
          <ThemedText>Rute Kirim</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="archivebox.fill" size={32} color="#4991CC" />
          <ThemedText>Data Paket</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 20 },
  menuTitle: { marginTop: 30, marginBottom: 15 },
  menuGrid: { flexDirection: 'row', gap: 15 },
  menuItem: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10
  },
});