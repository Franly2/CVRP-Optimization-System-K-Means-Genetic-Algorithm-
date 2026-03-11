import { AdminDashboard } from '@/components/adminDashboard';
import { DriverDashboard } from '@/components/driverDashboard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const role = await AsyncStorage.getItem('userRole');
        
        if (name && role) {
          setUserName(name);
          setUserRole(role);
        } else {
          router.replace('/');
        }
      } catch (e) {
        console.error("Gagal load data user", e);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    const logoutAction = async () => {
      await AsyncStorage.clear();
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Apakah kamu yakin ingin keluar?");
      if (confirmLogout) {
        logoutAction();
      }
    } else {
      Alert.alert("Logout", "Apakah kamu yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logoutAction }
      ]);
    }
  };


return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true, 
          title: userRole === 'ADMIN' ? 'Dashboard Admin' : 'Dashboard Kurir', 
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20, paddingTop: 10 }}>
              <ThemedText style={{ color: '#FF3B30', fontWeight: 'bold' }}>Keluar</ThemedText>
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.card}>
        <View style={styles.profileCircle}>
          <ThemedText style={styles.initials}>
            {userName ? userName.substring(0, 2).toUpperCase() : '??'}
          </ThemedText>
        </View>
        <View>
          <ThemedText type="subtitle">Hi, {userName}!</ThemedText>
          <ThemedText style={styles.roleText}>{userRole}</ThemedText>
        </View>
      </View>

      {userRole === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <DriverDashboard userName={userName} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 30 
  },
  card: {
    backgroundColor: '#4991CC',
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
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  initials: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  roleText: { color: '#E0E0E0', fontSize: 14 },
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