import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditDepotScreen() {
  const router = useRouter();
  const { id, name: initialName, address: initialAddress, lat: initialLat, lng: initialLng } = useLocalSearchParams();
  const token = useAuthStore((state) => state.token);
  const { colors } = useThemeStore();

  const [name, setName] = useState(initialName?.toString() || '');
  const [address, setAddress] = useState(initialAddress?.toString() || '');
  const [lat, setLat] = useState(initialLat?.toString() || '');
  const [lng, setLng] = useState(initialLng?.toString() || '');
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isUpdating, setIsUpdating] = useState(false); 
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = () => {
    let newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nama depot wajib diisi';
    if (!address.trim()) newErrors.address = 'Alamat lengkap wajib diisi';

    const latitude = parseFloat(lat.replace(',', '.'));
    if (!lat.trim()) {
      newErrors.lat = 'Latitude wajib diisi';
    } else if (isNaN(latitude)) {
      newErrors.lat = 'Format harus berupa angka valid';
    }

    const longitude = parseFloat(lng.replace(',', '.'));
    if (!lng.trim()) {
      newErrors.lng = 'Longitude wajib diisi';
    } else if (isNaN(longitude)) {
      newErrors.lng = 'Format harus berupa angka valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setIsUpdating(true);
    const API_URL = `http://${api_address}:3000/depot/${id}`;
    const latNum = Number(lat.toString().replace(',', '.'));
    const lngNum = Number(lng.toString().replace(',', '.'));

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
        console.log("Server Error Response:", result); 
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
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F8FAFC' }
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <ThemedText style={styles.label}>Nama Depot <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Cth: Gudang Bahan Mentah"
            value={name}
            onChangeText={(txt) => { setName(txt); setErrors(prev => ({...prev, name: ''})); }}
            placeholderTextColor="#94A3B8"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <ThemedText style={styles.label}>Alamat Lengkap <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            placeholder="Cth: Ruko A, Tunjungan..."
            value={address}
            onChangeText={(txt) => { setAddress(txt); setErrors(prev => ({...prev, address: ''})); }}
            multiline
            numberOfLines={3}
            placeholderTextColor="#94A3B8"
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Latitude <Text style={styles.asterisk}>*</Text></ThemedText>
              <TextInput
                style={[styles.input, errors.lat && styles.inputError]}
                placeholder="Cth: -7.2575"
                value={lat}
                onChangeText={(txt) => { setLat(txt); setErrors(prev => ({...prev, lat: ''})); }}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
              {errors.lat && <Text style={styles.errorText}>{errors.lat}</Text>}
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Longitude <Text style={styles.asterisk}>*</Text></ThemedText>
              <TextInput
                style={[styles.input, errors.lng && styles.inputError]}
                placeholder="Cth: 112.7521"
                value={lng}
                onChangeText={(txt) => { setLng(txt); setErrors(prev => ({...prev, lng: ''})); }}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
              {errors.lng && <Text style={styles.errorText}>{errors.lng}</Text>}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {isUpdating ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                onPress={handleUpdate}
                activeOpacity={0.8}
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
  asterisk: { color: '#EF4444' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '500' },
  textArea: { textAlignVertical: 'top', height: 80 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfInput: { flex: 1 },
  buttonContainer: { marginTop: 32, alignItems: 'center' },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});