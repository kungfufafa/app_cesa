import { create } from 'zustand';
import axios from 'axios';
import { setAuthToken, setOnUnauthorized } from '../services/api';
import { login, LoginCredentials, AuthResponse, logout } from '../services/auth';
import * as SecureStore from '../lib/secure-storage';

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
    const found = candidates.find(
      (value): value is string => typeof value === 'string' && value.length > 0
    );
    return found ?? null;
  }
  return null;
};

const isServerError = (error: unknown) =>
  axios.isAxiosError(error) &&
  typeof error.response?.status === 'number' &&
  error.response.status >= 500;

const isNetworkError = (error: unknown) =>
  axios.isAxiosError(error) && !error.response;

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
  if (!__DEV__) return;

  if (!axios.isAxiosError(error)) {
    console.warn('Login failed', error);
    return;
  }

  const status = error.response?.status;
  if (status && [400, 401, 403, 422, 429].includes(status)) {
    console.info('Login failed', {
      status,
      type: authError.type,
      errors: toAuthErrorMessages(authError),
    });
    return;
  }

  const data = error.response?.data;
  const serverMessage =
    data && typeof data === 'object' && 'message' in data
      ? (data as ApiErrorPayload).message
      : undefined;

  console.warn('Login failed', {
    status,
    url: error.config?.url,
    method: error.config?.method,
    message: error.message,
    serverMessage,
    errors: toAuthErrorMessages(authError),
  });
};

const readCachedUser = async () => {
  let raw: string | null = null;
  try {
    raw = await SecureStore.getItemAsync('user');
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse['user'];
  } catch {
    return null;
  }
};

const clearStoredAuth = async () => {
  try {
    await SecureStore.deleteItemAsync('token');
  } catch {}

  try {
    await SecureStore.deleteItemAsync('user');
  } catch {}

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
      if (__DEV__) console.warn('Logout request failed', error);
    } finally {
      await clearStoredAuth();
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
  restoreSession: async () => {
    try {
      const [storedToken, cachedUser] = await Promise.all([
        SecureStore.getItemAsync('token'),
        readCachedUser(),
      ]);

      if (!storedToken || !cachedUser) {
        await clearStoredAuth();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      setAuthToken(storedToken);
      set({ token: storedToken, user: cachedUser, isAuthenticated: true, isLoading: false });
    } catch (e) {
      if (__DEV__) console.warn('Failed to restore token', e);
      await clearStoredAuth();
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Auto-logout when API returns 401
setOnUnauthorized(() => {
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false, isLoading: false });
});
