import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';
import { login, LoginCredentials, AuthResponse } from '../services/auth';

interface AuthState {
  token: string | null;
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async (credentials) => {
    try {
      const response = await login(credentials);
      await SecureStore.setItemAsync('token', response.token);
      setAuthToken(response.token);
      set({ 
        token: response.token, 
        user: response.user, 
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync('token');
    setAuthToken(null);
    set({ token: null, user: null, isAuthenticated: false });
  },
  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        setAuthToken(token);
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        setAuthToken(null);
        set({ token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      console.error('Failed to restore token', e);
      setAuthToken(null);
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
