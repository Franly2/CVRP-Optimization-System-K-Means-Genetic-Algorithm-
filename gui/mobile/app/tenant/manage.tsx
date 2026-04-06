import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ManageTenantScreen() {
  const token = useAuthStore((state) => state.token);
  const { colors, logoUrl, setBranding, isThemeLoading } = useThemeStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [companyName, setCompanyName] = useState(''); 
  const [companyIndustry, setCompanyIndustry] = useState(''); 

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    industry: '',
    colorPrimary: '',
    colorSecondary: '',
    colorTertiary: '',
    logoUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;

  const fetchBranding = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const response = await fetch(`http://${api_address}:3000/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok) {
        setCompanyName(result.data.name);
        setCompanyIndustry(result.data.industry || 'Umum');
        
        await setBranding({
          colorPrimary: result.data.colorPrimary,
          colorSecondary: result.data.colorSecondary,
          colorTertiary: result.data.colorTertiary,
          logoUrl: result.data.logoUrl,
        });

        setEditForm({
          name: result.data.name || '',
          industry: result.data.industry || '',
          colorPrimary: result.data.colorPrimary || '#1976D2',
          colorSecondary: result.data.colorSecondary || '#FFC107',
          colorTertiary: result.data.colorTertiary || '#4CAF50',
          logoUrl: result.data.logoUrl || ''
        });
      } else {
        if (showLoading) Alert.alert('Gagal', result.message);
      }
    } catch (error) {
      if (showLoading) Alert.alert('Error', 'Koneksi ke server bermasalah');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleChangeText = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const openEditModal = () => {
    setErrors({});
    setIsModalVisible(true);
  };

  const updateBranding = async () => {
    let newErrors: Record<string, string> = {};
    if (!editForm.name || String(editForm.name).trim() === '') {
      newErrors.name = 'Nama perusahaan tidak boleh kosong';
    }

    if (!editForm.industry || String(editForm.industry).trim() === '') {
      newErrors.industry = 'Industri tidak boleh kosong';
    }

    //Cek Format Warna
    const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (editForm.colorPrimary && !hexColorRegex.test(String(editForm.colorPrimary).trim())) {
      newErrors.colorPrimary = 'Warna utama harus format hex (contoh: #1976D2)';
    }
    if (editForm.colorSecondary && !hexColorRegex.test(String(editForm.colorSecondary).trim())) {
      newErrors.colorSecondary = 'Warna sekunder harus format hex (contoh: #FFC107)';
    }
    if (editForm.colorTertiary && !hexColorRegex.test(String(editForm.colorTertiary).trim())) {
      newErrors.colorTertiary = 'Warna tersier harus format hex (contoh: #4CAF50)';
    }

    // Cek Format URL Logo 
    if (editForm.logoUrl && String(editForm.logoUrl).trim() !== '') {
      try {
        new URL(String(editForm.logoUrl).trim());
      } catch (_) {
        newErrors.logoUrl = 'URL logo tidak valid';
      }
    }
    // kalo ada error, set ke state dan jangan lanjut ke API
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    setIsUpdating(true);
    setErrors({}); 
    
    try {
      const response = await fetch(`http://${api_address}:3000/tenant`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: String(editForm.name).trim(),
          industry: String(editForm.industry).trim(),
          colorPrimary: String(editForm.colorPrimary).trim(),
          colorSecondary: String(editForm.colorSecondary).trim(),
          colorTertiary: String(editForm.colorTertiary).trim(),
          logoUrl: editForm.logoUrl ? String(editForm.logoUrl).trim() : null
        }),
      });
      
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Berhasil', 'Identitas perusahaan berhasil diperbarui!');
        setIsModalVisible(false);
        fetchBranding(); 
      } else {
        // PRINT ERROR BALASAN API (ARRAY OF STRINGS)
        if (result.message && Array.isArray(result.message)) {
          let backendErrors: Record<string, string> = {};
          
          result.message.forEach((msg: string) => {
            const lowerMsg = msg.toLowerCase();
            let fieldKey = '';
            
            if (lowerMsg.includes('nama perusahaan')) fieldKey = 'name';
            else if (lowerMsg.includes('industri')) fieldKey = 'industry';
            else if (lowerMsg.includes('url logo') || lowerMsg.includes('logo')) fieldKey = 'logoUrl';
            else if (lowerMsg.includes('warna utama') || lowerMsg.includes('colorprimary')) fieldKey = 'colorPrimary';
            else if (lowerMsg.includes('warna sekunder') || lowerMsg.includes('colorsecondary')) fieldKey = 'colorSecondary';
            else if (lowerMsg.includes('warna tersier') || lowerMsg.includes('colortertiary')) fieldKey = 'colorTertiary';

            if (fieldKey) {
              // Jika field sudah punya error, gabungkan dengan baris baru (newline)
              backendErrors[fieldKey] = backendErrors[fieldKey] 
                ? `${backendErrors[fieldKey]}\n• ${msg}` 
                : `• ${msg}`;
            } else {
              Alert.alert('Validasi Server', msg); 
            }
          });

          if (Object.keys(backendErrors).length > 0) {
            setErrors(backendErrors);
          }
        } else if (typeof result.message === 'string') {
          Alert.alert('Gagal', result.message);
        } else {
          Alert.alert('Gagal', 'Terjadi kesalahan pada server');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal terhubung ke server');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  if (isThemeLoading && !companyName) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Identitas Perusahaan', headerShown: true }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.previewCard}>
          <View style={[styles.banner, { backgroundColor: colors.primary }]}>
             <ThemedText style={styles.bannerText}>Kustomisasi</ThemedText>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.logoWrapper}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
              ) : (
                <Ionicons name="business" size={40} color="#CCC" />
              )}
            </View>
            
            <ThemedText style={styles.companyNameText}>
                {companyName || 'Memuat Nama...'}
            </ThemedText>
            <ThemedText style={styles.subText}>{companyIndustry}</ThemedText>
          </View>

          <View style={styles.colorPalette}>
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: colors.primary }]} />
              <ThemedText style={styles.colorLabel}>Utama</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: colors.secondary }]} />
              <ThemedText style={styles.colorLabel}>Sekunder</ThemedText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorCircle, { backgroundColor: colors.tertiary }]} />
              <ThemedText style={styles.colorLabel}>Tersier</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => fetchBranding(true)} disabled={isRefreshing}>
            <Ionicons name="sync-outline" size={22} color={colors.primary} />
            <ThemedText style={styles.menuText}>Sinkronisasi Branding</ThemedText>
            {isRefreshing ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="chevron-forward" size={18} color="#CCC" />}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
            <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
            <ThemedText style={styles.menuText}>Edit Perusahaan</ThemedText>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL FORM EDIT */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Identitas</ThemedText>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {/* === NAMA === */}
              <ThemedText style={styles.label}>Nama Perusahaan</ThemedText>
              <TextInput 
                style={[styles.input, errors.name && styles.inputError]} 
                value={editForm.name} 
                onChangeText={(txt) => handleChangeText('name', txt)} 
              />
              {errors.name ? <ThemedText style={styles.errorText}>{errors.name}</ThemedText> : null}

              {/* === INDUSTRI === */}
              <ThemedText style={styles.label}>Industri</ThemedText>
              <TextInput 
                style={[styles.input, errors.industry && styles.inputError]} 
                value={editForm.industry} 
                onChangeText={(txt) => handleChangeText('industry', txt)} 
              />
              {errors.industry ? <ThemedText style={styles.errorText}>{errors.industry}</ThemedText> : null}

              {/* === LOGO === */}
              <ThemedText style={styles.label}>URL Logo (Opsional)</ThemedText>
              <TextInput 
                style={[styles.input, errors.logoUrl && styles.inputError]} 
                value={editForm.logoUrl} 
                onChangeText={(txt) => handleChangeText('logoUrl', txt)} 
                placeholder="https://..." 
              />
              {errors.logoUrl ? <ThemedText style={styles.errorText}>{errors.logoUrl}</ThemedText> : null}

              {/* === WARNA UTAMA === */}
              <ThemedText style={styles.label}>Warna Utama (Hex)</ThemedText>
              <TextInput 
                style={[
                  styles.input, 
                  { borderLeftWidth: 10, borderLeftColor: editForm.colorPrimary || '#CCC' }, 
                  errors.colorPrimary && styles.inputError
                ]} 
                value={editForm.colorPrimary} 
                onChangeText={(txt) => handleChangeText('colorPrimary', txt)} 
                placeholder="#1976D2" 
                autoCapitalize="characters"
              />
              {errors.colorPrimary ? <ThemedText style={styles.errorText}>{errors.colorPrimary}</ThemedText> : null}

              {/* === WARNA SEKUNDER === */}
              <ThemedText style={styles.label}>Warna Sekunder (Hex)</ThemedText>
              <TextInput 
                style={[
                  styles.input, 
                  { borderLeftWidth: 10, borderLeftColor: editForm.colorSecondary || '#CCC' }, 
                  errors.colorSecondary && styles.inputError
                ]} 
                value={editForm.colorSecondary} 
                onChangeText={(txt) => handleChangeText('colorSecondary', txt)} 
                placeholder="#FFC107" 
                autoCapitalize="characters"
              />
              {errors.colorSecondary ? <ThemedText style={styles.errorText}>{errors.colorSecondary}</ThemedText> : null}

              {/* === WARNA TERSIER === */}
              <ThemedText style={styles.label}>Warna Tersier (Hex)</ThemedText>
              <TextInput 
                style={[
                  styles.input, 
                  { borderLeftWidth: 10, borderLeftColor: editForm.colorTertiary || '#CCC' }, 
                  errors.colorTertiary && styles.inputError
                ]} 
                value={editForm.colorTertiary} 
                onChangeText={(txt) => handleChangeText('colorTertiary', txt)} 
                placeholder="#4CAF50" 
                autoCapitalize="characters"
              />
              {errors.colorTertiary ? <ThemedText style={styles.errorText}>{errors.colorTertiary}</ThemedText> : null}

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={updateBranding} disabled={isUpdating}>
                {isUpdating ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.saveButtonText}>Simpan Perubahan</ThemedText>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  previewCard: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, marginBottom: 25 },
  banner: { padding: 12, alignItems: 'center' },
  bannerText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  profileInfo: { alignItems: 'center', padding: 20 },
  logoWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  logo: { width: '75%', height: '75%' },
  companyNameText: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subText: { fontSize: 13, color: '#666', marginTop: 4 },
  colorPalette: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  colorItem: { alignItems: 'center' },
  colorCircle: { width: 35, height: 35, borderRadius: 18, marginBottom: 5, borderWidth: 2, borderColor: '#FFF', elevation: 2 },
  colorLabel: { fontSize: 10, color: '#666', fontWeight: '600' },
  menuSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 10, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', gap: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#333' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6, marginTop: 12 },
  
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, color: '#333', borderWidth: 1, borderColor: '#EEE' },
  inputError: { borderColor: '#DC3545', backgroundColor: '#FFF8F8' },
  errorText: { color: '#DC3545', fontSize: 11, marginTop: 4, marginLeft: 2, lineHeight: 16 }, 
  
  saveButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 25, marginBottom: 20 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});