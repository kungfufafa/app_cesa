import { create } from 'zustand';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';
import { login, LoginCredentials, AuthResponse, getMe, logout } from '../services/auth';

const extractTokenString = (token: AuthResponse['token']): string | null => {
  if (typeof token === 'string' && token.length > 0) {
    return token;
  }
  if (token && typeof token === 'object') {
    const record = token as Record<string, unknown>;
    const candidates = [
      record.access_token,
      record.accessToken,
      record.token,
      record.jwt,
      record.id_token,
      record.idToken,
    ];
    const found = candidates.find((value) => typeof value === 'string' && value.length > 0);
    return found ?? null;
  }
  return null;
};

const isOfflineState = (isConnected: boolean | null, isInternetReachable: boolean | null) =>
  isConnected === false || isInternetReachable === false;

const isUnauthorized = (error: unknown) =>
  axios.isAxiosError(error) &&
  (error.response?.status === 401 || error.response?.status === 403);

const isNetworkError = (error: unknown) =>
  axios.isAxiosError(error) && !error.response;

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Password',
};

const ERROR_CODE_MESSAGES: Record<string, string> = {
  'auth.failed': 'Email atau password salah',
  'validation.required': 'Wajib diisi',
  'validation.email': 'Format email tidak valid',
  'validation.min.string': 'Terlalu pendek',
  'validation.max.string': 'Terlalu panjang',
};

const normalizeApiErrorMessage = (value: string) =>
  ERROR_CODE_MESSAGES[value] ?? value;

const extractApiErrorMessages = (error: unknown): string[] => {
  if (!axios.isAxiosError(error)) return [];
  const data = error.response?.data;
  if (!data || typeof data !== 'object') return [];

  const payload = data as ApiErrorPayload;
  const messages: string[] = [];

  if (payload.errors && typeof payload.errors === 'object' && !Array.isArray(payload.errors)) {
    Object.entries(payload.errors).forEach(([field, rawMessages]) => {
      const label = FIELD_LABELS[field] ?? field;
      const values = Array.isArray(rawMessages) ? rawMessages : [String(rawMessages)];
      values.forEach((value) => {
        const text = normalizeApiErrorMessage(String(value));
        messages.push(`${label}: ${text}`);
      });
    });
  }

  if (messages.length === 0 && payload.message) {
    messages.push(normalizeApiErrorMessage(String(payload.message)));
  }

  return Array.from(new Set(messages));
};

const resolveAuthErrorMessages = (error: unknown): string[] => {
  if (isUnauthorized(error)) return ['Email atau password salah'];

  const apiMessages = extractApiErrorMessages(error);
  if (apiMessages.length > 0) return apiMessages;

  if (isNetworkError(error)) {
    return ['Tidak bisa terhubung ke server. Coba lagi.'];
  }

  if (error instanceof Error && !axios.isAxiosError(error) && error.message) {
    return [error.message];
  }

  return ['Login gagal. Coba lagi.'];
};

const logAuthError = (error: unknown, messages: string[]) => {
  if (!axios.isAxiosError(error)) {
    console.error('Login failed', error);
    return;
  }

  const data = error.response?.data;
  const serverMessage =
    data && typeof data === 'object' && 'message' in data
      ? (data as ApiErrorPayload).message
      : undefined;

  console.error('Login failed', {
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    message: error.message,
    serverMessage,
    errors: messages.length > 0 ? messages : undefined,
  });
};

const readCachedUser = async () => {
  const raw = await SecureStore.getItemAsync('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse['user'];
  } catch {
    return null;
  }
};

const clearStoredAuth = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
  setAuthToken(null);
};

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
      const token = extractTokenString(response.token);
      if (!token) {
        throw new Error('Login response missing token string');
      }
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.user));
      setAuthToken(token);
      set({ 
        token, 
        user: response.user, 
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      const messages = resolveAuthErrorMessages(error);
      logAuthError(error, messages);
      throw new Error(messages.join('\n'));
    }
  },
  signOut: async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setAuthToken(null);
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
  restoreSession: async () => {
    let storedToken: string | null = null;
    try {
      storedToken = await SecureStore.getItemAsync('token');
      if (!storedToken) {
        await clearStoredAuth();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      setAuthToken(storedToken);
      const netState = await NetInfo.fetch();
      if (isOfflineState(netState.isConnected, netState.isInternetReachable)) {
        const cachedUser = await readCachedUser();
        if (!cachedUser) {
          set({ token: storedToken, user: null, isAuthenticated: false, isLoading: false });
          return;
        }
        set({ token: storedToken, user: cachedUser, isAuthenticated: true, isLoading: false });
        return;
      }

      const user = await getMe();
      if (!user) {
        set({ token: storedToken, user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ token: storedToken, user, isAuthenticated: true, isLoading: false });
    } catch (e) {
      if (isUnauthorized(e)) {
        await clearStoredAuth();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      if (isNetworkError(e)) {
        if (!storedToken) {
          await clearStoredAuth();
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
          return;
        }
        set({ token: storedToken, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      console.error('Failed to restore token', e);
      if (!storedToken) {
        await clearStoredAuth();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      set({ token: storedToken, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
