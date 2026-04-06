import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const api_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
  const { companySlug } = useLocalSearchParams(); 
  
  const loginZustand = useAuthStore((state) => state.login);
  const { colors, logoUrl, setBranding } = useThemeStore();

  const [username, onChangeUsername] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false); 
  const [errorMessage, setErrorMessage] = React.useState('');
  const [companyName, setCompanyName] = useState('Workspace');

  useEffect(() => {
    if(!companySlug) return;
      const loadPublicBranding = async (slug: string) => {
        try {
          const response = await fetch(`http://${api_address}:3000/auth/branding/${slug}`);
          const result = await response.json();

          if (response.ok && result.data) {
            setCompanyName(result.data.name);

            // await setBranding({
            //   ...result.data.branding
            // });

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

      loadPublicBranding(companySlug.toString());
    }, [companySlug]);

  async function login() {
    const activeSlug = companySlug?.toString() || '';
    if (!activeSlug) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`http://${api_address}:3000/auth/${activeSlug}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // simpan ke storage slug  lastvisited untuk memastikan saat user buka app lagi, dia lari ke tenant yang VALID
        await AsyncStorage.setItem('lastVisitedTenant', activeSlug);
        // simpan token, role, dan username ke Zustand
        await loginZustand(data.access_token, data.role, data.username);
        // jika response login juga mengembalikan data branding, langsung set ke Zustand agar tema berubah otomatis
        if (data.branding) await setBranding(data.branding);

        //navigasi dihandle otomatis oleh _layout.tsx yang akan redirect ke dashboard kalau sudah login
      } else {
        setErrorMessage(data.message || 'Kredensial salah');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
              ) : (
                <IconSymbol name="building.2.fill" size={48} color={colors.primary} />
              )}
            </View>

            <ThemedText style={styles.brandTitle}>LOG IN</ThemedText>
            <ThemedText style={styles.title}>{companyName}</ThemedText>
            {/* <ThemedText style={styles.subtitle}>
              slug perusahaan <ThemedText style={{fontWeight: '700', color: colors.primary}}>{companySlug}</ThemedText>
            </ThemedText> */}
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>NAMA PENGGUNA</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={onChangeUsername}
                value={username}
                placeholder="nama_pengguna"
                autoCapitalize="none"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>KATA SANDI</ThemedText>
              <TextInput
                style={[styles.input, { borderBottomColor: colors.primary }]}
                onChangeText={onChangePassword}
                value={password}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor="#A0A0A0"
              />
            </View>
            
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
              </View>
            ) : null}

            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: colors.primary }]} 
                onPress={login} 
                activeOpacity={0.8}
              >
                <ThemedText style={styles.loginButtonText}>Masuk</ThemedText>
              </TouchableOpacity>
            )}
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
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 40 },
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
  subtitle: { fontSize: 14, color: '#636E72', marginTop: 8, lineHeight: 20 },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', color: '#2D3436', marginBottom: 8, letterSpacing: 1 },
  input: { height: 45, borderBottomWidth: 2, borderColor: '#DFE6E9', paddingHorizontal: 4, fontSize: 16, color: '#2D3436' },
  errorContainer: { backgroundColor: '#FFF5F5', padding: 12, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#FF7675' },
  errorText: { color: '#D63031', fontSize: 13, fontWeight: '600' },
  loginButton: { height: 54, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  loaderContainer: { height: 54, justifyContent: 'center', alignItems: 'center' },
  footer: { marginTop: 60, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#B2BEC3' }
});