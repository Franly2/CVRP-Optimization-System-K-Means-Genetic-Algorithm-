import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Pastikan ini import yang benar jika pakai React Navigation Native
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface UserItem { id: string; fullName: string; role: string; username: string; }
interface OrderItem { id: string; status: string; totalPrice: number; deliveryAddress: string; }
interface PackageItem { id: string; recipientName: string; status: string; weight: number; volume: number; }
interface RouteItem { id: string; status: string; date: string; }

interface DepotDetail {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  users: UserItem[];
  orders: OrderItem[];
  packages: PackageItem[];
  routes: RouteItem[];
}

export default function DepotDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [depot, setDepot] = useState<DepotDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Tab Navigasi
  const [activeTab, setActiveTab] = useState<'INFO' | 'USERS' | 'ORDERS' | 'PACKAGES' | 'ROUTES'>('INFO');
  
  // State Baru: Untuk Filter Tipe Staf
  const [staffFilter, setStaffFilter] = useState<'ALL' | 'ADMIN' | 'DRIVER'>('ALL');

  const fetchDepotDetail = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS; 
      
      const response = await fetch(`http://${api_address}:3000/depot/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setDepot(result.data); 
      } else {
        Alert.alert('Gagal', result.message || 'Gagal mengambil detail depot');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Koneksi ke server bermasalah');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchDepotDetail();
      }
    }, [id])
  );

  const TabButton = ({ title, tabName }: { title: string, tabName: any }) => (
    <TouchableOpacity 
      style={[styles.tabButton, activeTab === tabName && styles.tabButtonActive]}
      onPress={() => setActiveTab(tabName)}
    >
      <ThemedText style={[styles.tabText, activeTab === tabName && styles.tabTextActive]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  const handleAddStaff = () => {
    router.push({
      pathname: '/depot/addStaff', 
      params: { depotId: id } 
    });
  };

  const renderContent = () => {
    if (!depot) return null;

    switch (activeTab) {
      case 'INFO':
        return (
          <View style={styles.card}>
            <ThemedText style={styles.label}>Alamat Lengkap</ThemedText>
            <ThemedText style={styles.value}>{depot.address}</ThemedText>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Latitude</ThemedText>
                <ThemedText style={styles.value}>{depot.lat}</ThemedText>
              </View>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.label}>Longitude</ThemedText>
                <ThemedText style={styles.value}>{depot.lng}</ThemedText>
              </View>
            </View>
            <View style={styles.divider} />
            <ThemedText style={styles.label}>Statistik Cepat</ThemedText>
            <ThemedText style={styles.statsText}>• {depot.users.length} Staf / Kurir</ThemedText>
            <ThemedText style={styles.statsText}>• {depot.orders.length} Order Tercatat</ThemedText>
            <ThemedText style={styles.statsText}>• {depot.packages.length} Paket Menunggu</ThemedText>
          </View>
        );
      
      case 'USERS':
        const filteredUsers = depot.users.filter(u => {
          if (staffFilter === 'ALL') return true;
          return u.role === staffFilter;
        });

        return (
          <View>
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={[styles.filterButton, staffFilter === 'ALL' && styles.filterButtonActive]}
                onPress={() => setStaffFilter('ALL')}
              >
                <ThemedText style={[styles.filterText, staffFilter === 'ALL' && styles.filterTextActive]}>Semua</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterButton, staffFilter === 'ADMIN' && styles.filterButtonActive]}
                onPress={() => setStaffFilter('ADMIN')}
              >
                <ThemedText style={[styles.filterText, staffFilter === 'ADMIN' && styles.filterTextActive]}>Admin</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterButton, staffFilter === 'DRIVER' && styles.filterButtonActive]}
                onPress={() => setStaffFilter('DRIVER')}
              >
                <ThemedText style={[styles.filterText, staffFilter === 'DRIVER' && styles.filterTextActive]}>Driver</ThemedText>
              </TouchableOpacity>
            </View>

            {filteredUsers.length === 0 && (
              <ThemedText style={styles.emptyText}>Tidak ada staf dengan filter ini.</ThemedText>
            )}

            {/* 4. Render Daftar Hasil Filter */}
            {filteredUsers.map((u) => (
              <TouchableOpacity key={u.id} style={styles.listItem} onPress={() => Alert.alert('Detail', `Detail User: ${u.fullName}`)}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.itemTitle}>{u.fullName}</ThemedText>
                  <ThemedText style={styles.itemSub}>{u.role} - @{u.username}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4991CC" />
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'ORDERS':
        return depot.orders.map((o) => (
          <TouchableOpacity key={o.id} style={styles.listItem} onPress={() => Alert.alert('Detail', `Detail Order: ${o.id}`)}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.itemTitle}>Order ID: {o.id.substring(0,8)}...</ThemedText>
              <ThemedText style={styles.itemSub}>Status: {o.status}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4991CC" />
          </TouchableOpacity>
        ));

      case 'PACKAGES':
        return depot.packages.map((p) => (
          <TouchableOpacity key={p.id} style={styles.listItem} onPress={() => Alert.alert('Detail', `Detail Paket: ${p.recipientName}`)}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.itemTitle}>{p.recipientName}</ThemedText>
              <ThemedText style={styles.itemSub}>Berat: {p.weight}kg | Vol: {p.volume}L</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4991CC" />
          </TouchableOpacity>
        ));
        
      case 'ROUTES':
        return depot.routes.length === 0 ? (
          <ThemedText style={styles.emptyText}>Belum ada rute pengiriman.</ThemedText>
        ) : (
          depot.routes.map((r) => (
            <TouchableOpacity key={r.id} style={styles.listItem} onPress={() => Alert.alert('Detail', `Detail Rute: ${r.id}`)}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.itemTitle}>Rute: {r.id.substring(0,8)}...</ThemedText>
                <ThemedText style={styles.itemSub}>Status: {r.status}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4991CC" />
            </TouchableOpacity>
          ))
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
    <Stack.Screen 
      options={{ 
        title: 'Detail Depot', 
        headerShown: true,
        headerRight: () => {
          if (activeTab === 'USERS') {
            return (
              <TouchableOpacity onPress={handleAddStaff} style={{ marginRight: 15 }}>
                <Ionicons name="person-add" size={24} color="#4991CC" />
              </TouchableOpacity>
            );
          }
          return null; 
        }
      }} 
    />

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4991CC" />
          <ThemedText style={{ marginTop: 10 }}>Memuat detail...</ThemedText>
        </View>
      ) : depot ? (
        <View style={{ flex: 1 }}>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Ionicons name="business" size={36} color="#4991CC" />
              <View style={styles.titleContainer}>
                <ThemedText style={styles.depotName}>{depot.name}</ThemedText>
                <ThemedText style={styles.depotId}>ID: {id}</ThemedText> 
              </View>
            </View>
          </View>

          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
              <TabButton title="Informasi" tabName="INFO" />
              <TabButton title={`Staf (${depot.users.length})`} tabName="USERS" />
              <TabButton title={`Order (${depot.orders.length})`} tabName="ORDERS" />
              <TabButton title={`Paket (${depot.packages.length})`} tabName="PACKAGES" />
              <TabButton title={`Rute (${depot.routes.length})`} tabName="ROUTES" />
            </ScrollView>
          </View>

          <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            {renderContent()}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.centerContent}>
          <ThemedText>Data depot tidak ditemukan.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#FFFFFF', padding: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  titleContainer: { marginLeft: 15, flex: 1 },
  depotName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  depotId: { fontSize: 12, color: '#888', marginTop: 2 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, backgroundColor: '#F0F0F0' },
  tabButtonActive: { backgroundColor: '#4991CC' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  contentScroll: { flex: 1, padding: 15 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  value: { fontSize: 16, color: '#222', fontWeight: '500', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { flex: 1 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  statsText: { fontSize: 15, color: '#444', marginBottom: 5, fontWeight: '500' },

  listItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemSub: { fontSize: 13, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },

  filterContainer: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  filterButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#4991CC', backgroundColor: '#FFF' },
  filterButtonActive: { backgroundColor: '#4991CC' },
  filterText: { color: '#4991CC', fontSize: 13, fontWeight: 'bold' },
  filterTextActive: { color: '#FFF' },
});