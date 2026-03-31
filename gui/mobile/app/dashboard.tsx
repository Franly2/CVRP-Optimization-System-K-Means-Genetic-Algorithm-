import { AdminDashboard } from '@/components/dashboard/adminDashboard';
import { DriverDashboard } from '@/components/dashboard/driverDashboard';
import { OwnerDashboard } from '@/components/dashboard/ownerDashboard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore'; // Pastikan path ini sesuai dengan letak file kamu

export default function DashboardScreen() {
  const { username: userName, role: userRole, logout } = useAuthStore();
  const { colors, logoUrl } = useThemeStore();

  const handleLogout = async () => {
    const executeLogout = async () => {
      await logout();
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Apakah kamu yakin ingin keluar?");
      if (confirmLogout) {
        executeLogout();
      }
    } else {
      Alert.alert("Logout", "Apakah kamu yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: executeLogout }
      ]);
    }
  };

  const getHeaderTitle = () => {
    switch (userRole) {
      case 'OWNER': return 'Dashboard Owner';
      case 'ADMIN': return 'Dashboard Admin';
      case 'DRIVER': return 'Dashboard Kurir';
      default: return 'Memuat...';
    }
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'OWNER':
        return <OwnerDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'DRIVER':
        return <DriverDashboard userName={userName || 'Kurir'} />;
      default:
        // Loading indicator sekarang warnanya dinamis sesuai tema perusahaan
        return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true, 
          title: getHeaderTitle(),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20, paddingTop: 10 }}>
              <ThemedText style={{ color: '#FF3B30', fontWeight: 'bold' }}>Keluar</ThemedText>
            </TouchableOpacity>
          ),
        }} 
      />
      {/* Background warna di sini langsung memakai warna Primary dari Zustand */}
      <View style={[styles.card, { backgroundColor: colors.primary }]}>
        <View style={styles.profileCircle}>
          {logoUrl ? (
            <Image 
              key={logoUrl} // 1. Ini memaksa React merender ulang jika URL berubah
              source={{ uri: logoUrl.trim() }} // 2. Membersihkan karakter spasi tak terlihat
              style={styles.logoImage} 
              resizeMode="cover"
              // 3. Jika gambar gagal dimuat (broken link), kita biarkan kosong agar tidak crash
              onError={(e) => console.log('Gagal memuat gambar logo', e.nativeEvent.error)}
            />
          ) : (
            <ThemedText style={styles.initials}>
              {userName ? userName.substring(0, 2).toUpperCase() : '??'}
            </ThemedText>
          )}

        </View>
        <View>
          <ThemedText type="subtitle" style={{ color: '#fff' }}>Hai, {userName || 'User'}!</ThemedText>
          <ThemedText style={styles.roleText}>{userRole || 'Loading...'}</ThemedText>
        </View>
      </View>

      {renderDashboard()}

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: '#F5F7FA'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 30 
  },
  card: {
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20, 
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Sangat penting agar gambar logo yang kotak bisa terpotong melingkar
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  initials: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  roleText: { 
    color: '#E0E0E0', 
    fontSize: 14 
  },
  menuTitle: { 
    marginTop: 30, 
    marginBottom: 15 
  },
  menuGrid: { 
    flexDirection: 'row', 
    gap: 15 
  },
  menuItem: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10
  },
  logoutButton: {
    backgroundColor: '#FFF5F5', 
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  }
});