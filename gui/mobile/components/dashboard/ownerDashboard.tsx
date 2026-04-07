import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from '../../store/themeStore';

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function OwnerDashboard() {
  const { colors } = useThemeStore();
  const primaryColor = colors.primary || '#0F172A';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Akses Cepat Owner</Text>
      
      <View style={styles.gridContainer}>

        {/* Card: Manage Perusahaan */}
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => router.push('/tenant/manage')}
        >
          <View style={[styles.iconBox, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
            <Ionicons name="business" size={26} color={primaryColor} />
          </View>
          <Text style={styles.menuTitle}>Perusahaan</Text>
          <Text style={styles.menuSubtitle}>Kelola Tenant</Text>
        </TouchableOpacity>
        
        {/* Card: Manage Depot */}
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => router.push('/depot/manage')}
        >
          <View style={[styles.iconBox, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
            <Ionicons name="cube" size={26} color={primaryColor} />
          </View>
          <Text style={styles.menuTitle}>Depot</Text>
          <Text style={styles.menuSubtitle}>Titik Distribusi</Text>
        </TouchableOpacity>

        {/* Card: Kelola Kurir */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.iconBox, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
            <Ionicons name="car" size={26} color={primaryColor} />
          </View>
          <Text style={styles.menuTitle}>Kurir</Text>
          <Text style={styles.menuSubtitle}>Armada & Driver</Text>
        </TouchableOpacity>

        {/* Card: Laporan */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={[styles.iconBox, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
            <Ionicons name="pie-chart" size={26} color={primaryColor} />
          </View>
          <Text style={styles.menuTitle}>Laporan</Text>
          <Text style={styles.menuSubtitle}>Analitik Bisnis</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuCard: {
    width: '48%', // Mengambil 48% layar agar tersusun 2 kolom rapi
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    // Soft shadow yang modern
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start', // Rata kiri lebih terlihat modern untuk card kecil
    marginBottom: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    color: '#0F172A', 
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  menuSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  }
});