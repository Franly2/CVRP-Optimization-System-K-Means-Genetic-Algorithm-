import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore'; // 1. Import Theme Store
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DepotItem {
  id: string;
  name: string;
  address: string;
}

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  weightEst: number;
  volumeEst: number;
  status: string;
  isSubscription: boolean;
  durationDays: number | null;
  availableAt: DepotItem[];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Ambil data dari Store
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const { colors } = useThemeStore(); // 2. Gunakan colors dari ThemeStore

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = React.useRef(false);

  const loadData = useCallback(async (showLoadingSpinner: boolean) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      const response = await fetch(`http://${api_address}:3000/catalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setProduct(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      if (id && token && isMounted) {
        loadData(false); 
      }
      return () => {
        isMounted = false;
      };
    }, [id, token, loadData])
  );

  const handleChangeStatus = async (newStatus: string) => {
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      const response = await fetch(`http://${api_address}:3000/catalog/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        Alert.alert('Berhasil', `Status diubah ke ${newStatus}`);
        loadData(false);
      } else {
        const result = await response.json();
        Alert.alert('Gagal', result.message || 'Gagal update');
      }
    } catch (error) {
      Alert.alert('Error', 'Koneksi bermasalah');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'PENDING': return { bg: '#FFF3E0', text: '#EF6C00' };
      case 'UNAVAILABLE': return { bg: '#F5F5F5', text: '#616161' };
      case 'REJECTED': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#ECEFF1', text: '#455A64' };
    }
  };

  const handleDeletePress = () => {
    const message = "Apakah Anda yakin ingin menghapus produk ini dari katalog?";
    if (Platform.OS === 'web') {
        const confirmDelete = window.confirm(message);
        if (confirmDelete) handleChangeStatus('DELETED');
    } else {
        Alert.alert("Konfirmasi Hapus", message, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => handleChangeStatus('DELETED') }
        ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) return null;
  const statusStyle = getStatusStyle(product.status);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Detail Produk', headerShown: true }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- Header Section --- */}
        <View style={styles.headerCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                {product.status}
              </ThemedText>
            </View>
            {product.isSubscription && (
              <View style={[styles.subBadge, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="calendar" size={12} color={colors.primary} />
                <ThemedText style={[styles.subBadgeText, { color: colors.primary }]}>Langganan {product.durationDays} Hari</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.productPrice}>Rp {product.price.toLocaleString('id-ID')}</ThemedText>
        </View>

        {/* --- Manajemen Status --- */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Kontrol Produk</ThemedText>
          <View style={styles.statusActionContainer}>
            {role === 'OWNER' && (
              <View>
                <ThemedText style={[styles.label, { marginBottom: 10 }]}>Tindakan Owner:</ThemedText>
                <View style={styles.row}>
                  {product.status === 'DELETED' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: colors.primary }]} 
                      onPress={() => handleChangeStatus('UNAVAILABLE')}
                    >
                      <Ionicons name="refresh-circle-outline" size={20} color="#FFF" />
                      <ThemedText style={styles.buttonTextSmall}>Pulihkan Produk</ThemedText>
                    </TouchableOpacity>
                  )}
                  {(product.status === 'PENDING' || product.status === 'REJECTED') && (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#2E7D32' }]} 
                        onPress={() => handleChangeStatus('UNAVAILABLE')}
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                        <ThemedText style={styles.buttonTextSmall}>Setujui</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#E64A19', marginLeft: 10 }]} 
                        onPress={() => handleChangeStatus('REJECTED')}
                      >
                        <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                        <ThemedText style={styles.buttonTextSmall}>Tolak</ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                  {product.status !== 'DELETED' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#B71C1C', marginLeft: 10 }]} 
                      onPress={handleDeletePress}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FFF" />
                      <ThemedText style={styles.buttonTextSmall}>Hapus</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
                {(product.status === 'AVAILABLE' || product.status === 'UNAVAILABLE') && (
                  <View style={{ height: 1, backgroundColor: '#EEE', marginVertical: 15 }} />
                )}
              </View>
            )}

            {(product.status === 'AVAILABLE' || product.status === 'UNAVAILABLE') && (
              <TouchableOpacity 
                style={[
                  styles.statusToggle, 
                  { backgroundColor: product.status === 'AVAILABLE' ? '#FFA000' : '#2E7D32' }
                ]} 
                onPress={() => handleChangeStatus(product.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE')}
              >
                <Ionicons 
                  name={product.status === 'AVAILABLE' ? "eye-off-outline" : "eye-outline"} 
                  size={20} color="#FFF" 
                />
                <ThemedText style={styles.buttonTextSmall}>
                  {product.status === 'AVAILABLE' ? 'Set ke Non-Aktif (Kosong)' : 'Aktifkan Kembali'}
                </ThemedText>
              </TouchableOpacity>
            )}

            {product.status === 'DELETED' && (
              <View style={[styles.infoBox, { backgroundColor: '#FFEBEE', marginTop: role === 'OWNER' ? 10 : 0 }]}>
                <Ionicons name="trash-bin-outline" size={20} color="#B71C1C" />
                <ThemedText style={{ color: '#B71C1C', fontSize: 13, flex: 1 }}>
                  Produk ini berada di tempat sampah. {role === 'OWNER' ? 'Gunakan tombol Pulihkan.' : 'Hubungi Owner.'}
                </ThemedText>
              </View>
            )}

            {role === 'ADMIN' && (
              <>
                {product.status === 'PENDING' && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                    <ThemedText style={{ color: colors.primary, fontSize: 13, flex: 1 }}>
                      Menunggu Owner menyetujui produk ini.
                    </ThemedText>
                  </View>
                )}
                {product.status === 'REJECTED' && (
                  <View style={styles.infoBox}>
                    <Ionicons name="alert-circle-outline" size={20} color="#C62828" />
                    <ThemedText style={{ color: '#C62828', fontSize: 13, flex: 1 }}>
                      Produk ditolak oleh Owner.
                    </ThemedText>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* --- Specs Section --- */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estimasi Logistik</ThemedText>
          <View style={styles.row}>
            <View style={styles.specBox}>
              <Ionicons name="barbell-outline" size={20} color="#666" />
              <ThemedText style={styles.specLabel}>Berat</ThemedText>
              <ThemedText style={styles.specValue}>{product.weightEst} kg</ThemedText>
            </View>
            <View style={[styles.specBox, { marginLeft: 15 }]}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <ThemedText style={styles.specLabel}>Volume</ThemedText>
              <ThemedText style={styles.specValue}>{product.volumeEst} L</ThemedText>
            </View>
          </View>
        </View>

        {/* --- Depots Section --- */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tersedia di Depot</ThemedText>
          {product.availableAt.length > 0 ? (
            product.availableAt.map((depot) => (
              <TouchableOpacity 
                key={depot.id} 
                style={styles.depotCard}
                onPress={() => router.push(`/depot/${depot.id}`)}
              >
                <View style={[styles.depotIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.depotName}>{depot.name}</ThemedText>
                  <ThemedText style={styles.depotAddress} numberOfLines={1}>{depot.address}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CCC" />
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>Produk ini belum dihubungkan ke depot manapun.</ThemedText>
          )}
        </View>
      </ScrollView>

      {/* --- Action Bar --- */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: colors.primary }]} 
          onPress={() => router.push(`/product/edit/${product.id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <ThemedText style={styles.buttonText}>Edit Produk</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#FFF', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  subBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  subBadgeText: { fontSize: 11, fontWeight: 'bold' },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  productPrice: { fontSize: 20, color: '#2E7D32', fontWeight: 'bold', marginTop: 5 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 15 },
  row: { flexDirection: 'row' },
  specBox: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  specLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  specValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  depotCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  depotIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  depotName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  depotAddress: { fontSize: 12, color: '#888', marginTop: 2 },
  emptyText: { color: '#999', fontStyle: 'italic' },
  actionBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  editButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12, gap: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  statusActionContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  statusToggle: {
    flexDirection: 'row',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonTextSmall: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
  },
  label : { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 8, 
    fontWeight: '600'
  }
});