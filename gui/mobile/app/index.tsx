import { useAuthStore } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { token } = useAuthStore(); 

  useEffect(() => {
    const checkLastTenant = async () => {
      try {
        const savedSlug = await AsyncStorage.getItem('lastVisitedTenant');
        if (savedSlug) setTargetSlug(savedSlug);
      } catch (e) {
        console.error("Gagal mengambil tenant terakhir", e);
      } finally {
        setIsChecking(false);
      }
    };
    checkLastTenant();
  }, []);

  // Tunggu semua proses background di Store selesai juga
  // agar keputusan Redirect diambil dengan data yang sudah final
  if (isChecking) {
    return null;
  }
  
  if (token) {
    return <Redirect href="/dashboard" />;
  }

  if (targetSlug) {
    return <Redirect href={`/${targetSlug}`} />;
  }

  return <Redirect href="/welcome-screen" />;
}