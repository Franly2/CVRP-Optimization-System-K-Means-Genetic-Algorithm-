import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Switch,
  TextInput, TouchableOpacity, View
} from 'react-native';

interface DepotOption {
  id: string;
  name: string;
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [isSub, setIsSub] = useState(false);
  const [duration, setDuration] = useState('');
  
  // Depot Selection State
  const [allDepots, setAllDepots] = useState<DepotOption[]>([]);
  const [selectedDepots, setSelectedDepots] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      // 1. Ambil Data Produk & Data Semua Depot secara paralel
      const [prodRes, depotRes] = await Promise.all([
        fetch(`http://${api_address}:3000/catalog/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://${api_address}:3000/depot`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const prodJson = await prodRes.json();
      const depotJson = await depotRes.json();

      if (prodRes.ok && depotRes.ok) {
        const p = prodJson.data;
        setName(p.name);
        setPrice(p.price.toString());
        setWeight(p.weightEst.toString());
        setVolume(p.volumeEst.toString());
        setIsSub(p.isSubscription);
        setDuration(p.durationDays?.toString() || '');
        setAllDepots(depotJson.data);
        // Map ID depot yang sudah terhubung
        setSelectedDepots(p.availableAt.map((d: any) => d.id));
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDepot = (depotId: string) => {
    if (selectedDepots.includes(depotId)) {
      setSelectedDepots(selectedDepots.filter(i => i !== depotId));
    } else {
      setSelectedDepots([...selectedDepots, depotId]);
    }
  };

  const handleUpdate = async () => {
    if (!name || !price || selectedDepots.length === 0) {
      Alert.alert('Peringatan', 'Nama, Harga, dan minimal 1 Depot wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`http://${api_address}:3000/catalog/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          weightEst: parseFloat(weight),
          volumeEst: parseFloat(volume),
          isSubscription: isSub,
          durationDays: isSub ? Number(duration) : null,
          depotIds: selectedDepots // Kirim list ID baru
        }),
      });

      if (response.ok) {
        Alert.alert('Berhasil', 'Produk diperbarui');
        router.back();
      } else {
        const err = await response.json();
        Alert.alert('Gagal', err.message || 'Gagal update');
      }
    } catch (e) {
      Alert.alert('Error', 'Koneksi bermasalah');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator color="#4991CC" /></View>;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Produk' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* --- Form Input --- */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Nama Produk</ThemedText>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contoh: Nasi Box A" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Harga (Rp)</ThemedText>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Berat (kg)</ThemedText>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Volume (L)</ThemedText>
              <TextInput style={styles.input} value={volume} onChangeText={setVolume} keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* --- Subscription Toggle --- */}
        <View style={[styles.section, styles.subRow]}>
          <View>
            <ThemedText style={styles.bold}>Produk Langganan?</ThemedText>
            <ThemedText style={styles.hint}>Aktifkan jika ini paket bulanan/mingguan</ThemedText>
          </View>
          <Switch value={isSub} onValueChange={setIsSub} trackColor={{ true: '#4991CC' }} />
        </View>

        {isSub && (
          <View style={styles.section}>
            <ThemedText style={styles.label}>Durasi (Hari)</ThemedText>
            <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />
          </View>
        )}

        {/* --- Depot Selection --- */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Tersedia di Depot Mana Saja?</ThemedText>
          <View style={styles.depotGrid}>
            {allDepots.map((d) => (
              <TouchableOpacity 
                key={d.id} 
                style={[styles.depotChip, selectedDepots.includes(d.id) && styles.depotChipActive]}
                onPress={() => toggleDepot(d.id)}
              >
                <Ionicons 
                  name={selectedDepots.includes(d.id) ? "checkbox" : "square-outline"} 
                  size={18} color={selectedDepots.includes(d.id) ? "#FFF" : "#4991CC"} 
                />
                <ThemedText style={[styles.chipText, selectedDepots.includes(d.id) && styles.chipTextActive]}>
                  {d.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- Save Button --- */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
          onPress={handleUpdate}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveText}>Simpan Perubahan</ThemedText>}
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center' },
  scroll: { padding: 20 },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  row: { flexDirection: 'row', gap: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', fontSize: 16, marginBottom: 10 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bold: { fontSize: 16, fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#888' },
  
  depotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  depotChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#4991CC', gap: 6 },
  depotChipActive: { backgroundColor: '#4991CC' },
  chipText: { fontSize: 12, color: '#4991CC', fontWeight: 'bold' },
  chipTextActive: { color: '#FFF' },

  saveButton: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});