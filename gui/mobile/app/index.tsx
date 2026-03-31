import { useAuthStore } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { token } = useAuthStore(); // Cek apakah sudah login

  useEffect(() => {
    const checkLastTenant = async () => {
      try {
        // 1. Cek memori browser (LocalStorage)
        const savedSlug = await AsyncStorage.getItem('lastVisitedTenant');
        
        if (savedSlug) {
          setTargetSlug(savedSlug);
        }
      } catch (e) {
        console.error("Gagal mengambil tenant terakhir", e);
      } finally {
        setIsChecking(false);
      }
    };
    checkLastTenant();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#2D3436" />
      </View>
    );
  }

  // LOGIKA REDIRECT PINTAR:
  
  // A. Jika sudah login, langsung ke dashboard
  if (token) {
    return <Redirect href="/dashboard" />;
  }

  // B. Jika belum login tapi ada memori tenant terakhir, lempar ke portal tenant tersebut
  if (targetSlug) {
    return <Redirect href={`/${targetSlug}`} />;
  }

  // C. Jika benar-benar bersih (user baru/clear cache), baru ke welcome screen
  return <Redirect href="/welcome-screen" />; 
}