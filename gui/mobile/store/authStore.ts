import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  role: string | null;
  username: string | null;
  isLoading: boolean;
  
  login: (token: string, role: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  username: null,
  isLoading: true, // cek auth saat aplikasi pertama kali dibuka

  login: async (token, role, username) => {
    await AsyncStorage.multiSet([
      ['userToken', token],
      ['userRole', role],
      ['userName', username],
    ]);
    set({ token, role, username });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userName']);
    set({ token: null, role: null, username: null });
  },

  checkAuth: async () => {
    try {
      const [token, role, username] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userRole'),
        AsyncStorage.getItem('userName'),
      ]);
      set({ token, role, username, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));