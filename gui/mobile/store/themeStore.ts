  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { create } from 'zustand';
  import { DEFAULT_THEME } from '../constants/theme';

  interface ThemeState {
    colors: typeof DEFAULT_THEME.colors;
    logoUrl: string | null;
    isThemeLoading: boolean;

    setBranding: (branding: { 
      colorPrimary?: string | null; 
      colorSecondary?: string | null; 
      colorTertiary?: string | null; 
      logoUrl?: string | null 
    }) => Promise<void>;
    resetTheme: () => Promise<void>;
    loadTheme: () => Promise<void>;
  }

  export const useThemeStore = create<ThemeState>((set) => ({
    colors: DEFAULT_THEME.colors,
    logoUrl: DEFAULT_THEME.logoUrl,
    isThemeLoading: true,

    setBranding: async (branding) => {
      const newColors = {
        primary: branding.colorPrimary || DEFAULT_THEME.colors.primary,
        secondary: branding.colorSecondary || DEFAULT_THEME.colors.secondary,
        tertiary: branding.colorTertiary || DEFAULT_THEME.colors.tertiary,
        background: DEFAULT_THEME.colors.background,  //tetap
        text: DEFAULT_THEME.colors.text,          //tetap
      };
      const newLogoUrl = branding.logoUrl || null;

      // Simpan ke AsyncStorage secara manual (seperti authStore)
      await AsyncStorage.setItem('tenantColors', JSON.stringify(newColors));
      if (newLogoUrl) {
        await AsyncStorage.setItem('tenantLogo', newLogoUrl);
      } else {
        await AsyncStorage.removeItem('tenantLogo'); // Hapus kalau nggak ada logo
      }

      // 2. Update state Zustand
      set({ colors: newColors, logoUrl: newLogoUrl });
    },

    resetTheme: async () => {
      // Dijalankan saat Logout
      await AsyncStorage.multiRemove(['tenantColors', 'tenantLogo']);
      set({ colors: DEFAULT_THEME.colors, logoUrl: DEFAULT_THEME.logoUrl });
    },

    loadTheme: async () => {
      // Dijalankan saat aplikasi pertama kali dibuka (bersamaan dengan checkAuth)
      try {
        const storedColors = await AsyncStorage.getItem('tenantColors');
        const storedLogo = await AsyncStorage.getItem('tenantLogo');

        if (storedColors) {
          set({ 
            colors: JSON.parse(storedColors), 
            logoUrl: storedLogo, 
            isThemeLoading: false 
          });
        } else {
          set({ isThemeLoading: false });
        }
      } catch (error) {
        set({ isThemeLoading: false });
      }
    },
  }));