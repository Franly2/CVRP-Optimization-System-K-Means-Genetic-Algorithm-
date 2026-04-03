import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
  const { colors } = useThemeStore();

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- STATE UNTUK MODAL EDIT ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State form isian
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    password: '', 
    vehicleType: 'MOTOR',
    plateNumber: '',
    vehicleModel: '',
    maxWeight: '',
    maxVolume: ''
  });

  // State khusus untuk menampung pesan error per field
  const [errors, setErrors] = useState<Record<string, string>>({});

  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

  const fetchStaffDetail = async () => {
    setIsLoading(true);
    try {
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

  // --- FUNGSI BUKA MODAL ---
  const openEditModal = () => {
    if (!staff) return;
    setEditForm({
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      password: '', 
      vehicleType: staff.vehicle?.type || 'MOTOR',
      plateNumber: staff.vehicle?.plateNumber || '',
      vehicleModel: staff.vehicle?.model || '',
      maxWeight: staff.vehicle?.maxWeight?.toString() || '',
      maxVolume: staff.vehicle?.maxVolume?.toString() || ''
    });
    setErrors({}); // Bersihkan error lama saat modal baru dibuka
    setIsEditModalVisible(true);
  };

  // --- FUNGSI UPDATE DATA API DENGAN INLINE VALIDATION ---
  const handleUpdateStaff = async () => {
    let newErrors: Record<string, string> = {};

    // 1. Validasi Nama Lengkap
    if (!editForm.fullName || String(editForm.fullName).trim() === '') {
      newErrors.fullName = 'Nama Lengkap tidak boleh kosong';
    }

    // 2. Validasi Nomor Telepon
    if (!editForm.phoneNumber || String(editForm.phoneNumber).trim() === '') {
      newErrors.phoneNumber = 'Nomor Telepon tidak boleh kosong';
    } else {
      const phoneRegex = /^[0-9]+$/;
      const cleanPhone = String(editForm.phoneNumber).trim();
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 9) {
        newErrors.phoneNumber = 'Format nomor telepon tidak valid';
      }
    }

    // 3. Validasi Password
    if (editForm.password && String(editForm.password).trim() !== '') {
      if (String(editForm.password).trim().length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
    }

    // 4. Validasi Khusus Kurir/Driver
    if (staff?.role === 'DRIVER') {
      if (!editForm.plateNumber || String(editForm.plateNumber).trim() === '') {
        newErrors.plateNumber = 'Plat Nomor tidak boleh kosong';
      }
      if (!editForm.vehicleModel || String(editForm.vehicleModel).trim() === '') {
        newErrors.vehicleModel = 'Model Kendaraan tidak boleh kosong';
      }

      const safeWeightStr = editForm.maxWeight ? String(editForm.maxWeight) : '0';
      const safeVolumeStr = editForm.maxVolume ? String(editForm.maxVolume) : '0';

      const weight = parseFloat(safeWeightStr.replace(',', '.'));
      const volume = parseFloat(safeVolumeStr.replace(',', '.'));

      if (!editForm.maxWeight || isNaN(weight) || weight <= 0) {
        newErrors.maxWeight = 'Harus berupa angka > 0';
      }
      if (!editForm.maxVolume || isNaN(volume) || volume <= 0) {
        newErrors.maxVolume = 'Harus berupa angka > 0';
      }
    }

    // JIKA ADA ERROR, SET STATE DAN HENTIKAN FUNGSI
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Jika lolos semua pengecekan, bersihkan error dan kirim API
    setErrors({});
    setIsUpdating(true);
    try {
      const payload: any = {
        fullName: String(editForm.fullName).trim(),
        phoneNumber: String(editForm.phoneNumber).trim(),
      };

      if (editForm.password && String(editForm.password).trim() !== '') {
        payload.password = String(editForm.password).trim();
      }

      if (staff?.role === 'DRIVER') {
        payload.vehicleType = editForm.vehicleType;
        payload.plateNumber = String(editForm.plateNumber).trim();
        payload.vehicleModel = String(editForm.vehicleModel).trim();
        payload.maxWeight = parseFloat(String(editForm.maxWeight).replace(',', '.'));
        payload.maxVolume = parseFloat(String(editForm.maxVolume).replace(',', '.'));
      }

      const response = await fetch(`http://${api_address}:3000/human/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Berhasil', result.message || 'Data staf berhasil diperbarui');
        setIsEditModalVisible(false);
        fetchStaffDetail();
      } else {
        // Tampilkan error dari backend (NestJS)
        let backendErr = 'Gagal memperbarui staf';
        if (result.message) {
          backendErr = Array.isArray(result.message) ? result.message.join('\n') : result.message;
        }
        Alert.alert('Validasi Server Gagal', backendErr);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menghubungi server');
    } finally {
      setIsUpdating(false);
    }
  };

  // Fungsi utilitas untuk update text dan otomatis hapus pesan error di kolom tersebut
  const handleChangeText = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleChangeStatus = async (newStatus: 'ACCEPTED' | 'REJECTED' | 'SUSPENDED') => {
    setIsProcessing(true);
    try {
      const response = await fetch(`http://${api_address}:3000/human/status-employee`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id, status: newStatus }),
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Berhasil', `Status staf diubah menjadi ${newStatus}`);
        fetchStaffDetail();
      } else {
        Alert.alert('Gagal', result.message || 'Gagal mengubah status');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menghubungi server');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptDriver = async () => {
    setIsProcessing(true);
    try {
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!staff) return null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Detail Staf', 
          headerShown: true,
          headerRight: () => (
            (userRole === 'OWNER' || userRole === 'ADMIN') ? (
              <TouchableOpacity onPress={openEditModal}>
                <Ionicons name="pencil" size={24} color={colors.primary} style={{ marginRight: 15 }} />
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Profil */}
        <View style={styles.headerSection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
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
                <TouchableOpacity style={[styles.acceptButton, isProcessing && { opacity: 0.7 }]} onPress={handleAcceptDriver} disabled={isProcessing}>
                  {isProcessing ? <ActivityIndicator color="#FFF" /> : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <ThemedText style={styles.acceptButtonText}>Terima</ThemedText>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.rejectButton, isProcessing && { opacity: 0.7 }]} onPress={() => handleChangeStatus('REJECTED')} disabled={isProcessing}>
                  <Ionicons name="close-circle" size={20} color="#FFF" />
                  <ThemedText style={styles.acceptButtonText}>Tolak</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusPanel}>
                <ThemedText style={styles.panelTitle}>Kontrol Status Karyawan</ThemedText>
                <View style={styles.buttonRow}>
                  {staff.status !== 'ACCEPTED' && (
                    <TouchableOpacity style={[styles.miniButton, styles.bgSuccess]} onPress={() => handleChangeStatus('ACCEPTED')} disabled={isProcessing}>
                      <Ionicons name="play" size={16} color="#FFF" />
                      <ThemedText style={styles.miniButtonText}>Aktifkan</ThemedText>
                    </TouchableOpacity>
                  )}
                  {staff.status !== 'SUSPENDED' && staff.status !== 'REJECTED' && (
                    <TouchableOpacity style={[styles.miniButton, styles.bgDark]} onPress={() => handleChangeStatus('SUSPENDED')} disabled={isProcessing}>
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
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Informasi Dasar</ThemedText>
            {/* {(userRole === 'OWNER' || userRole === 'ADMIN') && (
               <TouchableOpacity onPress={openEditModal}>
                 <ThemedText style={[styles.editLink, { color: colors.primary }]}>Edit</ThemedText>
               </TouchableOpacity>
            )} */}
          </View>
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
                <Ionicons name={staff.vehicle.type === 'MOTOR' ? 'bicycle-outline' : 'car-outline'} size={32} color={colors.primary} />
                <View style={{marginLeft: 12}}>
                  <ThemedText style={styles.plateText}>{staff.vehicle.plateNumber}</ThemedText>
                  <ThemedText style={styles.modelText}>{staff.vehicle.model}</ThemedText>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.capItem}>
                  <ThemedText style={styles.capLabel}>Beban Maks</ThemedText>
                  <ThemedText style={[styles.capValue, { color: colors.primary }]}>{staff.vehicle.maxWeight} kg</ThemedText>
                </View>
                <View style={styles.capItem}>
                  <ThemedText style={styles.capLabel}>Volume Maks</ThemedText>
                  <ThemedText style={[styles.capValue, { color: colors.primary }]}>{staff.vehicle.maxVolume} L</ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL EDIT STAF ================= */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Data Staf</ThemedText>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {/* === NAMA LENGKAP === */}
              <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
              <TextInput 
                style={[styles.input, errors.fullName && styles.inputError]} 
                value={editForm.fullName} 
                onChangeText={(txt) => handleChangeText('fullName', txt)} 
              />
              {errors.fullName ? <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText> : null}

              {/* === NOMOR TELEPON === */}
              <ThemedText style={styles.label}>Nomor Telepon</ThemedText>
              <TextInput 
                style={[styles.input, errors.phoneNumber && styles.inputError]} 
                value={editForm.phoneNumber} 
                keyboardType="phone-pad" 
                onChangeText={(txt) => handleChangeText('phoneNumber', txt)} 
              />
              {errors.phoneNumber ? <ThemedText style={styles.errorText}>{errors.phoneNumber}</ThemedText> : null}

              {/* === PASSWORD === */}
              <ThemedText style={styles.label}>Password Baru (Opsional)</ThemedText>
              <TextInput 
                style={[styles.input, errors.password && styles.inputError]} 
                value={editForm.password} 
                secureTextEntry 
                placeholder="Kosongkan jika tidak diganti" 
                onChangeText={(txt) => handleChangeText('password', txt)} 
              />
              {errors.password ? <ThemedText style={styles.errorText}>{errors.password}</ThemedText> : null}

              {/* === FORM KHUSUS DRIVER === */}
              {staff.role === 'DRIVER' && (
                <>
                  <View style={styles.divider} />
                  <ThemedText style={[styles.sectionTitle, { fontSize: 14 }]}>Spesifikasi Kendaraan</ThemedText>

                  <ThemedText style={styles.label}>Tipe Kendaraan</ThemedText>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity 
                      style={[styles.radioButton, editForm.vehicleType === 'MOTOR' && { backgroundColor: colors.primary }]}
                      onPress={() => handleChangeText('vehicleType', 'MOTOR')}
                    >
                      <ThemedText style={[styles.radioText, editForm.vehicleType === 'MOTOR' && { color: '#FFF' }]}>Motor</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.radioButton, editForm.vehicleType === 'MOBIL' && { backgroundColor: colors.primary }]}
                      onPress={() => handleChangeText('vehicleType', 'MOBIL')}
                    >
                      <ThemedText style={[styles.radioText, editForm.vehicleType === 'MOBIL' && { color: '#FFF' }]}>Mobil</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <ThemedText style={styles.label}>Plat Nomor</ThemedText>
                  <TextInput 
                    style={[styles.input, errors.plateNumber && styles.inputError]} 
                    value={editForm.plateNumber} 
                    autoCapitalize="characters" 
                    onChangeText={(txt) => handleChangeText('plateNumber', txt)} 
                  />
                  {errors.plateNumber ? <ThemedText style={styles.errorText}>{errors.plateNumber}</ThemedText> : null}

                  <ThemedText style={styles.label}>Model Kendaraan</ThemedText>
                  <TextInput 
                    style={[styles.input, errors.vehicleModel && styles.inputError]} 
                    value={editForm.vehicleModel} 
                    onChangeText={(txt) => handleChangeText('vehicleModel', txt)} 
                  />
                  {errors.vehicleModel ? <ThemedText style={styles.errorText}>{errors.vehicleModel}</ThemedText> : null}

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <ThemedText style={styles.label}>Maks Beban (kg)</ThemedText>
                      <TextInput 
                        style={[styles.input, errors.maxWeight && styles.inputError]} 
                        value={editForm.maxWeight.toString()} 
                        keyboardType="numeric" 
                        onChangeText={(txt) => handleChangeText('maxWeight', txt)} 
                      />
                      {errors.maxWeight ? <ThemedText style={styles.errorText}>{errors.maxWeight}</ThemedText> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.label}>Maks Volume (L)</ThemedText>
                      <TextInput 
                        style={[styles.input, errors.maxVolume && styles.inputError]} 
                        value={editForm.maxVolume.toString()} 
                        keyboardType="numeric" 
                        onChangeText={(txt) => handleChangeText('maxVolume', txt)} 
                      />
                      {errors.maxVolume ? <ThemedText style={styles.errorText}>{errors.maxVolume}</ThemedText> : null}
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleUpdateStaff} disabled={isUpdating}>
                {isUpdating ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveButtonText}>Simpan Perubahan</ThemedText>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 25 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4 },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  actionSection: { marginBottom: 25 },
  acceptButton: { flexDirection: 'row', backgroundColor: '#28A745', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', gap: 8, elevation: 3 },
  acceptButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  statusPanel: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, alignItems: 'center', elevation: 2 },
  panelTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10 },
  rejectButton: { flexDirection: 'row', backgroundColor: '#DC3545', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', gap: 8, elevation: 3 },
  miniButton: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', gap: 5 },
  miniButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  bgSuccess: { backgroundColor: '#28A745' },
  bgDanger: { backgroundColor: '#DC3545' },
  bgDark: { backgroundColor: '#343A40' },

  section: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  editLink: { fontSize: 14, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  infoValue: { fontSize: 15, color: '#555' },
  
  vehicleCard: { backgroundColor: '#F8FBFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#D1E3F3' },
  vehicleHeader: { flexDirection: 'row', alignItems: 'center' },
  plateText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modelText: { fontSize: 14, color: '#666' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  capItem: { flex: 1, alignItems: 'center' },
  capLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  capValue: { fontSize: 16, fontWeight: 'bold' },
  
  badgeSuccess: { backgroundColor: '#28A745' }, 
  badgeDanger: { backgroundColor: '#DC3545' },  
  badgeWarning: { backgroundColor: '#FFC107' }, 
  badgeDark: { backgroundColor: '#343A40' },    
  badgeDefault: { backgroundColor: '#6C757D' }, 

  // --- STYLE UNTUK MODAL EDIT ---
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6, marginTop: 12 },
  
  // Style Baru untuk Error
  input: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 12, color: '#333', borderWidth: 1, borderColor: '#EEE' },
  inputError: { borderColor: '#DC3545', backgroundColor: '#FFF8F8' }, // Kotak jadi kemerahan
  errorText: { color: '#DC3545', fontSize: 11, marginTop: 4, marginLeft: 2 }, // Teks error di bawah form
  
  saveButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 25 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  radioGroup: { flexDirection: 'row', gap: 10 },
  radioButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#F0F0F0', alignItems: 'center' },
  radioText: { color: '#666', fontWeight: 'bold' }
});