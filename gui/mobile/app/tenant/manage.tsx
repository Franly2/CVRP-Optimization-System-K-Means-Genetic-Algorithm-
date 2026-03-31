import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ManageTenantScreen() {
  const token = useAuthStore((state) => state.token);
  
  // Ambil state dan fungsi sesuai isi themeStore kamu
  const { colors, logoUrl, setBranding, isThemeLoading } = useThemeStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [companyName, setCompanyName] = useState(''); // State lokal untuk nama perusahaan

  const fetchBranding = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      const response = await fetch(`http://${api_address}:3000/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok) {
        // Simpan nama perusahaan ke state lokal
        setCompanyName(result.data.name);
        
        // Update Zustand Store untuk warna dan logo
        await setBranding({
          colorPrimary: result.data.colorPrimary,
          colorSecondary: result.data.colorSecondary,
          colorTertiary: result.data.colorTertiary,
          logoUrl: result.data.logoUrl,
        });
      } else {
        if (showLoading) Alert.alert('Gagal', result.message || 'Gagal mengambil data');
      }
    } catch (error) {
      if (showLoading) Alert.alert('Error', 'Koneksi ke server bermasalah');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load data pertama kali saat halaman dibuka
  useEffect(() => {
    fetchBranding();
  }, []);

  if (isThemeLoading && !companyName) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Identitas Perusahaan', headerShown: true }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.previewCard}>
          <View style={[styles.banner, { backgroundColor: colors.primary }]}>
             <ThemedText style={styles.bannerText}>Kustomisasi</ThemedText>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.logoWrapper}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
              ) : (
                <Ionicons name="business" size={40} color="#CCC" />
              )}
            </View>
            
            {/* TAMPILKAN NAMA PERUSAHAAN DI SINI */}
            <ThemedText style={styles.companyNameText}>
                {companyName || 'Memuat Nama...'}
            </ThemedText>
            
          </View>

          <View style={styles.colorPalette}>
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: colors.primary }]} />
              <ThemedText style={styles.colorLabel}>Utama</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: colors.secondary }]} />
              <ThemedText style={styles.colorLabel}>Sekunder</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: colors.tertiary }]} />
              <ThemedText style={styles.colorLabel}>Tersier</ThemedText>
            </View>
          </View>
        </View>

        {/* --- Menu --- */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => fetchBranding(true)} disabled={isRefreshing}>
            <Ionicons name="sync-outline" size={22} color={colors.primary} />
            <ThemedText style={styles.menuText}>Sinkronisasi Branding</ThemedText>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Info', 'Fitur ubah warna sedang dikembangkan')}>
            <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
            <ThemedText style={styles.menuText}>Ubah Tema & Logo</ThemedText>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <ThemedText style={styles.infoText}>
            Nama dan skema warna akan muncul di dashboard seluruh pengguna (Admin, Kurir, dan Pelanggan).
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 25,
  },
  banner: { padding: 12, alignItems: 'center' },
  bannerText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  profileInfo: { alignItems: 'center', padding: 20 },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  logo: { width: '75%', height: '75%' },
  companyNameText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'center' 
  },
  subText: { fontSize: 12, color: '#999', marginTop: 4 },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  colorItem: { alignItems: 'center' },
  colorCircle: { width: 35, height: 35, borderRadius: 18, marginBottom: 5, borderWidth: 2, borderColor: '#FFF', elevation: 2 },
  colorLabel: { fontSize: 10, color: '#666', fontWeight: '600' },
  menuSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 10, elevation: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12
  },
  menuText: { flex: 1, fontSize: 15, color: '#333' },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    marginTop: 20,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    alignItems: 'center'
  },
  infoText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 }
});