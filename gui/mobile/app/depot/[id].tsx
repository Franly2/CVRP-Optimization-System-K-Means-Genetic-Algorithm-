import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


interface UserItem { id: string; fullName: string; role: string; username: string; status: string; }
interface OrderItem { id: string; status: string; totalPrice: number; deliveryAddress: string; }
interface PackageItem { id: string; recipientName: string; status: string; weight: number; volume: number; }
interface RouteItem { id: string; status: string; date: string; }
interface ProductItem { id: string; name: string; price: number; weightEst: number; volumeEst: number; isSubscription: boolean;status: string; }

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
  products: ProductItem[];
}

export default function DepotDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  
  const [depot, setDepot] = useState<DepotDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'INFO' | 'USERS' | 'ORDERS' | 'PACKAGES' | 'ROUTES' | 'PRODUCTS'>('INFO');
  const [staffFilter, setStaffFilter] = useState<'ALL' | 'ADMIN' | 'DRIVER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACCEPTED' | 'PENDING' | 'SUSPENDED' | 'REJECTED'>('ALL');
const [productStatusFilter, setProductStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING' | 'REJECTED' | 'DELETED'>('ALL');
  const fetchDepotDetail = async () => {
    setIsLoading(true);
    try {
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'PENDING': return { bg: '#FFF3E0', text: '#EF6C00' };
      case 'REJECTED': return { bg: '#FFEBEE', text: '#C62828' };
      case 'SUSPENDED': return { bg: '#F5F5F5', text: '#424242' };
      default: return { bg: '#ECEFF1', text: '#455A64' };
    }
  };

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

      
        // 1. Filter Gabungan (Role + Status)
        const filteredUsers = depot.users.filter(u => {
          const matchRole = staffFilter === 'ALL' || u.role === staffFilter;
          const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
          return matchRole && matchStatus;
        });

        const sortedUsers = filteredUsers.sort((a, b) => 
          a.fullName.localeCompare(b.fullName)
        );

        return (
          <View>
            {/* --- Filter Bar 1: ROLE --- */}
            <View style={styles.filterContainer}>
              {['ALL', 'ADMIN', 'DRIVER'].map((role) => (
                <TouchableOpacity 
                  key={role}
                  style={[styles.filterButton, staffFilter === role && styles.filterButtonActive]}
                  onPress={() => setStaffFilter(role as any)}
                >
                  <ThemedText style={[styles.filterText, staffFilter === role && styles.filterTextActive]}>
                    {role === 'ALL' ? 'Semua Role' : role}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* --- Filter Bar 2: STATUS (Horizontal Scroll) --- */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterScroll}>
              {['ALL', 'ACCEPTED', 'PENDING', 'SUSPENDED', 'REJECTED'].map((status) => (
                <TouchableOpacity 
                  key={status}
                  style={[styles.statusFilterOption, statusFilter === status && styles.statusFilterOptionActive]}
                  onPress={() => setStatusFilter(status as any)}
                >
                  <View style={[styles.dot, { backgroundColor: getStatusStyle(status).text }]} />
                  <ThemedText style={[styles.statusFilterText, statusFilter === status && styles.statusFilterTextActive]}>
                    {status === 'ALL' ? 'Semua Status' : status}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {sortedUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <ThemedText style={styles.emptyText}>Tidak ada staf yang cocok dengan filter ini.</ThemedText>
              </View>
            )}

            {/* render daftar */}
            {sortedUsers.map((u) => {
              const statusColors = getStatusStyle(u.status);
              return (
                <TouchableOpacity key={u.id} style={styles.listItem} onPress={() => router.push(`/human/${u.id}`)}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ThemedText style={styles.itemTitle}>{u.fullName}</ThemedText>
                      <View style={[styles.statusChip, { backgroundColor: statusColors.bg }]}>
                        <ThemedText style={[styles.statusChipText, { color: statusColors.text }]}>
                          {u.status}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.itemSub}>{u.role} - @{u.username}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#4991CC" />
                </TouchableOpacity>
              );
            })}
          </View>
        );
      
      case 'PRODUCTS':
        const getProductStatusStyle = (status: string) => {
          switch (status) {
            case 'AVAILABLE': return { bg: '#E8F5E9', text: '#2E7D32', label: 'Tersedia' };
            case 'PENDING': return { bg: '#FFF3E0', text: '#EF6C00', label: 'Pending' };
            case 'UNAVAILABLE': return { bg: '#F5F5F5', text: '#616161', label: 'Kosong' };
            case 'REJECTED': return { bg: '#FFEBEE', text: '#C62828', label: 'Ditolak' };
            case 'DELETED': return { bg: '#37474F', text: '#FFFFFF', label: 'Dihapus' };
            default: return { bg: '#ECEFF1', text: '#455A64', label: status };
          }
        };

        // 1. Logika Filter Produk
        const filteredProducts = depot.products.filter(p => {
          return productStatusFilter === 'ALL' || p.status === productStatusFilter;
        });

        return (
          <View>
            {/* --- Filter Bar: STATUS PRODUK (Horizontal Scroll) --- */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterScroll}>
              {['ALL', 'AVAILABLE', 'UNAVAILABLE', 'PENDING', 'REJECTED', 'DELETED'].map((status) => (
                <TouchableOpacity 
                  key={status}
                  style={[styles.statusFilterOption, productStatusFilter === status && styles.statusFilterOptionActive]}
                  onPress={() => setProductStatusFilter(status as any)}
                >
                  <View style={[styles.dot, { backgroundColor: getProductStatusStyle(status).text }]} />
                  <ThemedText style={[styles.statusFilterText, productStatusFilter === status && styles.statusFilterTextActive]}>
                    {status === 'ALL' ? 'Semua Produk' : getProductStatusStyle(status).label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* --- Tampilan jika kosong setelah difilter --- */}
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={48} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  {depot.products.length === 0 
                    ? "Belum ada menu produk di depot ini." 
                    : "Tidak ada produk yang cocok dengan filter."}
                </ThemedText>
              </View>
            ) : (
              /* --- Daftar Produk yang Lulus Filter --- */
              <View style={styles.productGrid}>
                {filteredProducts.map((p) => {
                  const pStatus = getProductStatusStyle(p.status);
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={styles.productCard} 
                      onPress={() => router.push(`/product/${p.id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.productIconContainer}>
                        <Ionicons name={p.isSubscription ? "calendar" : "fast-food"} size={24} color="#4991CC" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 5 }}>
                          <ThemedText style={[styles.productName, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{p.name}</ThemedText>
                          
                          {/* --- CHIP STATUS PRODUK --- */}
                          <View style={[styles.statusChip, { backgroundColor: pStatus.bg }]}>
                            <ThemedText style={[styles.statusChipText, { color: pStatus.text }]}>
                              {pStatus.label}
                            </ThemedText>
                          </View>
                        </View>

                        <ThemedText style={styles.productPrice}>Rp {p.price.toLocaleString('id-ID')}</ThemedText>
                        
                        <View style={styles.productMeta}>
                          <ThemedText style={styles.productMetaText}>{p.weightEst}kg | {p.volumeEst}L</ThemedText>
                          {p.isSubscription && (
                            <View style={styles.subBadge}>
                              <ThemedText style={styles.subBadgeText}>Langganan</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#CCC" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
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
              <TabButton title={`Produk (${depot.products.length})`} tabName="PRODUCTS" />
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
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusFilterScroll: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  statusFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  statusFilterOptionActive: {
    backgroundColor: '#4991CC',
    borderColor: '#4991CC',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#FFF',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },

  // product
  productGrid: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 2,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },
  productMetaText: {
    fontSize: 12,
    color: '#888',
  },
  subBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subBadgeText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: 'bold',
  },
});