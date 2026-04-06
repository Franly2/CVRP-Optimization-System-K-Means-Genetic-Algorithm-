import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
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

interface ShiftOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  id?: string;
  dayOfWeek: number;
  menuDetails: string;
}

interface ProductImage {
  url: string;
  isMain: boolean;
  order: number;
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
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
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [prodRes, depotRes, shiftRes] = await Promise.all([
        fetch(`http://${api_address}:3000/catalog/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://${api_address}:3000/depot`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://${api_address}:3000/catalog/shifts`, { 
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const prodJson = await prodRes.json();
      const depotJson = await depotRes.json();
      const shiftJson = await shiftRes.json();

      if (prodRes.ok) {
        const p = prodJson.data;
        setName(p.name);
        setPrice(p.price.toString());
        setWeight(p.weightEst.toString());
        setVolume(p.volumeEst.toString());
        setIsSub(p.isSubscription);
        setDuration(p.durationDays?.toString() || '');
        
        setAllDepots(depotJson.data || []);
        setSelectedDepots(p.availableAt?.map((d: any) => d.id) || []);

        if (shiftRes.ok) setAllShifts(shiftJson.data || []);
        setSelectedShifts(p.availableShifts?.map((s: any) => s.id) || []);
        setSchedules(p.schedules || []);
        
        const main = p.images?.find((img: any) => img.isMain);
        const others = p.images?.filter((img: any) => !img.isMain).map((img: any) => img.url);
        setMainImageUrl(main?.url || '');
        setOtherImageUrls(others?.length > 0 ? others : ['']);
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
      const imagesPayload: ProductImage[] = [];
      if (mainImageUrl) {
        imagesPayload.push({ url: mainImageUrl, isMain: true, order: 0 });
      }
      otherImageUrls.forEach((url, index) => {
        if (url.trim() !== '') {
          imagesPayload.push({ url: url, isMain: false, order: index + 1 });
        }
      });

      const payload = {
        name,
        price: Number(price),
        weightEst: parseFloat(weight.toString().replace(',', '.')),
        volumeEst: parseFloat(volume.toString().replace(',', '.')),
        isSubscription: isSub,
        durationDays: isSub ? Number(duration) : null,
        depotIds: selectedDepots,
        shiftIds: selectedShifts,
        schedules: isSub ? schedules.filter(s => s.menuDetails.trim() !== '').map(s => ({
          dayOfWeek: s.dayOfWeek,
          menuDetails: s.menuDetails
        })) : [],
        images: imagesPayload
      };

      const response = await fetch(`http://${api_address}:3000/catalog/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Produk', headerShown: true }} />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.section}>
            <ThemedText style={styles.label}>URL Foto Utama</ThemedText>
            <TextInput 
                style={styles.input} 
                value={mainImageUrl} 
                onChangeText={setMainImageUrl} 
                placeholder="https://image-url.com/main.jpg" 
            />
            
            <ThemedText style={[styles.label, { marginTop: 10 }]}>URL Foto Lainnya (Gallery)</ThemedText>
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
                  placeholder="https://image-url.com/other.jpg" 
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
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>Tambah Foto</ThemedText>
            </TouchableOpacity>
          </View>

          {/* --- Detail Section --- */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Nama Produk</ThemedText>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <ThemedText style={styles.label}>Harga (Rp)</ThemedText>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

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

          {/* --- Shift Section --- */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Jam Pengiriman (Shift)</ThemedText>
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

          {/* --- Subscription Section --- */}
          <View style={[styles.section, styles.subRow]}>
            <View><ThemedText style={styles.bold}>Produk Langganan?</ThemedText></View>
            <Switch value={isSub} onValueChange={setIsSub} trackColor={{ true: colors.primary }} />
          </View>

          {isSub && (
            <View style={styles.section}>
              <ThemedText style={styles.label}>Durasi (Hari)</ThemedText>
              <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />
              <ThemedText style={[styles.label, { marginTop: 10 }]}>Jadwal Menu</ThemedText>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <View key={day} style={{ marginBottom: 10 }}>
                   <ThemedText style={{fontSize: 12, marginBottom: 4, fontWeight: 'bold'}}>Hari {day}</ThemedText>
                   <TextInput 
                    style={[styles.input, {marginBottom: 0}]} 
                    placeholder={`Menu hari ${day}`} 
                    value={schedules.find(s => s.dayOfWeek === day)?.menuDetails || ''}
                    onChangeText={(txt) => {
                        const existing = schedules.find(s => s.dayOfWeek === day);
                        if (existing) setSchedules(schedules.map(s => s.dayOfWeek === day ? { ...s, menuDetails: txt } : s));
                        else setSchedules([...schedules, { dayOfWeek: day, menuDetails: txt }]);
                    }}
                    />
                </View>
              ))}
            </View>
          )}

          {/* --- Depot Section --- */}
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
                    onPress={() => toggleDepot(d.id)}
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
            onPress={handleUpdate}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveText}>Simpan Perubahan</ThemedText>}
          </TouchableOpacity>

        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  row: { flexDirection: 'row', gap: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', fontSize: 16, marginBottom: 10 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bold: { fontSize: 16, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: 'bold' },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});