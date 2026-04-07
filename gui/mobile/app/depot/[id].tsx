import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface UserItem { id: string; fullName: string; role: string; username: string; status: string; }
interface OrderItem { id: string; status: string; totalPrice: number; deliveryAddress: string; }
interface PackageItem { id: string; recipientName: string; status: string; weight: number; volume: number; }
interface RouteItem { id: string; status: string; date: string; }

interface ProductImage { id: string; url: string; isMain: boolean; }
interface ProductItem { 
  id: string; 
  name: string; 
  price: number; 
  weightEst: number; 
  volumeEst: number; 
  isSubscription: boolean;
  status: string; 
  images?: ProductImage[]; 
}

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

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function DepotDetailScreen() {
  const { username: userName, role: userRole, logout } = useAuthStore();
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  
  const { colors } = useThemeStore();
  const primaryColor = colors.primary || '#0F172A';

  const [depot, setDepot] = useState<DepotDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'INFO' | 'USERS' | 'PRODUCTS' | 'ORDERS' | 'PACKAGES' | 'ROUTES'>('INFO');
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

  const TabButton = ({ title, tabName }: { title: string, tabName: any }) => {
    const isActive = activeTab === tabName;
    return (
      <TouchableOpacity 
        style={[
          styles.tabButton, 
          isActive && { backgroundColor: primaryColor } 
        ]}
        onPress={() => setActiveTab(tabName)}
        activeOpacity={0.8}
      >
        <ThemedText style={[styles.tabText, isActive && styles.tabTextActive]}>
          {title}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { bg: '#DCFCE7', text: '#166534' };
      case 'PENDING': return { bg: '#FEF9C3', text: '#9A3412' };
      case 'REJECTED': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'SUSPENDED': return { bg: '#F1F5F9', text: '#334155' };
      default: return { bg: '#F8FAFC', text: '#475569' };
    }
  };

  const handleAddStaff = () => {
    router.push({
      pathname: '/depot/addStaff', 
      params: { depotId: id } 
    });
  };

  const handleAddProduct = () => {
    router.push({
      pathname: '/product/add-product',
      params: { depotId: id }
    });
  };

  const handleEditDepot = () => {
  if (!depot) return;
  router.push({
    pathname: '/depot/edit-depot',
    params: { 
      id: id,
      name: depot.name,
      address: depot.address,
      lat: depot.lat,
      lng: depot.lng
    }
  });
  };

  const renderContent = () => {
    if (!depot) return null;

    switch (activeTab) {
      case 'INFO':
        return (
          <View style={styles.cardModern}>
            <View style={styles.infoRow}>
               <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                 <Ionicons name="location" size={20} color={primaryColor} />
               </View>
               <View style={{flex: 1}}>
                 <ThemedText style={styles.labelModern}>Alamat Lengkap</ThemedText>
                 <ThemedText style={styles.valueModern}>{depot.address}</ThemedText>
               </View>
            </View>

            <View style={styles.dividerModern} />

            <View style={styles.rowModern}>
              <View style={styles.halfWidthModern}>
                <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.1), marginBottom: 8 }]}>
                   <Ionicons name="compass" size={20} color={primaryColor} />
                </View>
                <ThemedText style={styles.labelModern}>Latitude</ThemedText>
                <ThemedText style={styles.valueModern}>{depot.lat}</ThemedText>
              </View>
              <View style={styles.halfWidthModern}>
                <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.1), marginBottom: 8 }]}>
                   <Ionicons name="navigate" size={20} color={primaryColor} />
                </View>
                <ThemedText style={styles.labelModern}>Longitude</ThemedText>
                <ThemedText style={styles.valueModern}>{depot.lng}</ThemedText>
              </View>
            </View>

            <View style={styles.dividerModern} />
            
            <ThemedText style={[styles.labelModern, {marginBottom: 12}]}>Statistik Cepat</ThemedText>
            <View style={styles.statsGrid}>
               <View style={styles.statBox}>
                  <ThemedText style={styles.statNumber}>{depot.users.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Staf Aktif</ThemedText>
               </View>
               <View style={styles.statBox}>
                  <ThemedText style={styles.statNumber}>{depot.orders.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Order</ThemedText>
               </View>
               <View style={styles.statBox}>
                  <ThemedText style={styles.statNumber}>{depot.packages.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Paket Berjalan</ThemedText>
               </View>
            </View>
          </View>
        );
      
      case 'USERS':
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
            <View style={styles.filterContainerModern}>
              {['ALL', 'ADMIN', 'DRIVER'].map((role) => {
                const isActive = staffFilter === role;
                return (
                  <TouchableOpacity 
                    key={role}
                    style={[
                      styles.filterButtonModern, 
                      { borderColor: hexToRgba(primaryColor, 0.2) }, 
                      isActive && { backgroundColor: hexToRgba(primaryColor, 0.1), borderColor: primaryColor } 
                    ]}
                    onPress={() => setStaffFilter(role as any)}
                  >
                    <ThemedText style={[
                      styles.filterTextModern, 
                      { color: isActive ? primaryColor : '#64748B' },
                      isActive && { fontWeight: '700' }
                    ]}>
                      {role === 'ALL' ? 'Semua Role' : role}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterScrollModern} contentContainerStyle={{paddingRight: 20}}>
              {['ALL', 'ACCEPTED', 'PENDING', 'SUSPENDED', 'REJECTED'].map((status) => {
                const isActive = statusFilter === status;
                return (
                  <TouchableOpacity 
                    key={status}
                    style={[
                      styles.statusFilterOptionModern, 
                      isActive && { backgroundColor: primaryColor, borderColor: primaryColor } 
                    ]}
                    onPress={() => setStatusFilter(status as any)}
                  >
                    <View style={[styles.dotModern, { backgroundColor: isActive ? '#FFF' : getStatusStyle(status).text }]} />
                    <ThemedText style={[styles.statusFilterTextModern, isActive && styles.statusFilterTextActiveModern]}>
                      {status === 'ALL' ? 'Semua Status' : status}
                    </ThemedText>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {sortedUsers.length === 0 && (
              <View style={styles.emptyContainerModern}>
                <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                <ThemedText style={styles.emptyTextModern}>Tidak ada staf yang ditemukan.</ThemedText>
              </View>
            )}

            {sortedUsers.map((u) => {
              const statusColors = getStatusStyle(u.status);
              return (
                <TouchableOpacity key={u.id} style={styles.listItemModern} onPress={() => router.push(`/human/${u.id}`)} activeOpacity={0.7}>
                  <View style={[styles.userAvatar, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                    <ThemedText style={[styles.userAvatarText, { color: primaryColor }]}>
                      {u.fullName.substring(0, 2).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.itemTitleModern}>{u.fullName}</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                      <ThemedText style={styles.itemSubModern}>{u.role}</ThemedText>
                      <ThemedText style={{color: '#CBD5E1'}}>•</ThemedText>
                      <ThemedText style={styles.itemSubModern}>@{u.username}</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.statusChipModern, { backgroundColor: statusColors.bg }]}>
                     <ThemedText style={[styles.statusChipTextModern, { color: statusColors.text }]}>
                       {u.status}
                     </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      
      case 'PRODUCTS':
        const getProductStatusStyle = (status: string) => {
          switch (status) {
            case 'AVAILABLE': return { bg: '#DCFCE7', text: '#166534', label: 'Tersedia' };
            case 'PENDING': return { bg: '#FEF9C3', text: '#9A3412', label: 'Pending' };
            case 'UNAVAILABLE': return { bg: '#F1F5F9', text: '#475569', label: 'Kosong' };
            case 'REJECTED': return { bg: '#FEE2E2', text: '#991B1B', label: 'Ditolak' };
            case 'DELETED': return { bg: '#1E293B', text: '#F8FAFC', label: 'Dihapus' };
            default: return { bg: '#F8FAFC', text: '#64748B', label: status };
          }
        };

        const filteredProducts = depot.products.filter(p => {
          return productStatusFilter === 'ALL' || p.status === productStatusFilter;
        });

        return (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilterScrollModern} contentContainerStyle={{paddingRight: 20}}>
              {['ALL', 'AVAILABLE', 'UNAVAILABLE', 'PENDING', 'REJECTED', 'DELETED'].map((status) => {
                 const isActive = productStatusFilter === status;
                 return (
                  <TouchableOpacity 
                    key={status}
                    style={[
                      styles.statusFilterOptionModern, 
                      isActive && { backgroundColor: primaryColor, borderColor: primaryColor }
                    ]}
                    onPress={() => setProductStatusFilter(status as any)}
                  >
                    <View style={[styles.dotModern, { backgroundColor: isActive ? '#FFF' : getProductStatusStyle(status).text }]} />
                    <ThemedText style={[styles.statusFilterTextModern, isActive && styles.statusFilterTextActiveModern]}>
                      {status === 'ALL' ? 'Semua Produk' : getProductStatusStyle(status).label}
                    </ThemedText>
                  </TouchableOpacity>
                 )
              })}
            </ScrollView>

            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainerModern}>
                <Ionicons name="fast-food-outline" size={64} color="#CBD5E1" />
                <ThemedText style={styles.emptyTextModern}>
                  {depot.products.length === 0 
                    ? "Belum ada produk terdaftar." 
                    : "Tidak ada produk dengan filter ini."}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.productGridModern}>
                {filteredProducts.map((p) => {
                  const pStatus = getProductStatusStyle(p.status);
                  const mainImage = p.images && p.images.length > 0 
                    ? p.images.find(img => img.isMain) || p.images[0] 
                    : null;

                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={styles.productCardModern} 
                      onPress={() => router.push(`/product/${p.id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.productImageContainerModern, !mainImage && { backgroundColor: hexToRgba(primaryColor, 0.05) }]}>
                        {mainImage ? (
                          <Image source={{ uri: mainImage.url }} style={styles.productImageModern} resizeMode="cover" />
                        ) : (
                          <Ionicons name={p.isSubscription ? "calendar" : "cube"} size={28} color={primaryColor} />
                        )}
                        <View style={[styles.productStatusBadge, { backgroundColor: pStatus.bg }]}>
                          <ThemedText style={[styles.productStatusText, { color: pStatus.text }]}>{pStatus.label}</ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.productInfoModern}>
                        <ThemedText style={styles.productNameModern} numberOfLines={2}>{p.name}</ThemedText>
                        <ThemedText style={[styles.productPriceModern, { color: primaryColor }]}>
                          Rp {p.price.toLocaleString('id-ID')}
                        </ThemedText>
                        
                        <View style={styles.productMetaModern}>
                          <ThemedText style={styles.productMetaTextModern}>{p.weightEst}kg • {p.volumeEst}L</ThemedText>
                          {p.isSubscription && (
                            <View style={[styles.subBadgeModern, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                              <ThemedText style={[styles.subBadgeTextModern, { color: primaryColor }]}>Langganan</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );

      case 'ORDERS':
      case 'PACKAGES':
      case 'ROUTES':
        const emptyMsg = {
          'ORDERS': 'Belum ada order tercatat.',
          'PACKAGES': 'Tidak ada paket menunggu.',
          'ROUTES': 'Belum ada rute pengiriman.'
        };
        const iconName = {
          'ORDERS': 'receipt-outline',
          'PACKAGES': 'cube-outline',
          'ROUTES': 'map-outline'
        };

        const dataArray = activeTab === 'ORDERS' ? depot.orders 
                      : activeTab === 'PACKAGES' ? depot.packages 
                      : depot.routes;

        if (dataArray.length === 0) {
          return (
             <View style={styles.emptyContainerModern}>
                <Ionicons name={iconName[activeTab] as any} size={64} color="#CBD5E1" />
                <ThemedText style={styles.emptyTextModern}>{emptyMsg[activeTab]}</ThemedText>
              </View>
          );
        }

        return dataArray.map((item: any) => (
          <TouchableOpacity key={item.id} style={styles.listItemModern} onPress={() => Alert.alert('Detail', `Fitur dalam pengembangan.`)}>
            <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.05), marginRight: 16 }]}>
               <Ionicons name={iconName[activeTab] as any} size={20} color={primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.itemTitleModern}>
                {activeTab === 'PACKAGES' ? item.recipientName : `ID: ${item.id.substring(0,8)}...`}
              </ThemedText>
              <ThemedText style={styles.itemSubModern}>
                {activeTab === 'PACKAGES' ? `${item.weight}kg • ${item.volume}L` : `Status: ${item.status}`}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ));
    }
  };

  return (
    <ThemedView style={styles.container}>
    <Stack.Screen 
      options={{ 
        title: 'Detail Depot', 
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerRight: () => {
          if (activeTab === 'USERS' && userRole === 'OWNER') {
            return (
              <TouchableOpacity onPress={handleAddStaff} style={styles.headerIconButton}>
                <Ionicons name="person-add" size={22} color={primaryColor} />
              </TouchableOpacity>
            );
          } else if (activeTab === 'PRODUCTS' && userRole === 'OWNER') {
            return (
              <TouchableOpacity onPress={handleAddProduct} style={styles.headerIconButton}>
                <Ionicons name="add" size={26} color={primaryColor} />
              </TouchableOpacity>
            );
          } else if (activeTab === 'INFO' && userRole === 'OWNER') {
            return (
              <TouchableOpacity onPress={handleEditDepot} style={styles.headerIconButton}>
                <Ionicons name="create-outline" size={24} color={primaryColor} />
              </TouchableOpacity>
            );
          }
          return null;
        }
      }} 
    />

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Menyiapkan data depot...</ThemedText>
        </View>
      ) : depot ? (
        <View style={{ flex: 1 }}>
          
          {/* Header Info Depot */}
          <View style={styles.headerModern}>
             <View style={[styles.headerIconWrapper, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
               <Ionicons name="business" size={32} color={primaryColor} />
             </View>
             <View style={styles.headerTextWrapper}>
               <ThemedText style={styles.depotNameModern}>{depot.name}</ThemedText>
               <ThemedText style={styles.depotIdModern}>ID: {depot.id.substring(0,12)}...</ThemedText>
             </View>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabWrapperModern}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
              <TabButton title="Informasi" tabName="INFO" />
              <TabButton title={`Staf (${depot.users.length})`} tabName="USERS" />
              <TabButton title={`Produk (${depot.products.length})`} tabName="PRODUCTS" />
              <TabButton title={`Order (${depot.orders.length})`} tabName="ORDERS" />
              <TabButton title={`Paket (${depot.packages.length})`} tabName="PACKAGES" />
              <TabButton title={`Rute (${depot.routes.length})`} tabName="ROUTES" />
            </ScrollView>
          </View>

          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentScrollInner} showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#CBD5E1" />
          <ThemedText style={styles.emptyTextModern}>Data depot tidak ditemukan.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, // slate-50
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '500' },
  headerIconButton: { padding: 8, marginRight: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },

  // Header Depot
  headerModern: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 20 },
  headerIconWrapper: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerTextWrapper: { flex: 1, justifyContent: 'center' },
  depotNameModern: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginBottom: 4 },
  depotIdModern: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  // Tabs
  tabWrapperModern: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabScrollContent: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // Layout Content
  contentScroll: { flex: 1 },
  contentScrollInner: { padding: 16, paddingBottom: 40 },

  // Card Informasi Modern
  cardModern: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBoxSmall: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  labelModern: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  valueModern: { fontSize: 15, color: '#0F172A', fontWeight: '600', lineHeight: 22 },
  rowModern: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidthModern: { flex: 1 },
  dividerModern: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textAlign: 'center' },

  // List Item (Users, Orders, dll)
  listItemModern: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarText: { fontSize: 16, fontWeight: '800' },
  itemTitleModern: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  itemSubModern: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  statusChipModern: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  statusChipTextModern: { fontSize: 11, fontWeight: '700' },

  // Empty State
  emptyContainerModern: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTextModern: { marginTop: 16, fontSize: 15, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },

  // Filters
  filterContainerModern: { flexDirection: 'row', marginBottom: 16, gap: 8, paddingHorizontal: 4 },
  filterButtonModern: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, backgroundColor: '#FFFFFF' },
  filterTextModern: { fontSize: 12, fontWeight: '600' },
  
  statusFilterScrollModern: { marginBottom: 20, paddingHorizontal: 4 },
  statusFilterOptionModern: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  statusFilterTextModern: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  statusFilterTextActiveModern: { color: '#FFFFFF' },
  dotModern: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },

  // Products Grid
  productGridModern: { gap: 16 },
  productCardModern: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  productImageContainerModern: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  productImageModern: { width: '100%', height: '100%' },
  productStatusBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  productStatusText: { fontSize: 9, fontWeight: '800' },
  productInfoModern: { flex: 1, padding: 12, justifyContent: 'center' },
  productNameModern: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4, lineHeight: 20 },
  productPriceModern: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  productMetaModern: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productMetaTextModern: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  subBadgeModern: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  subBadgeTextModern: { fontSize: 10, fontWeight: '800' },
});