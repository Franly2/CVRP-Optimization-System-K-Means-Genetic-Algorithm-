import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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

interface ShiftOption {
  id: string;
  name: string;
}

interface ScheduleItem {
  dayOfWeek: number;
  menuDetails: string;
}

interface ProductImage {
  url: string;
  isMain: boolean;
  order: number;
}

export default function AddProductScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { colors } = useThemeStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [isSub, setIsSub] = useState(false);
  const [duration, setDuration] = useState('');
  
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [otherImageUrls, setOtherImageUrls] = useState<string[]>(['']);

  const [allDepots, setAllDepots] = useState<DepotOption[]>([]);
  const [selectedDepots, setSelectedDepots] = useState<string[]>([]);
  const [allShifts, setAllShifts] = useState<ShiftOption[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    [1, 2, 3, 4, 5, 6, 7].map(day => ({ dayOfWeek: day, menuDetails: '' }))
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [depotRes, shiftRes] = await Promise.all([
        fetch(`http://${api_address}:3000/depot`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://${api_address}:3000/catalog/shifts`, { 
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const depotJson = await depotRes.json();
      const shiftJson = await shiftRes.json();

      if (depotRes.ok) setAllDepots(depotJson.data || []);
      if (shiftRes.ok) setAllShifts(shiftJson.data || []);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat metadata (Depot/Shift)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!name || !price || selectedDepots.length === 0 || !mainImageUrl) {
      Alert.alert('Peringatan', 'Nama, Harga, Foto Utama, dan minimal 1 Depot wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const imagesPayload: ProductImage[] = [];
      imagesPayload.push({ url: mainImageUrl, isMain: true, order: 0 });
      
      otherImageUrls.forEach((url, index) => {
        if (url.trim() !== '') {
          imagesPayload.push({ url: url, isMain: false, order: index + 1 });
        }
      });

      const parsedWeight = weight ? parseFloat(weight.replace(',', '.')) : 0;
      const parsedVolume = volume ? parseFloat(volume.replace(',', '.')) : 0;
      const parsedPrice = Number(price) || 0;
      const parsedDuration = duration ? Number(duration) : null;

      const payload = {
        name,
        price: parsedPrice,
        weightEst: isNaN(parsedWeight) ? 0 : parsedWeight,
        volumeEst: isNaN(parsedVolume) ? 0 : parsedVolume,
        isSubscription: isSub,
        durationDays: isSub ? parsedDuration : null,
        depotIds: selectedDepots,
        shiftIds: selectedShifts,
        schedules: isSub ? schedules.filter(s => s.menuDetails.trim() !== '') : [],
        images: imagesPayload
      };

      const response = await fetch(`http://${api_address}:3000/catalog/product`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Berhasil', 'Produk baru ditambahkan ke katalog');
        if (router.canGoBack()) {
          router.back(); 
        } else {
          router.replace('/dashboard'); 
        }
      } else {
        const err = await response.json();
        const errorMsg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
        Alert.alert('Gagal', errorMsg || 'Gagal menambahkan produk');
      }
    } catch (e: any) {
      Alert.alert('Error', `Koneksi bermasalah: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Tambah Produk Baru', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Media Produk</ThemedText>
          <ThemedText style={styles.label}>URL Foto Utama</ThemedText>
          <TextInput 
            style={styles.input} 
            value={mainImageUrl} 
            onChangeText={setMainImageUrl} 
          />
          
          <ThemedText style={[styles.label, { marginTop: 10 }]}>Gallery (URL Foto Lainnya)</ThemedText>
          {otherImageUrls.map((url, index) => (
            <View key={index} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                value={url} 
                onChangeText={(text) => {
                  const newUrls = [...otherImageUrls];
                  newUrls[index] = text;
                  setOtherImageUrls(newUrls);
                }} 
              />
              <TouchableOpacity 
                onPress={() => setOtherImageUrls(otherImageUrls.filter((_, i) => i !== index))}
                style={{ justifyContent: 'center' }}
              >
                <Ionicons name="trash" size={20} color="#B71C1C" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            onPress={() => setOtherImageUrls([...otherImageUrls, ''])}
            style={styles.addButton}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>Tambah Baris Foto</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informasi Produk</ThemedText>
          <ThemedText style={styles.label}>Nama Produk</ThemedText>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <ThemedText style={styles.label}>Harga (Rp)</ThemedText>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Contoh: 25000" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Berat (kg)</ThemedText>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Contoh : 0.5" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Volume (L)</ThemedText>
              <TextInput style={styles.input} value={volume} onChangeText={setVolume} keyboardType="numeric" placeholder="Contoh: 1.2" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Tersedia untuk Jam Pengiriman (Shift)</ThemedText>
          <View style={styles.grid}>
            {allShifts.map((s) => {
              const isSelected = selectedShifts.includes(s.id);
              return (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.chip, { borderColor: colors.primary }, isSelected && { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setSelectedShifts(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])
                  }}
                >
                  <ThemedText style={[styles.chipText, { color: isSelected ? "#FFF" : colors.primary }]}>
                    {s.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, styles.subRow]}>
          <View>
            <ThemedText style={styles.bold}>Aktifkan Langganan?</ThemedText>
            <ThemedText style={styles.hint}>Produk memiliki jadwal menu harian</ThemedText>
          </View>
          <Switch value={isSub} onValueChange={setIsSub} trackColor={{ true: colors.primary }} />
        </View>

        {isSub && (
          <View style={styles.section}>
            <ThemedText style={styles.label}>Durasi Paket (Hari)</ThemedText>
            <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="Contoh : 30" />
            
            <ThemedText style={[styles.label, { marginTop: 10 }]}>Jadwal Menu Mingguan</ThemedText>
            {schedules.map((s, idx) => (
              <View key={s.dayOfWeek} style={{ marginBottom: 12 }}>
                 <ThemedText style={styles.dayLabel}>
                   {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][idx]}
                 </ThemedText>
                 <TextInput 
                  style={[styles.input, {marginBottom: 0}]} 
                  placeholder="Contoh: Nasi Goreng + Telur" 
                  value={s.menuDetails}
                  onChangeText={(txt) => {
                    setSchedules(schedules.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, menuDetails: txt } : item));
                  }}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.label}>Tersedia di Depot Mana Saja?</ThemedText>
          <View style={styles.grid}>
            {allDepots.map((d) => {
              const isSelected = selectedDepots.includes(d.id);
              return (
                <TouchableOpacity 
                  key={d.id} 
                  style={[
                    styles.chip, 
                    { borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }, 
                    isSelected && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => {
                    setSelectedDepots(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id])
                  }}
                >
                  <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"} 
                    size={16} 
                    color={isSelected ? "#FFF" : colors.primary} 
                  />
                  <ThemedText style={[styles.chipText, { color: isSelected ? "#FFF" : colors.primary }]}>
                    {d.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }, isSaving && { opacity: 0.7 }]} 
          onPress={handleAddProduct}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveText}>Tambahkan Produk Baru</ThemedText>}
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  row: { flexDirection: 'row', gap: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '600' },
  dayLabel: { fontSize: 12, marginBottom: 4, fontWeight: 'bold', color: '#444' },
  input: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', fontSize: 16, marginBottom: 10 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bold: { fontSize: 16, fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#888' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: 'bold' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  saveButton: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});