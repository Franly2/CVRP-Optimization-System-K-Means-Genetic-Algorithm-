import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface Depot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  companyId: string;
}

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ManageDepotScreen() {
  const router = useRouter();
  const { role: userRole } = useAuthStore();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  
  const { colors } = useThemeStore();
  const primaryColor = colors.primary || '#0F172A';

  const fetchDepots = useCallback(async () => {
    setIsLoading(true);
    if (!token) return;
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS; 
      
      const response = await fetch(`http://${api_address}:3000/depot`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setDepots(result.data || []); 
      } else {
        Alert.alert('Gagal', result.message || 'Gagal mengambil data depot');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Koneksi ke server bermasalah');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchDepots();
      return () => {
      };
    }, [fetchDepots])
  );

  const handleAddDepot = () => {
    router.push('/depot/add-depot'); 
  };

  const handleDepotDetail = (depotId: string) => {
    router.push(`/depot/${depotId}`); 
  };

  const renderDepotItem = ({ item }: { item: Depot }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleDepotDetail(item.id)} 
      activeOpacity={0.7} 
    >
      <View style={[styles.iconBox, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
         <Ionicons name="cube" size={24} color={primaryColor} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={styles.depotName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={styles.depotAddress} numberOfLines={2}>{item.address}</ThemedText>
      </View>
      <View style={styles.actionButton}>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Kelola Depot',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerRight: () => {
            if(userRole !== 'OWNER') return null; 
            return (
              <TouchableOpacity 
                onPress={handleAddDepot}
                style={styles.addButtonHeader}
              >
                <Ionicons name="add-circle" size={28} color={primaryColor} />
              </TouchableOpacity>
            );
          },
        }} 
      />

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Memuat data depot...</ThemedText>
        </View>
      ) : depots.length === 0 ? (
        <View style={styles.centerContent}>
          <View style={styles.emptyIconContainer}>
             <Ionicons name="business" size={64} color="#CBD5E1" />
          </View>
          <ThemedText style={styles.emptyTitle}>Belum Ada Depot</ThemedText>
          <ThemedText style={styles.emptyText}>Tambahkan depot pertama Anda untuk mulai mengelola distribusi.</ThemedText>
          <TouchableOpacity 
            style={[styles.addPrimaryButton, { backgroundColor: primaryColor }]} 
            onPress={handleAddDepot}
          >
            <Ionicons name="add" size={20} color="#FFF" style={{marginRight: 6}}/>
            <ThemedText style={styles.addPrimaryButtonText}>Tambah Depot</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={depots}
          keyExtractor={(item) => item.id}
          renderItem={renderDepotItem}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchDepots} 
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  listContainer: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  depotName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4, letterSpacing: -0.3 },
  depotAddress: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  actionButton: { paddingLeft: 10, justifyContent: 'center' },
  addButtonHeader: { marginRight: 15 },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '500' },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20, lineHeight: 22 },
  addPrimaryButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  addPrimaryButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 }
});