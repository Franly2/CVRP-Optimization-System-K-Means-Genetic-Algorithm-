import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AddStaffScreen() {
  const router = useRouter();
  const { depotId } = useLocalSearchParams(); 

  const { colors } = useThemeStore();
  const primaryColor = colors.primary || '#0F172A';

  const [role, setRole] = useState<'ADMIN' | 'DRIVER'>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState(''); 

  const [vehicleType, setVehicleType] = useState<'MOTOR' | 'MOBIL'>('MOTOR');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [maxVolume, setMaxVolume] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const token = useAuthStore((state) => state.token);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!username.trim()) newErrors.username = 'Username wajib diisi';
    if (!password.trim() || password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'No. Telepon wajib diisi';
    if (!birthDate.trim()) newErrors.birthDate = 'Tanggal lahir wajib diisi (YYYY-MM-DD)';

    if (role === 'DRIVER') {
      if (!plateNumber.trim()) newErrors.plateNumber = 'Plat nomor wajib diisi';
      if (!vehicleModel.trim()) newErrors.vehicleModel = 'Model kendaraan wajib diisi';

      const weightNum = parseFloat(maxWeight.replace(',', '.'));
      if (!maxWeight.trim() || isNaN(weightNum) || weightNum <= 0) {
        newErrors.maxWeight = 'Kapasitas berat tidak valid';
      }

      const volumeNum = parseFloat(maxVolume.replace(',', '.'));
      if (!maxVolume.trim() || isNaN(volumeNum) || volumeNum <= 0) {
        newErrors.maxVolume = 'Kapasitas volume tidak valid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!depotId) {
      Alert.alert('Error', 'ID Depot tidak ditemukan.');
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    try {
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
      let endpoint = '';
      let payload: any = {};

      if (role === 'ADMIN') {
        endpoint = `http://${api_address}:3000/human/admin`;
        payload = { username, password, fullName, depotId, phoneNumber, birthDate };
      } else {
        endpoint = `http://${api_address}:3000/human/driver`;
        payload = {
          username, password, fullName, phoneNumber, birthDate, depotId,
          vehicleType, plateNumber, vehicleModel,
          maxWeight: parseFloat(maxWeight.replace(',', '.')),
          maxVolume: parseFloat(maxVolume.replace(',', '.')),
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Berhasil', `Staf ${role} baru berhasil ditambahkan!`);
        router.back();
      } else {
        Alert.alert('Gagal', result.message || `Gagal mendaftarkan ${role}.`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error Jaringan', 'Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Tambah Staf Baru', headerShown: true, headerShadowVisible: false, headerStyle: { backgroundColor: '#F8FAFC' } }} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        <View style={styles.roleToggleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'ADMIN' && { backgroundColor: primaryColor }]}
            onPress={() => { setRole('ADMIN'); setErrors({}); }}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.roleText, role === 'ADMIN' && styles.roleTextActive]}>Admin Cabang</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'DRIVER' && { backgroundColor: primaryColor }]}
            onPress={() => { setRole('DRIVER'); setErrors({}); }}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.roleText, role === 'DRIVER' && styles.roleTextActive]}>Kurir / Driver</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Data Pribadi & Akun</ThemedText>
          
          <ThemedText style={styles.label}>Nama Lengkap <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput 
            style={[styles.input, errors.fullName && styles.inputError]} 
            placeholder="Cth: Andika Pratama" 
            value={fullName} 
            onChangeText={(txt) => { setFullName(txt); setErrors(prev => ({...prev, fullName: ''})); }} 
            placeholderTextColor="#94A3B8" 
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          <ThemedText style={styles.label}>Username Login <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput 
            style={[styles.input, errors.username && styles.inputError]} 
            placeholder="Cth: driver_andika" 
            value={username} 
            onChangeText={(txt) => { setUsername(txt); setErrors(prev => ({...prev, username: ''})); }} 
            autoCapitalize="none" 
            placeholderTextColor="#94A3B8" 
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          <ThemedText style={styles.label}>Password <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput 
            style={[styles.input, errors.password && styles.inputError]} 
            placeholder="Minimal 6 karakter" 
            value={password} 
            onChangeText={(txt) => { setPassword(txt); setErrors(prev => ({...prev, password: ''})); }} 
            secureTextEntry 
            placeholderTextColor="#94A3B8" 
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>No. Telepon <Text style={styles.asterisk}>*</Text></ThemedText>
              <TextInput 
                style={[styles.input, errors.phoneNumber && styles.inputError]} 
                placeholder="0812..." 
                value={phoneNumber} 
                onChangeText={(txt) => { setPhoneNumber(txt); setErrors(prev => ({...prev, phoneNumber: ''})); }} 
                keyboardType="phone-pad" 
                placeholderTextColor="#94A3B8" 
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Tgl Lahir <Text style={styles.asterisk}>*</Text></ThemedText>
              <TextInput 
                style={[styles.input, errors.birthDate && styles.inputError]} 
                placeholder="YYYY-MM-DD" 
                value={birthDate} 
                onChangeText={(txt) => { setBirthDate(txt); setErrors(prev => ({...prev, birthDate: ''})); }} 
                placeholderTextColor="#94A3B8" 
              />
              {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            </View>
          </View>

          {role === 'DRIVER' && (
            <View style={styles.driverSection}>
              <View style={styles.divider} />
              <ThemedText style={styles.sectionTitle}>Data Kendaraan (Khusus Kurir)</ThemedText>
              
              <ThemedText style={styles.label}>Jenis Kendaraan <Text style={styles.asterisk}>*</Text></ThemedText>
              <View style={styles.vehicleToggleContainer}>
                <TouchableOpacity 
                  style={[styles.vehicleButton, vehicleType === 'MOTOR' && { backgroundColor: hexToRgba(primaryColor, 0.1), borderColor: primaryColor }]}
                  onPress={() => setVehicleType('MOTOR')}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.vehicleText, vehicleType === 'MOTOR' && { color: primaryColor }]}>Motor</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.vehicleButton, vehicleType === 'MOBIL' && { backgroundColor: hexToRgba(primaryColor, 0.1), borderColor: primaryColor }]}
                  onPress={() => setVehicleType('MOBIL')}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.vehicleText, vehicleType === 'MOBIL' && { color: primaryColor }]}>Mobil</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Plat Nomor <Text style={styles.asterisk}>*</Text></ThemedText>
                  <TextInput 
                    style={[styles.input, errors.plateNumber && styles.inputError]} 
                    placeholder="L 4567 ABD" 
                    value={plateNumber} 
                    onChangeText={(txt) => { setPlateNumber(txt); setErrors(prev => ({...prev, plateNumber: ''})); }} 
                    autoCapitalize="characters" 
                    placeholderTextColor="#94A3B8" 
                  />
                  {errors.plateNumber && <Text style={styles.errorText}>{errors.plateNumber}</Text>}
                </View>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Model <Text style={styles.asterisk}>*</Text></ThemedText>
                  <TextInput 
                    style={[styles.input, errors.vehicleModel && styles.inputError]} 
                    placeholder="Vario 160" 
                    value={vehicleModel} 
                    onChangeText={(txt) => { setVehicleModel(txt); setErrors(prev => ({...prev, vehicleModel: ''})); }} 
                    placeholderTextColor="#94A3B8" 
                  />
                  {errors.vehicleModel && <Text style={styles.errorText}>{errors.vehicleModel}</Text>}
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Kapasitas Berat (kg) <Text style={styles.asterisk}>*</Text></ThemedText>
                  <TextInput 
                    style={[styles.input, errors.maxWeight && styles.inputError]} 
                    placeholder="50.5" 
                    value={maxWeight} 
                    onChangeText={(txt) => { setMaxWeight(txt); setErrors(prev => ({...prev, maxWeight: ''})); }} 
                    keyboardType="numeric" 
                    placeholderTextColor="#94A3B8" 
                  />
                  {errors.maxWeight && <Text style={styles.errorText}>{errors.maxWeight}</Text>}
                </View>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Kapasitas Vol (L) <Text style={styles.asterisk}>*</Text></ThemedText>
                  <TextInput 
                    style={[styles.input, errors.maxVolume && styles.inputError]} 
                    placeholder="80" 
                    value={maxVolume} 
                    onChangeText={(txt) => { setMaxVolume(txt); setErrors(prev => ({...prev, maxVolume: ''})); }} 
                    keyboardType="numeric" 
                    placeholderTextColor="#94A3B8" 
                  />
                  {errors.maxVolume && <Text style={styles.errorText}>{errors.maxVolume}</Text>}
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={primaryColor} />
            ) : (
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: primaryColor }]} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.submitButtonText}>Daftarkan {role === 'ADMIN' ? 'Admin' : 'Kurir'}</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  roleToggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 6, marginBottom: 24 },
  roleButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  roleText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  roleTextActive: { color: '#FFFFFF', fontWeight: '800' },
  card: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16, letterSpacing: -0.3 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
  asterisk: { color: '#EF4444' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfInput: { flex: 1 },
  driverSection: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 24 },
  vehicleToggleContainer: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  vehicleButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  vehicleText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  buttonContainer: { marginTop: 32, alignItems: 'center' },
  submitButton: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});