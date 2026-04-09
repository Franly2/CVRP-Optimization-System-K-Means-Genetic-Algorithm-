import { AdminDashboard } from '@/components/dashboard/adminDashboard';
import { DriverDashboard } from '@/components/dashboard/driverDashboard';
import { OwnerDashboard } from '@/components/dashboard/ownerDashboard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const getIsLightColor = (color: string) => {
  if (!color) return false;
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155; 
};

export default function DashboardScreen() {
  const { username: userName, role: userRole, logout } = useAuthStore();
  const { colors, logoUrl } = useThemeStore();

  const primaryColor = colors.primary || '#0F172A';
  const isLightBackground = getIsLightColor(primaryColor);

  const mainTextColor = isLightBackground ? '#1F2937' : '#FFFFFF'; 
  const subTextColor = isLightBackground ? '#4B5563' : 'rgba(255,255,255,0.8)'; 
  const circleBgColor = isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)';

  const handleLogout = async () => {
    const executeLogout = async () => {
      await logout();
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Apakah kamu yakin ingin keluar?");
      if (confirmLogout) executeLogout();
    } else {
      Alert.alert("Logout", "Apakah kamu yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: executeLogout, style: 'destructive' }
      ]);
    }
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'OWNER': return <OwnerDashboard />;
      case 'ADMIN': return <AdminDashboard />;
      case 'DRIVER': return <DriverDashboard userName={userName || 'Kurir'} />;
      default: return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Matikan Header Bawaan */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Modern Header */}
      <View style={styles.customHeader}>
        <View>
          <ThemedText style={styles.headerGreeting}>Selamat datang kembali,</ThemedText>
          <ThemedText style={styles.headerTitle}>ORBIS Dashboard</ThemedText>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButtonModern}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      {/* Card Profil Modern */}
      <View style={[styles.cardModern, { backgroundColor: primaryColor }]}>
        <View style={[styles.profileCircleModern, { backgroundColor: circleBgColor }]}>
          {logoUrl ? (
            <Image 
              key={logoUrl} 
              source={{ uri: logoUrl.trim() }} 
              style={styles.logoImageModern} 
              resizeMode="cover"
              onError={(e) => console.log('Gagal memuat gambar logo', e.nativeEvent.error)}
            />
          ) : (
            <ThemedText style={[styles.initialsModern, { color: mainTextColor }]}>
              {userName ? userName.substring(0, 2).toUpperCase() : '??'}
            </ThemedText>
          )}
        </View>

        <View style={styles.userInfoModern}>
          <ThemedText style={[styles.userNameModern, { color: mainTextColor }]}>
            {userName || 'User'}
          </ThemedText>
          
          <View style={[styles.roleBadge, { backgroundColor: circleBgColor }]}>
             <ThemedText style={[styles.roleTextModern, { color: mainTextColor }]}>
               {userRole || 'Loading...'}
             </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.dashboardWrapper}>
        {renderDashboard()}
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', // Warna background yang lebih modern (slate-50)
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Penyesuaian safe area
    paddingBottom: 20,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  logoutButtonModern: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    // Sedikit bayangan agar tombol keluarnya lebih hidup
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardModern: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    // Soft shadow yang modern
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24, 
  },
  profileCircleModern: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImageModern: {
    width: '100%',
    height: '100%',
  },
  initialsModern: { 
    fontSize: 22, 
    fontWeight: '800',
    letterSpacing: 1,
  },
  userInfoModern: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameModern: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleTextModern: { 
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dashboardWrapper: {
    flex: 1,
    paddingHorizontal: 8, 
  }
});