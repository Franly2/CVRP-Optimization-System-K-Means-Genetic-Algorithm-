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
  Text,
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

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
  let r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  let g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  let b = parseInt(cleanHex.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AddProductScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { colors } = useThemeStore();
  const primaryColor = colors.primary || '#0F172A';

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

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!mainImageUrl.trim()) {
      newErrors.mainImageUrl = 'URL Foto Utama wajib diisi';
    } else if (!mainImageUrl.startsWith('http')) {
      newErrors.mainImageUrl = 'Format URL tidak valid (harus diawali http/https)';
    }

    if (!name.trim()) newErrors.name = 'Nama produk wajib diisi';

    const parsedPrice = Number(price);
    if (!price.trim()) {
      newErrors.price = 'Harga wajib diisi';
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Harga harus berupa angka lebih dari 0';
    }

    if (weight.trim()) {
      const parsedWeight = parseFloat(weight.replace(',', '.'));
      if (isNaN(parsedWeight)) newErrors.weight = 'Format berat tidak valid (gunakan angka)';
    }

    if (volume.trim()) {
      const parsedVolume = parseFloat(volume.replace(',', '.'));
      if (isNaN(parsedVolume)) newErrors.volume = 'Format volume tidak valid (gunakan angka)';
    }

    if (isSub) {
      const parsedDuration = Number(duration);
      if (!duration.trim()) {
        newErrors.duration = 'Durasi wajib diisi jika langganan aktif';
      } else if (isNaN(parsedDuration) || parsedDuration <= 0) {
        newErrors.duration = 'Durasi harus berupa angka lebih dari 0';
      }
    }

    if (selectedDepots.length === 0) {
      newErrors.depots = 'Pilih minimal 1 depot pengiriman';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const handleAddProduct = async () => {
    if (!validate()) {
      Alert.alert('Data Tidak Valid', 'Mohon periksa kembali kolom yang berwarna merah.');
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={primaryColor} size="large" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Tambah Produk Baru', 
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F8FAFC' }
        }} 
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* --- Media Produk --- */}
        <View style={styles.cardModern}>
          <ThemedText style={styles.sectionTitle}>Media Produk</ThemedText>
          
          <ThemedText style={[styles.label, styles.labelFirst]}>URL Foto Utama <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput 
            style={[styles.input, errors.mainImageUrl && styles.inputError]} 
            value={mainImageUrl} 
            onChangeText={(text) => { setMainImageUrl(text); setErrors(prev => ({ ...prev, mainImageUrl: '' })); }} 
            placeholder="https://contoh.com/foto.jpg"
            placeholderTextColor="#94A3B8"
          />
          {errors.mainImageUrl && <Text style={styles.errorText}>{errors.mainImageUrl}</Text>}
          
          <ThemedText style={styles.label}>Gallery (URL Foto Lainnya)</ThemedText>
          {otherImageUrls.map((url, index) => (
            <View key={index} style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput 
                  style={[styles.input, { marginBottom: 8 }]} 
                  value={url} 
                  onChangeText={(text) => {
                    const newUrls = [...otherImageUrls];
                    newUrls[index] = text;
                    setOtherImageUrls(newUrls);
                  }} 
                  placeholder="https://..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <TouchableOpacity 
                onPress={() => setOtherImageUrls(otherImageUrls.filter((_, i) => i !== index))}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            onPress={() => setOtherImageUrls([...otherImageUrls, ''])}
            style={[styles.addButton, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={primaryColor} />
            <ThemedText style={[styles.addButtonText, { color: primaryColor }]}>Tambah Baris Foto</ThemedText>
          </TouchableOpacity>
        </View>

        {/* --- Informasi Produk --- */}
        <View style={styles.cardModern}>
          <ThemedText style={styles.sectionTitle}>Informasi Produk</ThemedText>
          
          <ThemedText style={[styles.label, styles.labelFirst]}>Nama Produk <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput 
            style={[styles.input, errors.name && styles.inputError]} 
            value={name} 
            onChangeText={(text) => { setName(text); setErrors(prev => ({ ...prev, name: '' })); }} 
            placeholderTextColor="#94A3B8"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <ThemedText style={styles.label}>Harga (Rp) <Text style={styles.asterisk}>*</Text></ThemedText>
          <TextInput 
            style={[styles.input, errors.price && styles.inputError]} 
            value={price} 
            onChangeText={(text) => { setPrice(text); setErrors(prev => ({ ...prev, price: '' })); }} 
            keyboardType="numeric" 
            placeholder="Contoh: 25000" 
            placeholderTextColor="#94A3B8"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Berat (kg)</ThemedText>
              <TextInput 
                style={[styles.input, errors.weight && styles.inputError]} 
                value={weight} 
                onChangeText={(text) => { setWeight(text); setErrors(prev => ({ ...prev, weight: '' })); }} 
                keyboardType="numeric" 
                placeholder="Contoh : 0.5" 
                placeholderTextColor="#94A3B8"
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Volume (L)</ThemedText>
              <TextInput 
                style={[styles.input, errors.volume && styles.inputError]} 
                value={volume} 
                onChangeText={(text) => { setVolume(text); setErrors(prev => ({ ...prev, volume: '' })); }} 
                keyboardType="numeric" 
                placeholder="Contoh: 1.2" 
                placeholderTextColor="#94A3B8"
              />
              {errors.volume && <Text style={styles.errorText}>{errors.volume}</Text>}
            </View>
          </View>
        </View>

        {/* --- Shift --- */}
        <View style={styles.cardModern}>
          <ThemedText style={[styles.label, styles.labelFirst]}>Tersedia untuk Jam Pengiriman (Shift)</ThemedText>
          <View style={styles.grid}>
            {allShifts.map((s) => {
              const isSelected = selectedShifts.includes(s.id);
              return (
                <TouchableOpacity 
                  key={s.id} 
                  style={[
                    styles.chip, 
                    { borderColor: isSelected ? primaryColor : '#E2E8F0' }, 
                    isSelected && { backgroundColor: primaryColor }
                  ]}
                  onPress={() => {
                    setSelectedShifts(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.chipText, { color: isSelected ? "#FFF" : '#64748B' }]}>
                    {s.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* --- Subscription --- */}
        <View style={[styles.cardModern, styles.subRow]}>
          <View>
            <ThemedText style={styles.bold}>Aktifkan Langganan?</ThemedText>
            <ThemedText style={styles.hint}>Produk memiliki jadwal menu harian</ThemedText>
          </View>
          <Switch 
            value={isSub} 
            onValueChange={(val) => {
              setIsSub(val);
              if (!val) setErrors(prev => ({ ...prev, duration: '' })); 
            }} 
            trackColor={{ true: primaryColor, false: '#CBD5E1' }} 
            thumbColor="#FFF"
          />
        </View>

        {isSub && (
          <View style={styles.cardModern}>
            <ThemedText style={[styles.label, styles.labelFirst]}>Durasi Paket (Hari) <Text style={styles.asterisk}>*</Text></ThemedText>
            <TextInput 
              style={[styles.input, errors.duration && styles.inputError]} 
              value={duration} 
              onChangeText={(text) => { setDuration(text); setErrors(prev => ({ ...prev, duration: '' })); }} 
              keyboardType="numeric" 
              placeholder="Contoh : 30" 
              placeholderTextColor="#94A3B8"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
            
            <ThemedText style={styles.label}>Jadwal Menu Mingguan</ThemedText>
            {schedules.map((s, idx) => (
              <View key={s.dayOfWeek} style={{ marginBottom: 16 }}>
                 <ThemedText style={styles.dayLabel}>
                   {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][idx]}
                 </ThemedText>
                 <TextInput 
                  style={styles.input} 
                  placeholder="Contoh: Nasi Goreng + Telur" 
                  placeholderTextColor="#94A3B8"
                  value={s.menuDetails}
                  onChangeText={(txt) => {
                    setSchedules(schedules.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, menuDetails: txt } : item));
                  }}
                />
              </View>
            ))}
          </View>
        )}

        {/* --- Depots --- */}
        <View style={[styles.cardModern, errors.depots && { borderColor: '#EF4444', borderWidth: 1 }]}>
          <ThemedText style={[styles.label, styles.labelFirst]}>Tersedia di Depot Mana Saja? <Text style={styles.asterisk}>*</Text></ThemedText>
          <View style={styles.grid}>
            {allDepots.map((d) => {
              const isSelected = selectedDepots.includes(d.id);
              return (
                <TouchableOpacity 
                  key={d.id} 
                  style={[
                    styles.chip, 
                    { borderColor: isSelected ? primaryColor : '#E2E8F0', gap: 8 }, 
                    isSelected && { backgroundColor: hexToRgba(primaryColor, 0.1) }
                  ]}
                  onPress={() => {
                    setSelectedDepots(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id]);
                    setErrors(prev => ({ ...prev, depots: '' }));
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"} 
                    size={18} 
                    color={isSelected ? primaryColor : '#94A3B8'} 
                  />
                  <ThemedText style={[styles.chipText, { color: isSelected ? primaryColor : '#475569' }]}>
                    {d.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.depots && <Text style={[styles.errorText, { marginTop: 12 }]}>{errors.depots}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: primaryColor }, isSaving && { opacity: 0.7 }]} 
          onPress={handleAddProduct}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveText}>Tambahkan Produk Baru</ThemedText>}
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  
  cardModern: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16, letterSpacing: -0.3 },
  
  label: { fontSize: 13, color: '#475569', marginBottom: 8, fontWeight: '700', marginTop: 16 },
  labelFirst: { marginTop: 0 },
  asterisk: { color: '#EF4444' },
  
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '500' },
  
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  deleteButton: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bold: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  hint: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },
  
  dayLabel: { fontSize: 13, marginBottom: 6, fontWeight: '700', color: '#475569' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, backgroundColor: '#FFFFFF' },
  chipText: { fontSize: 13, fontWeight: '700' },
  
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'flex-start' },
  addButtonText: { fontWeight: '700', fontSize: 14 },
  
  saveButton: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginTop: 16 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});