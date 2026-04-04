import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
// Tambahkan Modal ke import react-native
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DepotItem {
  id: string;
  name: string;
  address: string;
}

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

// --- TAMBAHAN: Interface Shift dan Schedule ---
interface ShiftItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  menuDetails: string;
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
  images?: ProductImage[]; 
  availableShifts?: ShiftItem[]; // Tambahan
  schedules?: ScheduleItem[];    // Tambahan
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const { colors } = useThemeStore(); 

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- TAMBAHAN STATE MODAL ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleOpenImage = (url: string) => {
    setSelectedImageUrl(url);
    setModalVisible(true);
  };

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

  // --- TAMBAHAN: Helper untuk nama hari ---
  const getDayName = (dayNumber: number) => {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return days[dayNumber - 1] || `Hari ke-${dayNumber}`;
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

  // --- LOGIKA PEMISAHAN GAMBAR ---
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const otherImages = product.images?.filter(img => img.id !== mainImage?.id) || [];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Detail Produk', headerShown: true }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Image Section --- */}
        <View style={styles.imageSection}>
          <View style={styles.imageHeader}>
             <ThemedText style={styles.imageHeaderText}>Foto Utama</ThemedText>
          </View>
          
          {/* Container gambar utama yang posisinya di tengah dengan ukuran fix kotak */}
          <View style={styles.mainImageContainer}>
            {mainImage ? (
              <TouchableOpacity onPress={() => handleOpenImage(mainImage.url)} activeOpacity={0.9}>
                <Image source={{ uri: mainImage.url }} style={styles.mainImage} resizeMode="cover" />
              </TouchableOpacity>
            ) : (
              <View style={[styles.mainImagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="fast-food-outline" size={64} color={colors.primary} />
                <ThemedText style={{ color: colors.primary, marginTop: 10 }}>Belum ada foto</ThemedText>
              </View>
            )}
          </View>

          {/* Menampilkan thumbnail non-main jika ada */}
          {otherImages.length > 0 && (
            <View>
              <View style={[styles.imageHeader, { marginTop: 15 }]}>
                <ThemedText style={styles.imageHeaderText}>Foto Lainnya</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {otherImages.map(img => (
                  <TouchableOpacity key={img.id} onPress={() => handleOpenImage(img.url)} activeOpacity={0.7}>
                    <Image source={{ uri: img.url }} style={styles.thumbnailImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

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

        {/* --- TAMBAHAN: Shifts Section --- */}
        {product.availableShifts && product.availableShifts.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Jam Pengiriman (Shift)</ThemedText>
            {product.availableShifts.map((shift) => (
              <View key={shift.id} style={styles.shiftCard}>
                <View style={[styles.shiftIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText style={styles.shiftName}>{shift.name}</ThemedText>
                  <ThemedText style={styles.shiftTime}>{shift.startTime} - {shift.endTime}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* --- TAMBAHAN: Schedules Section (Hanya untuk Katering) --- */}
        {product.isSubscription && product.schedules && product.schedules.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Jadwal Menu Harian</ThemedText>
            {product.schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.dayBadgeText}>{getDayName(schedule.dayOfWeek)}</ThemedText>
                </View>
                <ThemedText style={styles.menuDetails}>{schedule.menuDetails}</ThemedText>
              </View>
            ))}
          </View>
        )}

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

      {/* --- TAMBAHAN: MODAL ZOOM GAMBAR --- */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="#FFF" />
          </TouchableOpacity>
          
          {selectedImageUrl && (
            <Image 
              source={{ uri: selectedImageUrl }} 
              style={styles.fullImage} 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // --- Style Image Kotak X kali X ---
  imageSection: { backgroundColor: '#FFF', paddingBottom: 20 },
  imageHeader: { paddingHorizontal: 20, paddingVertical: 10 },
  imageHeaderText: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  
  mainImageContainer: { alignItems: 'center', marginTop: 5 }, 
  mainImage: { width: 320, height: 320, borderRadius: 12, backgroundColor: '#F0F0F0' }, 
  mainImagePlaceholder: { width: 320, height: 320, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  thumbnailContainer: { marginTop: 5 },
  thumbnailImage: { width: 70, height: 70, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#EEE' },

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
  
  // --- TAMBAHAN STYLE SHIFT ---
  shiftCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  shiftIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  shiftName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  shiftTime: { fontSize: 13, color: '#666', marginTop: 4 },

  // --- TAMBAHAN STYLE SCHEDULE ---
  scheduleCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  dayBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginBottom: 10 },
  dayBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  menuDetails: { fontSize: 14, color: '#444', lineHeight: 22 },

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
  },
  // --- STYLE TAMBAHAN MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});