import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddStaffScreen() {
  const router = useRouter();
  // Menangkap depotId yang dilempar dari layar Detail Depot
  const { depotId } = useLocalSearchParams(); 

  // State untuk jenis staf
  const [role, setRole] = useState<'ADMIN' | 'DRIVER'>('ADMIN');

  // State Umum (Admin & Driver)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState(''); // Format YYYY-MM-DD

  // State Khusus Driver
  const [vehicleType, setVehicleType] = useState<'MOTOR' | 'MOBIL'>('MOTOR');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [maxVolume, setMaxVolume] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || !fullName || !phoneNumber || !birthDate || !depotId) {
      Alert.alert('Peringatan', 'Mohon lengkapi semua data staf!');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

      let endpoint = '';
      let payload: any = {};

      if (role === 'ADMIN') {
        endpoint = `http://${api_address}:3000/human/admin`;
        payload = {
          username,
          password,
          fullName,
          depotId,
          phoneNumber,
          birthDate,
        };
      } else {
        if (!plateNumber || !vehicleModel || !maxWeight || !maxVolume) {
          Alert.alert('Peringatan', 'Data kendaraan wajib diisi untuk Driver!');
          setIsLoading(false);
          return;
        }

        endpoint = `http://${api_address}:3000/human/driver`;
        payload = {
          username,
          password, 
          fullName,
          phoneNumber,
          birthDate,
          depotId,
          vehicleType,
          plateNumber,
          vehicleModel,
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
        router.back(); // Otomatis kembali ke layar Detail Depot
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
      <Stack.Screen options={{ title: 'Tambah Staf Baru', headerShown: true }} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Toggle Pilihan Role */}
        <View style={styles.roleToggleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'ADMIN' && styles.roleButtonActive]}
            onPress={() => setRole('ADMIN')}
          >
            <ThemedText style={[styles.roleText, role === 'ADMIN' && styles.roleTextActive]}>Admin Cabang</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'DRIVER' && styles.roleButtonActive]}
            onPress={() => setRole('DRIVER')}
          >
            <ThemedText style={[styles.roleText, role === 'DRIVER' && styles.roleTextActive]}>Kurir / Driver</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Data Pribadi & Akun</ThemedText>
          
          <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
          <TextInput style={styles.input} placeholder="Cth: Andika Pratama" value={fullName} onChangeText={setFullName} placeholderTextColor="#999" />

          <ThemedText style={styles.label}>Username Login</ThemedText>
          <TextInput style={styles.input} placeholder="Cth: driver_andika" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#999" />

          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput style={styles.input} placeholder="Minimal 6 karakter" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>No. Telepon</ThemedText>
              <TextInput style={styles.input} placeholder="0812..." value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor="#999" />
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Tgl Lahir</ThemedText>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={birthDate} onChangeText={setBirthDate} placeholderTextColor="#999" />
            </View>
          </View>

          {/* Form Tambahan Khusus Driver */}
          {role === 'DRIVER' && (
            <View style={styles.driverSection}>
              <View style={styles.divider} />
              <ThemedText style={styles.sectionTitle}>Data Kendaraan (Khusus Kurir)</ThemedText>
              
              <ThemedText style={styles.label}>Jenis Kendaraan</ThemedText>
              <View style={styles.roleToggleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, vehicleType === 'MOTOR' && styles.roleButtonActive]}
                  onPress={() => setVehicleType('MOTOR')}
                >
                  <ThemedText style={[styles.roleText, vehicleType === 'MOTOR' && styles.roleTextActive]}>Motor</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, vehicleType === 'MOBIL' && styles.roleButtonActive]}
                  onPress={() => setVehicleType('MOBIL')}
                >
                  <ThemedText style={[styles.roleText, vehicleType === 'MOBIL' && styles.roleTextActive]}>Mobil</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Plat Nomor</ThemedText>
                  <TextInput style={styles.input} placeholder="L 4567 ABD" value={plateNumber} onChangeText={setPlateNumber} autoCapitalize="characters" placeholderTextColor="#999" />
                </View>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Model Kendaraan</ThemedText>
                  <TextInput style={styles.input} placeholder="Vario 160" value={vehicleModel} onChangeText={setVehicleModel} placeholderTextColor="#999" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Kapasitas Berat (kg)</ThemedText>
                  <TextInput style={styles.input} placeholder="50.5" value={maxWeight} onChangeText={setMaxWeight} keyboardType="numeric" placeholderTextColor="#999" />
                </View>
                <View style={styles.halfInput}>
                  <ThemedText style={styles.label}>Kapasitas Vol (L)</ThemedText>
                  <TextInput style={styles.input} placeholder="80" value={maxVolume} onChangeText={setMaxVolume} keyboardType="numeric" placeholderTextColor="#999" />
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4991CC" />
            ) : (
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <ThemedText style={styles.submitButtonText}>Simpan {role === 'ADMIN' ? 'Admin' : 'Kurir'}</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  roleToggleContainer: { flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 10, padding: 4, marginBottom: 20 },
  roleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  roleButtonActive: { backgroundColor: '#4991CC', elevation: 2 },
  roleText: { color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#FFF' },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 15, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  halfInput: { flex: 1 },
  driverSection: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  buttonContainer: { marginTop: 30, alignItems: 'center' },
  submitButton: { backgroundColor: '#4991CC', width: '100%', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});