import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
  availableShifts?: ShiftItem[]; 
  schedules?: ScheduleItem[];   
}

const getOptimizedUrl = (url: string) => {
  if (url.includes('unsplash.com') && !url.includes('?')) {
    return `${url}?w=1080&q=80`;
  }
  return url;
};

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const { colors } = useThemeStore(); 
  const primaryColor = colors.primary || '#0F172A';

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      case 'AVAILABLE': return { bg: '#DCFCE7', text: '#166534' };
      case 'PENDING': return { bg: '#FEF9C3', text: '#9A3412' };
      case 'UNAVAILABLE': return { bg: '#F1F5F9', text: '#475569' };
      case 'REJECTED': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'DELETED': return { bg: '#1E293B', text: '#F8FAFC' };
      default: return { bg: '#F8FAFC', text: '#64748B' };
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

  const getDayName = (dayNumber: number) => {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return days[dayNumber - 1] || `Hari ke-${dayNumber}`;
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!product) return null;
  const statusStyle = getStatusStyle(product.status);

  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const otherImages = product.images?.filter(img => img.id !== mainImage?.id) || [];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Detail Produk', headerShown: true, headerShadowVisible: false, headerStyle: { backgroundColor: '#F8FAFC' } }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* --- Image Section --- */}
        {/* <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            {mainImage ? (
              <TouchableOpacity onPress={() => handleOpenImage(mainImage.url)} activeOpacity={0.9}>
                <Image source={{ uri: getOptimizedUrl(mainImage.url) }} style={styles.mainImage} resizeMode="cover" />
              </TouchableOpacity>
            ) : (
              <View style={[styles.mainImagePlaceholder, { backgroundColor: hexToRgba(primaryColor, 0.05) }]}>
                <Ionicons name="image-outline" size={64} color="#CBD5E1" />
                <ThemedText style={{ color: '#94A3B8', marginTop: 10, fontWeight: '500' }}>Belum ada foto</ThemedText>
              </View>
            )}
          </View>

          {otherImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {otherImages.map(img => (
                <TouchableOpacity key={img.id} onPress={() => handleOpenImage(img.url)} activeOpacity={0.7}>
                  <Image source={{ uri: img.url }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View> */}
        {/* --- Image Section --- */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            {mainImage ? (
              <TouchableOpacity 
                style={{ width: 280, aspectRatio: 1 }} // <--- UBAH DI SINI JADI 280
                onPress={() => handleOpenImage(mainImage.url)} 
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: getOptimizedUrl(mainImage.url) }} 
                  style={styles.mainImage} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
            ) : (
              <View style={[styles.mainImagePlaceholder, { backgroundColor: hexToRgba(primaryColor, 0.05) }]}>
                <Ionicons name="image-outline" size={64} color="#CBD5E1" />
                <ThemedText style={{ color: '#94A3B8', marginTop: 10, fontWeight: '500' }}>Belum ada foto</ThemedText>
              </View>
            )}
          </View>
          {otherImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {otherImages.map(img => (
                <TouchableOpacity key={img.id} onPress={() => handleOpenImage(img.url)} activeOpacity={0.7}>
                  <Image source={{ uri: img.url }} style={styles.thumbnailImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
            </View>

        <View style={styles.contentPadding}>
          {/* --- Header Section --- */}
          <View style={styles.cardModern}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                  {product.status}
                </ThemedText>
              </View>
              {product.isSubscription && (
                <View style={[styles.subBadge, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                  <Ionicons name="calendar" size={12} color={primaryColor} />
                  <ThemedText style={[styles.subBadgeText, { color: primaryColor }]}>Langganan {product.durationDays} Hari</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.productName}>{product.name}</ThemedText>
            <ThemedText style={[styles.productPrice, { color: primaryColor }]}>Rp {product.price.toLocaleString('id-ID')}</ThemedText>
          </View>

          {/* --- Manajemen Status --- */}
          <View style={styles.cardModern}>
            <ThemedText style={styles.sectionTitle}>Kontrol Produk</ThemedText>
            <View style={styles.statusActionContainer}>
              {role === 'OWNER' && (
                <View>
                  <ThemedText style={styles.labelModern}>Tindakan Owner</ThemedText>
                  <View style={styles.row}>
                    {product.status === 'DELETED' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: primaryColor }]} 
                        onPress={() => handleChangeStatus('UNAVAILABLE')}
                      >
                        <Ionicons name="refresh" size={20} color="#FFF" />
                        <ThemedText style={styles.buttonTextSmall}>Pulihkan</ThemedText>
                      </TouchableOpacity>
                    )}
                    {(product.status === 'PENDING' || product.status === 'REJECTED') && (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#10B981' }]} 
                          onPress={() => handleChangeStatus('UNAVAILABLE')}
                        >
                          <Ionicons name="checkmark" size={20} color="#FFF" />
                          <ThemedText style={styles.buttonTextSmall}>Setujui</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#EF4444', marginLeft: 12 }]} 
                          onPress={() => handleChangeStatus('REJECTED')}
                        >
                          <Ionicons name="close" size={20} color="#FFF" />
                          <ThemedText style={styles.buttonTextSmall}>Tolak</ThemedText>
                        </TouchableOpacity>
                      </>
                    )}
                    {product.status !== 'DELETED' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#EF4444', marginLeft: 12 }]} 
                        onPress={handleDeletePress}
                      >
                        <Ionicons name="trash" size={20} color="#FFF" />
                        <ThemedText style={styles.buttonTextSmall}>Hapus</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                  {(product.status === 'AVAILABLE' || product.status === 'UNAVAILABLE') && (
                    <View style={styles.dividerModern} />
                  )}
                </View>
              )}

              {(product.status === 'AVAILABLE' || product.status === 'UNAVAILABLE') && (
                <TouchableOpacity 
                  style={[
                    styles.statusToggle, 
                    { backgroundColor: product.status === 'AVAILABLE' ? '#F59E0B' : '#10B981' }
                  ]} 
                  onPress={() => handleChangeStatus(product.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE')}
                >
                  <Ionicons 
                    name={product.status === 'AVAILABLE' ? "eye-off" : "eye"} 
                    size={20} color="#FFF" 
                  />
                  <ThemedText style={styles.buttonTextSmall}>
                    {product.status === 'AVAILABLE' ? 'Set Non-Aktif (Kosong)' : 'Aktifkan Produk'}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {product.status === 'DELETED' && (
                <View style={[styles.infoBox, { backgroundColor: '#FEF2F2', marginTop: role === 'OWNER' ? 12 : 0 }]}>
                  <Ionicons name="trash-bin" size={20} color="#EF4444" />
                  <ThemedText style={{ color: '#EF4444', fontSize: 13, flex: 1, fontWeight: '500' }}>
                    Produk berada di tempat sampah. {role === 'OWNER' ? 'Gunakan tombol Pulihkan.' : 'Hubungi Owner.'}
                  </ThemedText>
                </View>
              )}

              {role === 'ADMIN' && (
                <>
                  {product.status === 'PENDING' && (
                    <View style={[styles.infoBox, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                      <Ionicons name="time" size={20} color={primaryColor} />
                      <ThemedText style={{ color: primaryColor, fontSize: 13, flex: 1, fontWeight: '500' }}>
                        Menunggu persetujuan Owner.
                      </ThemedText>
                    </View>
                  )}
                  {product.status === 'REJECTED' && (
                    <View style={[styles.infoBox, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <ThemedText style={{ color: '#EF4444', fontSize: 13, flex: 1, fontWeight: '500' }}>
                        Produk ditolak oleh Owner.
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* --- Specs Section --- */}
          <View style={styles.cardModern}>
            <ThemedText style={styles.sectionTitle}>Estimasi Logistik</ThemedText>
            <View style={styles.row}>
              <View style={styles.specBox}>
                <View style={[styles.iconBoxSmall, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="barbell" size={20} color="#64748B" />
                </View>
                <View>
                  <ThemedText style={styles.specLabel}>Berat</ThemedText>
                  <ThemedText style={styles.specValue}>{product.weightEst} kg</ThemedText>
                </View>
              </View>
              <View style={[styles.specBox, { marginLeft: 12 }]}>
                <View style={[styles.iconBoxSmall, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="cube" size={20} color="#64748B" />
                </View>
                <View>
                  <ThemedText style={styles.specLabel}>Volume</ThemedText>
                  <ThemedText style={styles.specValue}>{product.volumeEst} L</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* --- Shifts Section --- */}
          {product.availableShifts && product.availableShifts.length > 0 && (
            <View style={styles.cardModern}>
              <ThemedText style={styles.sectionTitle}>Jam Pengiriman (Shift)</ThemedText>
              {product.availableShifts.map((shift) => (
                <View key={shift.id} style={styles.listItemModern}>
                  <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                    <Ionicons name="time" size={20} color={primaryColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.itemTitleModern}>{shift.name}</ThemedText>
                    <ThemedText style={styles.itemSubModern}>{shift.startTime} - {shift.endTime}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* --- Schedules Section --- */}
          {product.isSubscription && product.schedules && product.schedules.length > 0 && (
            <View style={styles.cardModern}>
              <ThemedText style={styles.sectionTitle}>Jadwal Menu Harian</ThemedText>
              {product.schedules.map((schedule) => (
                <View key={schedule.id} style={styles.scheduleCard}>
                  <View style={[styles.dayBadge, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.dayBadgeText}>{getDayName(schedule.dayOfWeek)}</ThemedText>
                  </View>
                  <ThemedText style={styles.menuDetails}>{schedule.menuDetails}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* --- Depots Section --- */}
          <View style={styles.cardModern}>
            <ThemedText style={styles.sectionTitle}>Tersedia di Depot</ThemedText>
            {product.availableAt.length > 0 ? (
              product.availableAt.map((depot) => (
                <TouchableOpacity 
                  key={depot.id} 
                  style={styles.listItemModern}
                  onPress={() => router.push(`/depot/${depot.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                    <Ionicons name="business" size={20} color={primaryColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.itemTitleModern}>{depot.name}</ThemedText>
                    <ThemedText style={styles.itemSubModern} numberOfLines={1}>{depot.address}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainerModern}>
                <Ionicons name="storefront-outline" size={40} color="#CBD5E1" />
                <ThemedText style={styles.emptyTextModern}>Produk belum dihubungkan ke depot.</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* --- Action Bar --- */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: primaryColor }]} 
          onPress={() => router.push(`/product/edit/${product.id}`)}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <ThemedText style={styles.buttonText}>Edit Data Produk</ThemedText>
        </TouchableOpacity>
      </View>

      {/* --- MODAL ZOOM GAMBAR --- */}
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentPadding: { padding: 24, paddingTop: 10 },
  
  imageSection: { marginBottom: 10 },

  mainImageContainer: { alignItems: 'center', paddingHorizontal: 24, marginTop: 10 }, 
  mainImage: { width: '100%', height: '100%', borderRadius: 24 }, 
  mainImagePlaceholder: { width: 280, aspectRatio: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },

  thumbnailContainer: { marginTop: 16 },
  thumbnailImage: { width: 72, height: 72, borderRadius: 16, marginRight: 12 },

  cardModern: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  subBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  subBadgeText: { fontSize: 11, fontWeight: '800' },
  
  productName: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, lineHeight: 32 },
  productPrice: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 16, letterSpacing: -0.3 },
  row: { flexDirection: 'row' },
  
  specBox: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, alignItems: 'center' },
  iconBoxSmall: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  specLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  specValue: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  
  listItemModern: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, marginBottom: 10, alignItems: 'center' },
  itemTitleModern: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  itemSubModern: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  scheduleCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 10 },
  dayBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  dayBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  menuDetails: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },

  emptyContainerModern: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  emptyTextModern: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },

  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  editButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  
  statusActionContainer: { marginTop: 4 },
  actionButton: { flex: 1, flexDirection: 'row', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8 },
  statusToggle: { flexDirection: 'row', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8 },
  buttonTextSmall: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14 },
  labelModern: { fontSize: 13, color: '#64748B', marginBottom: 12, fontWeight: '700' },
  dividerModern: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.95)', justifyContent: 'center', alignItems: 'center' },
  modalCloseButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: '100%', height: '80%' },
});