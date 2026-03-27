import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore'; // Sesuaikan path-nya

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isLoading, checkAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (isLoading) return;

    const isLoginScreen = pathname === '/';

    if (!token && !isLoginScreen) {
      router.replace('/');
    } else if (token && isLoginScreen) {
      router.replace('/dashboard'); 
    }
  }, [token, isLoading, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4991CC" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}