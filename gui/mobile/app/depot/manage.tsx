import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface Depot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  companyId: string;
}

export default function ManageDepotScreen() {
  const router = useRouter();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);


  const fetchDepots = useCallback (async () => {
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
    }, [])
  );

  const handleAddDepot = () => {
    router.push('/depot/add-depot'); 
  };

  const handleDepotDetail = (depotId: string) => {
    router.push(`/depot/${depotId}`); 
  };

  const renderDepotItem = ({ item }: { item: Depot }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <ThemedText style={styles.depotName}>{item.name}</ThemedText>
        <ThemedText style={styles.depotAddress}>{item.address}</ThemedText>
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => handleDepotDetail(item.id)} // Memanggil fungsi navigasi
      >
        <Ionicons name="chevron-forward" size={24} color="#4991CC" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Kelola Depot',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleAddDepot} // Memanggil fungsi navigasi
              style={styles.addButtonHeader}
            >
              <Ionicons name="add-circle" size={28} color="#4991CC" />
            </TouchableOpacity>
          )
        }} 
      />

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4991CC" />
          <ThemedText style={{ marginTop: 10 }}>Memuat data depot...</ThemedText>
        </View>
      ) : depots.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="business-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>Belum ada depot yang terdaftar.</ThemedText>
          <TouchableOpacity style={styles.addPrimaryButton} onPress={handleAddDepot}>
            <ThemedText style={styles.addPrimaryButtonText}>+ Tambah Depot Pertama</ThemedText>
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
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { padding: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: { flex: 1 },
  depotName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  depotAddress: { fontSize: 14, color: '#666' },
  actionButton: { padding: 10 },
  addButtonHeader: { marginRight: 15 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 20 },
  addPrimaryButton: { backgroundColor: '#4991CC', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  addPrimaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});