import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeStore } from '@/store/themeStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function RegisterScreen() {
  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
  const params = useLocalSearchParams<{ companySlug: string }>(); 
  const router = useRouter();
  
  const { colors, logoUrl, setBranding } = useThemeStore();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State baru untuk sukses
  const [companyName, setCompanyName] = useState('Workspace');

  useEffect(() => {
    if(!params.companySlug) return;
      const loadPublicBranding = async (slug: string) => {
        try {
          const response = await fetch(`http://${api_address}:3000/auth/branding/${slug}`);
          const result = await response.json();

          if (response.ok && result.data) {
            setCompanyName(result.data.name);

            await setBranding({
              logoUrl: result.data.logoUrl,
              colorPrimary: result.data.colorPrimary,
              colorSecondary: result.data.colorSecondary,
              colorTertiary: result.data.colorTertiary,
            });
          }
        } catch (error) {
          console.log("Gagal memuat branding:", error);
        }
      };

      loadPublicBranding(params.companySlug);
    }, [params.companySlug]);

  async function handleRegister() {
    if (!params.companySlug) return;

    if (!fullName || !phoneNumber || !birthDate || !username || !password) {
      setErrorMessage('Semua kolom harus diisi.');
      setSuccessMessage('');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`http://${api_address}:3000/auth/${params.companySlug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName, 
          phoneNumber, 
          birthDate, 
          username, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Pendaftaran berhasil!');
        setFullName('');
        setPhoneNumber('');
        setBirthDate('');
        setUsername('');
        setPassword('');

        // Beri jeda 2 detik agar teks terbaca, lalu pindah ke halaman login
        setTimeout(() => {
          router.push(`/${params.companySlug}`);
        }, 2500);

      } else {
        setErrorMessage(data.message || 'Gagal mendaftar akun.');
      }
    } catch (error) {
      setErrorMessage('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
              ) : (
                <IconSymbol name="building.2.fill" size={48} color={colors.primary} />
              )}
            </View>

            <ThemedText style={styles.brandTitle}>DAFTAR AKUN BARU</ThemedText>
            <ThemedText style={styles.title}>{companyName}</ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>NAMA LENGKAP</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={setFullName}
                value={fullName}
                placeholder="Misal: Budi Santoso"
                placeholderTextColor="#A0A0A0"
                editable={!successMessage ? true : false} // Kunci input kalau sukses
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>TANGGAL LAHIR</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={setBirthDate}
                value={birthDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#A0A0A0"
                editable={!successMessage ? true : false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>NO. TELEPON</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={setPhoneNumber}
                value={phoneNumber}
                placeholder="0812345..."
                keyboardType="phone-pad"
                placeholderTextColor="#A0A0A0"
                editable={!successMessage ? true : false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>NAMA PENGGUNA</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={setUsername}
                value={username}
                placeholder="nama_pengguna"
                autoCapitalize="none"
                placeholderTextColor="#A0A0A0"
                editable={!successMessage ? true : false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>KATA SANDI</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={setPassword}
                value={password}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor="#A0A0A0"
                editable={!successMessage ? true : false}
              />
            </View>
            
            {/* Box Error */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
              </View>
            ) : null}

            {/* Box Sukses Baru */}
            {successMessage ? (
              <View style={styles.successContainer}>
                <ThemedText style={styles.successText}>{successMessage}</ThemedText>
                <ThemedText style={{fontSize: 12, color: '#15803D', marginTop: 4}}>Mengalihkan ke halaman login...</ThemedText>
              </View>
            ) : null}

            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              !successMessage && (
                <TouchableOpacity 
                  style={[styles.loginButton, { backgroundColor: colors.primary }]} 
                  onPress={handleRegister} 
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.loginButtonText}>Daftar</ThemedText>
                </TouchableOpacity>
              )
            )}

            <View style={styles.loginLinkContainer}>
              <ThemedText style={styles.loginLinkText}>Sudah punya akun? </ThemedText>
              <TouchableOpacity onPress={() => router.push(`/${params.companySlug}`)}>
                <ThemedText style={[styles.loginLinkHighlight, { color: colors.primary }]}>Masuk di sini</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>© 2026 {companyName}</ThemedText>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 40 },
  headerSection: { marginBottom: 40 },
  
  logoWrapper: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  logo: { 
    width: 100, 
    height: 50,
  },

  brandTitle: { fontSize: 11, fontWeight: '700', color: '#636E72', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3436', letterSpacing: -0.5 },
  
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', color: '#2D3436', marginBottom: 8, letterSpacing: 1 },
  input: { height: 45, borderBottomWidth: 2, borderColor: '#DFE6E9', paddingHorizontal: 4, fontSize: 16, color: '#2D3436' },
  
  errorContainer: { backgroundColor: '#FFF5F5', padding: 12, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#FF7675' },
  errorText: { color: '#D63031', fontSize: 13, fontWeight: '600' },
  
  // success
  successContainer: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#22C55E' },
  successText: { color: '#15803D', fontSize: 14, fontWeight: '700' },
  
  loginButton: { height: 54, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  loaderContainer: { height: 54, justifyContent: 'center', alignItems: 'center' },
  
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginLinkText: { fontSize: 13, color: '#636E72' },
  loginLinkHighlight: { fontSize: 13, fontWeight: '700' },

  footer: { marginTop: 60, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#B2BEC3' }
});