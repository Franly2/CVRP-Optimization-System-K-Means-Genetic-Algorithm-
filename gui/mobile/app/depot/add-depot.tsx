import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddDepotScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !address || !lat || !lng) {
      Alert.alert('Peringatan', 'Semua kolom wajib diisi!');
      return;
    }

    const latitude = parseFloat(lat.replace(',', '.'));
    const longitude = parseFloat(lng.replace(',', '.'));

    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert('Peringatan', 'Latitude dan Longitude harus berupa angka yang valid!');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

      const response = await fetch(`http://${api_address}:3000/depot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          address: address,
          lat: latitude,
          lng: longitude,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Berhasil', 'Depot baru berhasil ditambahkan!');
        router.back();
      } else {
        Alert.alert('Gagal', result.message || 'Terjadi kesalahan saat menyimpan data.');
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
      <Stack.Screen 
        options={{
          title: 'Tambah Depot Baru',
          headerShown: true,
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <ThemedText style={styles.label}>Nama Depot</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Cth: Gudang Bahan Mentah"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <ThemedText style={styles.label}>Alamat Lengkap</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cth: Ruko A, Tunjungan..."
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Latitude</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Cth: -7.2575"
                value={lat}
                onChangeText={setLat}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Longitude</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Cth: 112.7521"
                value={lng}
                onChangeText={setLng}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4991CC" />
            ) : (
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <ThemedText style={styles.submitButtonText}>Simpan Depot</ThemedText>
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
  scrollContainer: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: { textAlignVertical: 'top', height: 80 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  halfInput: { flex: 1 },
  buttonContainer: { marginTop: 30, alignItems: 'center' },
  submitButton: {
    backgroundColor: '#4991CC',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});