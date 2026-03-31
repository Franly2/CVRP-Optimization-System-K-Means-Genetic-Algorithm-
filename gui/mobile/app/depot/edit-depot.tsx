import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditDepotScreen() {
  const router = useRouter();
  const { id, name: initialName, address: initialAddress, lat: initialLat, lng: initialLng } = useLocalSearchParams();
  const token = useAuthStore((state) => state.token);
  const { colors } = useThemeStore();

  const [name, setName] = useState(initialName?.toString() || '');
  const [address, setAddress] = useState(initialAddress?.toString() || '');
  const [lat, setLat] = useState(initialLat?.toString() || '');
  const [lng, setLng] = useState(initialLng?.toString() || '');
  
  const [isLoading, setIsLoading] = useState(true); // Loading saat fetch data awal
  const [isUpdating, setIsUpdating] = useState(false); // Loading saat proses simpan

  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

  useEffect(() => {
    const fetchDepotDetail = async () => {
      try {
        const response = await fetch(`http://${api_address}:3000/depot/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (response.ok) {
          setName(result.data.name);
          setAddress(result.data.address);
          setLat(result.data.lat.toString());
          setLng(result.data.lng.toString());
        } else {
          Alert.alert('Error', 'Gagal mengambil data depot');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Koneksi ke server bermasalah');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDepotDetail();
  }, [id]);

  const handleUpdate = async () => {
  if (!name || !address || !lat || !lng) {
    Alert.alert('Peringatan', 'Semua kolom wajib diisi!');
    return;
  }

  // Bersihkan input dan pastikan tipe Number
  const latNum = Number(lat.toString().replace(',', '.'));
  const lngNum = Number(lng.toString().replace(',', '.'));

  if (isNaN(latNum) || isNaN(lngNum)) {
    Alert.alert('Peringatan', 'Latitude/Longitude tidak valid');
    return;
  }

  setIsUpdating(true);
  const API_URL = `http://${api_address}:3000/depot/${id}`;

  try {
    const response = await fetch(API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        address: address.trim(),
        lat: latNum,
        lng: lngNum,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      Alert.alert('Berhasil', 'Data depot berhasil diperbarui!');
      router.back();
    } else {
      console.log("Server Error Response:", result); // Lihat di console vscode
      Alert.alert('Gagal', result.message || 'Terjadi kesalahan server.');
    }
  } catch (error) {
    console.error("Network Error:", error);
    Alert.alert('Error Jaringan', 'Gagal terhubung ke server.');
  } finally {
    setIsUpdating(false);
  }
};

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 10 }}>Memuat data depot...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Depot',
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
            {isUpdating ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                onPress={handleUpdate}
              >
                <ThemedText style={styles.submitButtonText}>Simpan Perubahan</ThemedText>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});