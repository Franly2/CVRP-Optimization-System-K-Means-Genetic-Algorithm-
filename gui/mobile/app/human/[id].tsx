import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface StaffDetail {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  depot?: {
    name: string;
    address: string;
  };
  vehicle?: {
    type: string;
    plateNumber: string;
    model: string;
    maxWeight: number;
    maxVolume: number;
  };
}

export default function HumanDetailScreen() {
  const { id } = useLocalSearchParams();
  const token = useAuthStore((state) => state.token);
  const userRole = useAuthStore((state) => state.role);
  
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStaffDetail = async () => {
    setIsLoading(true);
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      const response = await fetch(`http://${api_address}:3000/human/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok) {
        setStaff(result.data);
      } else {
        Alert.alert('Error', result.message || 'Gagal mengambil data');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Masalah koneksi ke server');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fungsi Umum untuk Mengubah Status (Endpoint Baru) ---
  const handleChangeStatus = async (newStatus: 'ACCEPTED' | 'REJECTED' | 'SUSPENDED') => {
    setIsProcessing(true);
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      const response = await fetch(`http://${api_address}:3000/human/status-employee`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: id, 
          status: newStatus 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Berhasil', `Status staf diubah menjadi ${newStatus}`);
        fetchStaffDetail();
      } else {
        Alert.alert('Gagal', result.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menghubungi server');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptDriver = async () => {
    setIsProcessing(true);
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      const response = await fetch(`http://${api_address}:3000/human/accept-driver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Berhasil', 'Driver telah diterima.');
        fetchStaffDetail();
      } else {
        Alert.alert('Gagal', result.message || 'Gagal menerima driver');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menghubungi server');
    } finally {
      setIsProcessing(false);
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return styles.badgeSuccess; 
      case 'REJECTED': return styles.badgeDanger; 
      case 'SUSPENDED': return styles.badgeDark;   
      case 'PENDING': return styles.badgeWarning;   
      default: return styles.badgeDefault;
    }
  };

  useEffect(() => {
    if (id) fetchStaffDetail();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4991CC" />
      </View>
    );
  }

  if (!staff) return null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Detail Staf', headerShown: true }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Profil */}
        <View style={styles.headerSection}>
          <View style={styles.avatarLarge}>
            <ThemedText style={styles.avatarText}>
              {staff.fullName.substring(0, 2).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={styles.nameText}>{staff.fullName}</ThemedText>
          <View style={[styles.badge, getBadgeStyle(staff.status)]}>
            <ThemedText style={styles.badgeText}>{staff.status}</ThemedText>
          </View>
        </View>

        {/* --- TOMBOL AKSI OWNER --- */}
        {userRole === 'OWNER' && (
          <View style={styles.actionSection}>
            {staff.status === 'PENDING' ? (
        <View style={styles.buttonRow}> 
            <TouchableOpacity 
            style={[styles.acceptButton, isProcessing && { opacity: 0.7 }]} 
            onPress={handleAcceptDriver}
            disabled={isProcessing}
            >
            {isProcessing ? <ActivityIndicator color="#FFF" /> : (
                <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <ThemedText style={styles.acceptButtonText}>Terima</ThemedText>
                </>
            )}
            </TouchableOpacity>

            <TouchableOpacity 
            style={[styles.rejectButton, isProcessing && { opacity: 0.7 }]} 
            onPress={() => handleChangeStatus('REJECTED')}
            disabled={isProcessing}
            >
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <ThemedText style={styles.acceptButtonText}>Tolak</ThemedText>
            </TouchableOpacity>
        </View>
        ) : (
        <View style={styles.statusPanel}>
            <ThemedText style={styles.panelTitle}>Kontrol Status Karyawan</ThemedText>
            <View style={styles.buttonRow}>
            {staff.status !== 'ACCEPTED' && (
                <TouchableOpacity 
                style={[styles.miniButton, styles.bgSuccess]} 
                onPress={() => handleChangeStatus('ACCEPTED')}
                disabled={isProcessing}
                >
                <Ionicons name="play" size={16} color="#FFF" />
                <ThemedText style={styles.miniButtonText}>Aktifkan</ThemedText>
                </TouchableOpacity>
            )}

            {staff.status !== 'SUSPENDED' && staff.status !== 'REJECTED' && (
                <TouchableOpacity 
                style={[styles.miniButton, styles.bgDark]} 
                onPress={() => handleChangeStatus('SUSPENDED')}
                disabled={isProcessing}
                >
                <Ionicons name="pause" size={16} color="#FFF" />
                <ThemedText style={styles.miniButtonText}>Suspend</ThemedText>
                </TouchableOpacity>
            )}
            </View>
        </View>
        )}
          </View>
        )}

        {/* Info Kontak & Dasar */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informasi Dasar</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <ThemedText style={styles.infoValue}>@{staff.username} ({staff.role})</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <ThemedText style={styles.infoValue}>{staff.phoneNumber}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <ThemedText style={styles.infoValue}>{staff.depot?.name || 'Tidak ada depot'}</ThemedText>
          </View>
        </View>

        {/* Info Kendaraan */}
        {staff.role === 'DRIVER' && staff.vehicle && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Detail Kendaraan</ThemedText>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <Ionicons name={staff.vehicle.type === 'MOTOR' ? 'bicycle-outline' : 'car-outline'} size={32} color="#4991CC" />
                <View style={{marginLeft: 12}}>
                  <ThemedText style={styles.plateText}>{staff.vehicle.plateNumber}</ThemedText>
                  <ThemedText style={styles.modelText}>{staff.vehicle.model}</ThemedText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.capItem}><ThemedText style={styles.capLabel}>Beban Maks</ThemedText><ThemedText style={styles.capValue}>{staff.vehicle.maxWeight} kg</ThemedText></View>
                <View style={styles.capItem}><ThemedText style={styles.capLabel}>Volume Maks</ThemedText><ThemedText style={styles.capValue}>{staff.vehicle.maxVolume} L</ThemedText></View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 25 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4991CC', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4 },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  actionSection: { marginBottom: 25 },
  acceptButton: { 
    flexDirection: 'row', 
    backgroundColor: '#28A745', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    gap: 8, 
    elevation: 3 
  },
  acceptButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // --- Style Panel Kontrol Baru ---
  statusPanel: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, alignItems: 'center', elevation: 2 },
  panelTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12, textAlign: 'center' },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 12, 
    marginTop: 10 
  },

  rejectButton: { 
    flexDirection: 'row', 
    backgroundColor: '#DC3545', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    gap: 8, 
    elevation: 3 
  },
  miniButton: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', gap: 5 },
  miniButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  bgSuccess: { backgroundColor: '#28A745' },
  bgDanger: { backgroundColor: '#DC3545' },
  bgDark: { backgroundColor: '#343A40' },

  section: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  infoValue: { fontSize: 15, color: '#555' },
  
  vehicleCard: { backgroundColor: '#F8FBFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#D1E3F3' },
  vehicleHeader: { flexDirection: 'row', alignItems: 'center' },
  plateText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modelText: { fontSize: 14, color: '#666' },
  divider: { height: 1, backgroundColor: '#D1E3F3', marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  capItem: { flex: 1, alignItems: 'center' },
  capLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  capValue: { fontSize: 16, fontWeight: 'bold', color: '#4991CC' },
  
  badgeSuccess: { backgroundColor: '#28A745' }, 
  badgeDanger: { backgroundColor: '#DC3545' },  
  badgeWarning: { backgroundColor: '#FFC107' }, 
  badgeDark: { backgroundColor: '#343A40' },    
  badgeDefault: { backgroundColor: '#6C757D' }, 
});