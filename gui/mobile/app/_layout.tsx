import { Stack, usePathname, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isLoading: isAuthLoading, checkAuth } = useAuthStore();
  
  const { isThemeLoading, loadTheme, colors } = useThemeStore(); 

  // pannggil lanngsung 2 2 nya secara barengan biar lebih cepat (bukan cek auth dulu baru load theme)
  useEffect(() => { 
    checkAuth(); 
    loadTheme();
  }, []);

  const isAppLoading = isAuthLoading || isThemeLoading;

  useEffect(() => {
    if (isAppLoading) return;

    const isProtectedRoute = 
      pathname.includes('dashboard') || 
      pathname.includes('(tabs)') || 
      pathname.includes('tenant') ||
      pathname.includes('depot') ||
      pathname.includes('human') ||
      pathname.includes('customer') ||
      pathname.includes('product') ||
      pathname.includes('settings');
    // anggap semua rute yang BUKAN Protected Route adalah area luar
    const isAuthArea = !isProtectedRoute;

    if (!token) {
      if (isProtectedRoute) {
        router.replace('/');
      }
    } 
    else {
      if (isAuthArea) {
        router.replace('/dashboard');
      }
    }
  }, [token, isAppLoading, pathname]); 

  if (isAppLoading) {
    // return (
    //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //     <ActivityIndicator size="large" color={colors.primary || "#4991CC"} />
    //   </View>
    // );
    return (
    <>
      <Head>
        <title>ORBIS</title>
        <meta name="description" content="Optimized Routing & Business Information System" />
      </Head>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="[companySlug]" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="(tabs)" /> 
      </Stack>
    </>
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