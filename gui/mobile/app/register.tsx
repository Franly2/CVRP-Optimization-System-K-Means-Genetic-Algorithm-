import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter(); 
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState(''); 
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [vehicleType, setVehicleType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  
  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS; 
  const API_URL = `http://${api_address}:3000/auth/register`;

  async function handleRegister() {
    if (!username || !password || !fullName || !birthDate || !phoneNumber) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi semua data pribadi dan akun.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password,
          role: isAdmin ? 'ADMIN' : 'DRIVER',
          
          fullName: fullName,
          phoneNumber: phoneNumber,
          birthDate: birthDate, 
          
          vehicleType: vehicleType,
          plateNumber: plateNumber,
          maxCapacity: maxCapacity ? Number(maxCapacity) : 20, // konvert string ke number
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        if (Platform.OS === 'web') {
          window.alert(data.message);
          router.push('/');
        } else {
          Alert.alert("Sukses", data.message, [{ text: "OK", onPress: () => router.push('/') }]);
        }
      } else {
        const msg = data.message || "Terjadi kesalahan";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Error", msg);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal koneksi ke server. Cek IP Address.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setIsAdmin(!isAdmin)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
            {isAdmin && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Daftar sebagai Akun Admin</Text>
        </TouchableOpacity>
      
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Akun Login</Text>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          placeholder='Username'
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          secureTextEntry
        />

        <Text style={styles.sectionTitle}>Data Pribadi</Text>
        <TextInput
          style={styles.input}
          onChangeText={setFullName}
          value={fullName}
          placeholder="Nama Lengkap"
        />
        <TextInput
          style={styles.input}
          onChangeText={setBirthDate}
          value={birthDate}
          placeholder="Tgl Lahir (YYYY-MM-DD)" 
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          onChangeText={setPhoneNumber}
          value={phoneNumber}
          placeholder="Nomor HP / WhatsApp"
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitle}>Info Kendaraan (VRP)</Text>
        <TextInput
          style={styles.input}
          onChangeText={setVehicleType}
          value={vehicleType}
          placeholder="Jenis Kendaraan (Motor/Mobil)"
        />
        <TextInput
          style={styles.input}
          onChangeText={setPlateNumber}
          value={plateNumber}
          placeholder="Plat Nomor (L 1234 XX)"
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          onChangeText={setMaxCapacity}
          value={maxCapacity}
          placeholder="Kapasitas Paket (Contoh: 25)"
          keyboardType="numeric"
        />

        <View style={{ marginTop: 10 }}>
          <Button
            onPress={handleRegister}
            title="Daftar Sekarang"
            color="#4991CC"
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4991CC" style={{marginTop: 20}} />
      ) : (
        <View style={{ marginTop: 20, alignItems: 'center', marginBottom: 40 }}>
          <Text style={{color: '#666'}}>Sudah punya akun?</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={{ color: '#4991CC', fontWeight: 'bold', marginTop: 5 }}>
              Masuk Disini
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' },
  formContainer: { gap: 10, paddingBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 5, 
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4991CC',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4991CC',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#4991CC',
  },
});