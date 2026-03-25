import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function DriverDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  return (
    <View style={styles.content}>
      <ThemedText type="defaultSemiBold" style={styles.menuTitle}>Menu Utama Kurir</ThemedText>
      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/maps')}
        >
          <IconSymbol name="map.fill" size={32} color="#4991CC" />
          <ThemedText style={styles.menuItemText}>Rute Kirim</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          // onPress={() => router.push('/packages')} 
        >
          <IconSymbol name="archivebox.fill" size={32} color="#4991CC" />
          <ThemedText style={styles.menuItemText}>Data Paket</ThemedText>
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
  menuItemText: { fontSize: 16, color: 'black' },
});