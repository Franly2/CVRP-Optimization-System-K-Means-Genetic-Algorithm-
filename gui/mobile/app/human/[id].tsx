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
  Text,
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

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function HumanDetailScreen() {
  const { id } = useLocalSearchParams();
  const token = useAuthStore((state) => state.token);
  const userRole = useAuthStore((state) => state.role);
  const { colors } = useThemeStore();
  const primaryColor = colors.primary || '#0F172A';

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- STATE UNTUK MODAL EDIT ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
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
    setErrors({}); 
    setIsEditModalVisible(true);
  };

  const handleUpdateStaff = async () => {
    let newErrors: Record<string, string> = {};

    if (!editForm.fullName || String(editForm.fullName).trim() === '') {
      newErrors.fullName = 'Nama Lengkap tidak boleh kosong';
    }

    if (!editForm.phoneNumber || String(editForm.phoneNumber).trim() === '') {
      newErrors.phoneNumber = 'Nomor Telepon tidak boleh kosong';
    } else {
      const phoneRegex = /^[0-9]+$/;
      const cleanPhone = String(editForm.phoneNumber).trim();
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 9) {
        newErrors.phoneNumber = 'Format nomor telepon tidak valid';
      }
    }

    if (editForm.password && String(editForm.password).trim() !== '') {
      if (String(editForm.password).trim().length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
    }

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      case 'ACCEPTED': return { bg: '#DCFCE7', text: '#166534' };
      case 'REJECTED': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'SUSPENDED': return { bg: '#F1F5F9', text: '#334155' };
      case 'PENDING': return { bg: '#FEF9C3', text: '#9A3412' };
      default: return { bg: '#F8FAFC', text: '#64748B' };
    }
  };

  useEffect(() => {
    if (id) fetchStaffDetail();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!staff) return null;
  const statusColors = getBadgeStyle(staff.status);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Detail Staf', 
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F8FAFC' },
          headerRight: () => (
            (userRole === 'OWNER' || userRole === 'ADMIN') ? (
              <TouchableOpacity onPress={openEditModal} style={styles.headerIconButton}>
                <Ionicons name="create-outline" size={24} color={primaryColor} />
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- Header Profil Modern --- */}
        <View style={styles.headerSection}>
          <View style={[styles.avatarLarge, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
            <ThemedText style={[styles.avatarText, { color: primaryColor }]}>
              {staff.fullName.substring(0, 2).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={styles.nameText}>{staff.fullName}</ThemedText>
          <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
            <ThemedText style={[styles.badgeText, { color: statusColors.text }]}>{staff.status}</ThemedText>
          </View>
        </View>

        {/* --- TOMBOL AKSI OWNER --- */}
        {userRole === 'OWNER' && (
          <View style={styles.actionSection}>
            {staff.status === 'PENDING' ? (
              <View style={styles.buttonRow}> 
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#10B981' }, isProcessing && { opacity: 0.7 }]} 
                  onPress={handleAcceptDriver} 
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  {isProcessing ? <ActivityIndicator color="#FFF" /> : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <ThemedText style={styles.actionButtonText}>Terima Staf</ThemedText>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#EF4444' }, isProcessing && { opacity: 0.7 }]} 
                  onPress={() => handleChangeStatus('REJECTED')} 
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={20} color="#FFF" />
                  <ThemedText style={styles.actionButtonText}>Tolak</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cardModern}>
                <ThemedText style={styles.panelTitle}>Kontrol Status Karyawan</ThemedText>
                <View style={styles.buttonRow}>
                  {staff.status !== 'ACCEPTED' && (
                    <TouchableOpacity 
                      style={[styles.miniButton, { backgroundColor: '#10B981' }]} 
                      onPress={() => handleChangeStatus('ACCEPTED')} 
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="play" size={18} color="#FFF" />
                      <ThemedText style={styles.miniButtonText}>Aktifkan</ThemedText>
                    </TouchableOpacity>
                  )}
                  {staff.status !== 'SUSPENDED' && staff.status !== 'REJECTED' && (
                    <TouchableOpacity 
                      style={[styles.miniButton, { backgroundColor: '#475569' }]} 
                      onPress={() => handleChangeStatus('SUSPENDED')} 
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="pause" size={18} color="#FFF" />
                      <ThemedText style={styles.miniButtonText}>Suspend</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* --- Info Kontak & Dasar --- */}
        <View style={styles.cardModern}>
          <ThemedText style={styles.sectionTitle}>Informasi Dasar</ThemedText>
          
          <View style={styles.infoRowModern}>
            <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.05) }]}>
              <Ionicons name="person" size={20} color={primaryColor} />
            </View>
            <View>
              <ThemedText style={styles.infoLabel}>Username & Role</ThemedText>
              <ThemedText style={styles.infoValue}>@{staff.username} • {staff.role}</ThemedText>
            </View>
          </View>

          <View style={styles.infoRowModern}>
            <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.05) }]}>
              <Ionicons name="call" size={20} color={primaryColor} />
            </View>
            <View>
              <ThemedText style={styles.infoLabel}>Nomor Telepon</ThemedText>
              <ThemedText style={styles.infoValue}>{staff.phoneNumber}</ThemedText>
            </View>
          </View>

          <View style={[styles.infoRowModern, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={[styles.iconBoxSmall, { backgroundColor: hexToRgba(primaryColor, 0.05) }]}>
              <Ionicons name="business" size={20} color={primaryColor} />
            </View>
            <View>
              <ThemedText style={styles.infoLabel}>Depot Penugasan</ThemedText>
              <ThemedText style={styles.infoValue}>{staff.depot?.name || 'Belum ditugaskan'}</ThemedText>
            </View>
          </View>
        </View>

        {/* --- Info Kendaraan --- */}
        {staff.role === 'DRIVER' && staff.vehicle && (
          <View style={styles.cardModern}>
            <ThemedText style={styles.sectionTitle}>Detail Kendaraan</ThemedText>
            <View style={styles.vehicleHeader}>
              <View style={[styles.iconBoxLarge, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
                <Ionicons name={staff.vehicle.type === 'MOTOR' ? 'bicycle' : 'car'} size={28} color={primaryColor} />
              </View>
              <View style={{ marginLeft: 16 }}>
                <ThemedText style={styles.plateText}>{staff.vehicle.plateNumber}</ThemedText>
                <ThemedText style={styles.modelText}>{staff.vehicle.model}</ThemedText>
              </View>
            </View>
            
            <View style={styles.dividerModern} />
            
            <View style={styles.rowSpecs}>
              <View style={styles.capItem}>
                <ThemedText style={styles.capLabel}>Beban Maks</ThemedText>
                <ThemedText style={styles.capValue}>{staff.vehicle.maxWeight} kg</ThemedText>
              </View>
              <View style={styles.capItem}>
                <ThemedText style={styles.capLabel}>Volume Maks</ThemedText>
                <ThemedText style={styles.capValue}>{staff.vehicle.maxVolume} L</ThemedText>
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
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              
              <ThemedText style={[styles.label, {marginTop: 0}]}>Nama Lengkap <Text style={styles.asterisk}>*</Text></ThemedText>
              <TextInput 
                style={[styles.input, errors.fullName && styles.inputError]} 
                value={editForm.fullName} 
                onChangeText={(txt) => handleChangeText('fullName', txt)} 
              />
              {errors.fullName && <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText>}

              <ThemedText style={styles.label}>Nomor Telepon <Text style={styles.asterisk}>*</Text></ThemedText>
              <TextInput 
                style={[styles.input, errors.phoneNumber && styles.inputError]} 
                value={editForm.phoneNumber} 
                keyboardType="phone-pad" 
                onChangeText={(txt) => handleChangeText('phoneNumber', txt)} 
              />
              {errors.phoneNumber && <ThemedText style={styles.errorText}>{errors.phoneNumber}</ThemedText>}

              <ThemedText style={styles.label}>Password Baru (Opsional)</ThemedText>
              <TextInput 
                style={[styles.input, errors.password && styles.inputError]} 
                value={editForm.password} 
                secureTextEntry 
                placeholder="Kosongkan jika tidak diganti" 
                placeholderTextColor="#94A3B8"
                onChangeText={(txt) => handleChangeText('password', txt)} 
              />
              {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}

              {/* === FORM KHUSUS DRIVER === */}
              {staff.role === 'DRIVER' && (
                <>
                  <View style={styles.dividerModern} />
                  <ThemedText style={[styles.sectionTitle, { fontSize: 16 }]}>Spesifikasi Kendaraan</ThemedText>

                  <ThemedText style={styles.label}>Tipe Kendaraan <Text style={styles.asterisk}>*</Text></ThemedText>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity 
                      style={[styles.radioButton, editForm.vehicleType === 'MOTOR' && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                      onPress={() => handleChangeText('vehicleType', 'MOTOR')}
                      activeOpacity={0.8}
                    >
                      <ThemedText style={[styles.radioText, editForm.vehicleType === 'MOTOR' && { color: '#FFF' }]}>Motor</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.radioButton, editForm.vehicleType === 'MOBIL' && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                      onPress={() => handleChangeText('vehicleType', 'MOBIL')}
                      activeOpacity={0.8}
                    >
                      <ThemedText style={[styles.radioText, editForm.vehicleType === 'MOBIL' && { color: '#FFF' }]}>Mobil</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <ThemedText style={styles.label}>Plat Nomor <Text style={styles.asterisk}>*</Text></ThemedText>
                  <TextInput 
                    style={[styles.input, errors.plateNumber && styles.inputError]} 
                    value={editForm.plateNumber} 
                    autoCapitalize="characters" 
                    onChangeText={(txt) => handleChangeText('plateNumber', txt)} 
                  />
                  {errors.plateNumber && <ThemedText style={styles.errorText}>{errors.plateNumber}</ThemedText>}

                  <ThemedText style={styles.label}>Model Kendaraan <Text style={styles.asterisk}>*</Text></ThemedText>
                  <TextInput 
                    style={[styles.input, errors.vehicleModel && styles.inputError]} 
                    value={editForm.vehicleModel} 
                    onChangeText={(txt) => handleChangeText('vehicleModel', txt)} 
                  />
                  {errors.vehicleModel && <ThemedText style={styles.errorText}>{errors.vehicleModel}</ThemedText>}

                  <View style={styles.rowSpecs}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <ThemedText style={styles.label}>Maks Beban (kg) <Text style={styles.asterisk}>*</Text></ThemedText>
                      <TextInput 
                        style={[styles.input, errors.maxWeight && styles.inputError]} 
                        value={editForm.maxWeight.toString()} 
                        keyboardType="numeric" 
                        onChangeText={(txt) => handleChangeText('maxWeight', txt)} 
                      />
                      {errors.maxWeight && <ThemedText style={styles.errorText}>{errors.maxWeight}</ThemedText>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.label}>Maks Volume (L) <Text style={styles.asterisk}>*</Text></ThemedText>
                      <TextInput 
                        style={[styles.input, errors.maxVolume && styles.inputError]} 
                        value={editForm.maxVolume.toString()} 
                        keyboardType="numeric" 
                        onChangeText={(txt) => handleChangeText('maxVolume', txt)} 
                      />
                      {errors.maxVolume && <ThemedText style={styles.errorText}>{errors.maxVolume}</ThemedText>}
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: primaryColor }]} 
                onPress={handleUpdateStaff} 
                disabled={isUpdating}
                activeOpacity={0.8}
              >
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerIconButton: { marginRight: 15, padding: 4 },
  
  headerSection: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '800' },
  nameText: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  
  actionSection: { marginBottom: 24 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  actionButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  
  panelTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 16, textAlign: 'center' },
  miniButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  miniButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  cardModern: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20, letterSpacing: -0.3 },
  
  infoRowModern: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBoxSmall: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#0F172A', fontWeight: '700' },
  
  vehicleHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBoxLarge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  plateText: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  modelText: { fontSize: 14, color: '#64748B', fontWeight: '500', marginTop: 2 },
  dividerModern: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  rowSpecs: { flexDirection: 'row', justifyContent: 'space-between' },
  capItem: { flex: 1, alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginHorizontal: 6 },
  capLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 6 },
  capValue: { fontSize: 16, fontWeight: '800', color: '#0F172A' },

  // --- STYLE UNTUK MODAL EDIT ---
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingTop: 32, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  closeButton: { backgroundColor: '#F1F5F9', padding: 6, borderRadius: 20 },
  
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
  asterisk: { color: '#EF4444' },
  input: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, paddingHorizontal: 16, color: '#0F172A', fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }, 
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '500' }, 
  
  saveButton: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  saveButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  radioText: { color: '#64748B', fontWeight: '700', fontSize: 14 }
});