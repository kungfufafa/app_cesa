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

const isServerError = (error: unknown) =>
  axios.isAxiosError(error) &&
  typeof error.response?.status === 'number' &&
  error.response.status >= 500;

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

type AuthErrorType =
  | 'validation'
  | 'auth'
  | 'network'
  | 'server'
  | 'rate_limit'
  | 'unknown';

type AuthError = {
  type: AuthErrorType;
  status?: number;
  messages?: string[];
  message?: string;
};

type SignInResult = { ok: true } | { ok: false; error: AuthError };

const extractApiErrorMessages = (error: unknown): string[] => {
  if (!axios.isAxiosError(error)) return [];
  const data = error.response?.data;
  if (!data || typeof data !== 'object') return [];

  const payload = data as ApiErrorPayload;
  const messages: string[] = [];

  if (payload.errors && typeof payload.errors === 'object' && !Array.isArray(payload.errors)) {
    Object.values(payload.errors).forEach((rawMessages) => {
      const values = Array.isArray(rawMessages) ? rawMessages : [String(rawMessages)];
      values.forEach((value) => messages.push(String(value)));
    });
  }

  if (messages.length === 0 && payload.message) {
    messages.push(String(payload.message));
  }

  return Array.from(new Set(messages));
};

const toAuthErrorMessages = (authError: AuthError): string[] => {
  if (authError.messages && authError.messages.length > 0) {
    return authError.messages;
  }
  if (authError.message) return [authError.message];
  return ['Login gagal. Coba lagi.'];
};

const buildAuthError = (error: unknown): AuthError => {
  if (isNetworkError(error)) {
    return { type: 'network', message: 'Tidak bisa terhubung ke server. Coba lagi.' };
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessages = extractApiErrorMessages(error);

    if (status === 401 || status === 403) {
      return {
        type: 'auth',
        status,
        messages: apiMessages.length > 0 ? apiMessages : ['Email atau password salah'],
      };
    }

    if (status === 400 || status === 422) {
      return {
        type: 'validation',
        status,
        messages: apiMessages.length > 0 ? apiMessages : ['Data tidak valid. Coba lagi.'],
      };
    }

    if (status === 429) {
      return {
        type: 'rate_limit',
        status,
        message: 'Terlalu banyak percobaan. Coba lagi nanti.',
      };
    }

    if (isServerError(error)) {
      return {
        type: 'server',
        status,
        message: 'Server sedang bermasalah. Coba lagi nanti.',
      };
    }

    if (apiMessages.length > 0) {
      return { type: 'unknown', status, messages: apiMessages };
    }
  }

  if (error instanceof Error && !axios.isAxiosError(error) && error.message) {
    return { type: 'unknown', message: error.message };
  }

  return { type: 'unknown', message: 'Login gagal. Coba lagi.' };
};

const logAuthError = (error: unknown, authError: AuthError) => {
  if (!axios.isAxiosError(error)) {
    console.error('Login failed', error);
    return;
  }

  const status = error.response?.status;
  if (status && [400, 401, 403, 422, 429].includes(status)) {
    if (__DEV__) {
      console.info('Login failed', {
        status,
        type: authError.type,
        errors: toAuthErrorMessages(authError),
      });
    }
    return;
  }

  const data = error.response?.data;
  const serverMessage =
    data && typeof data === 'object' && 'message' in data
      ? (data as ApiErrorPayload).message
      : undefined;

  console.error('Login failed', {
    status,
    url: error.config?.url,
    method: error.config?.method,
    message: error.message,
    serverMessage,
    errors: toAuthErrorMessages(authError),
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
  signIn: (credentials: LoginCredentials) => Promise<SignInResult>;
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
      const netState = await NetInfo.fetch();
      if (isOfflineState(netState.isConnected, netState.isInternetReachable)) {
        return {
          ok: false,
          error: { type: 'network', message: 'Tidak bisa terhubung ke server. Coba lagi.' },
        };
      }

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
        isLoading: false,
      });
      return { ok: true };
    } catch (error) {
      const authError = buildAuthError(error);
      logAuthError(error, authError);
      return { ok: false, error: authError };
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
