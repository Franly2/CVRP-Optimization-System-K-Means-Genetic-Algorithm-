import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isLoading: isAuthLoading, checkAuth } = useAuthStore();
  
  const { isThemeLoading, loadTheme, colors } = useThemeStore(); 

  // pannggil lanngsung 2 2 nya secara bersamaan saat aplikasi baru dibuka
  useEffect(() => { 
    checkAuth(); 
    loadTheme();
  }, []);

  const isAppLoading = isAuthLoading || isThemeLoading;

  useEffect(() => {
  if (isAppLoading) return;

  // halaman mana saja yang WAJIB LOGIN
  const isProtectedRoute = 
    pathname.includes('dashboard') || 
    pathname.includes('(tabs)') || 
    pathname.includes('tenant') ||
    pathname.includes('depot') ||
    pathname.includes('human') ||
    pathname.includes('customer') ||
    pathname.includes('product') ||
    pathname.includes('settings');

  if (!token) {
    if (isProtectedRoute) {
      router.replace('/');
    }
  } 
  else {
    if (!isProtectedRoute) {
      router.replace('/dashboard');
    }
  }
}, [token, isAppLoading, pathname]);

  if (isAppLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary || "#4991CC"} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="[companySlug]" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}