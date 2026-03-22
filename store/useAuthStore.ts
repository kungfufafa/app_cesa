import { create } from 'zustand';
import axios from 'axios';
import { setAuthToken, setOnUnauthorized } from '../services/api';
import {
  getCurrentUser,
  login,
  LoginCredentials,
  AuthResponse,
  logout,
  logoutAll,
} from '../services/auth';
import * as SecureStore from '../lib/secure-storage';
import { useAuthBottomSheet } from './useAuthBottomSheet';

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

const isUnauthorizedError = (error: unknown) =>
  axios.isAxiosError(error) &&
  [401, 403].includes(error.response?.status ?? 0);

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

const normalizeAuthMessage = (value: string) => value.trim().toLowerCase();

const isInactiveAccountMessage = (value: string) => {
  const normalized = normalizeAuthMessage(value);
  return normalized.includes('inactive') || normalized.includes('nonaktif');
};

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

const readRetryAfterSeconds = (error: unknown): number | null => {
  if (!axios.isAxiosError(error)) return null;

  const retryAfterHeader = error.response?.headers?.['retry-after'];
  if (!retryAfterHeader) return null;

  const rawValue = Array.isArray(retryAfterHeader)
    ? retryAfterHeader[0]
    : String(retryAfterHeader);
  const seconds = Number(rawValue);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds;
  }

  const retryDate = new Date(rawValue);
  if (Number.isNaN(retryDate.getTime())) {
    return null;
  }

  const diffInSeconds = Math.ceil((retryDate.getTime() - Date.now()) / 1000);
  return diffInSeconds > 0 ? diffInSeconds : null;
};

const formatRetryAfterMessage = (seconds: number | null) => {
  if (!seconds) {
    return 'Terlalu banyak percobaan. Coba lagi nanti.';
  }

  if (seconds < 60) {
    return `Terlalu banyak percobaan. Coba lagi dalam ${seconds} detik.`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`;
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
      const hasInactiveMessage = apiMessages.some(isInactiveAccountMessage);
      return {
        type: hasInactiveMessage ? 'auth' : 'validation',
        status,
        messages:
          apiMessages.length > 0
            ? apiMessages
            : [hasInactiveMessage ? 'Akun Anda sedang nonaktif.' : 'Data tidak valid. Coba lagi.'],
      };
    }

    if (status === 429) {
      return {
        type: 'rate_limit',
        status,
        message: formatRetryAfterMessage(readRetryAfterSeconds(error)),
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        type: 'network',
        status,
        message: 'Permintaan login timeout. Coba lagi sebentar lagi.',
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

const isActiveUser = (user: AuthResponse['user'] | null | undefined) => user?.is_active !== false;

const persistAuthSession = async (
  token: string,
  user: AuthResponse['user']
) => {
  try {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    return true;
  } catch (error) {
    if (__DEV__) console.warn('Failed to persist auth session', error);
    return false;
  }
};

const persistCachedUser = async (user: AuthResponse['user']) => {
  try {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    return true;
  } catch (error) {
    if (__DEV__) console.warn('Failed to persist cached user', error);
    return false;
  }
};

interface AuthState {
  token: string | null;
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authNotice: string | null;
  signIn: (credentials: LoginCredentials) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearAuthNotice: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authNotice: null,
  signIn: async (credentials) => {
    try {
      const response = await login(credentials);
      const token = extractTokenString(response.token);
      if (!token) {
        throw new Error('Login response missing token string');
      }
      setAuthToken(token);
      const user = await getCurrentUser(token).catch(() => response.user);
      if (!isActiveUser(user)) {
        await clearStoredAuth();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authNotice: 'Akun Anda sedang nonaktif. Hubungi admin untuk bantuan.',
        });
        return {
          ok: false,
          error: {
            type: 'auth',
            message: 'Akun Anda sedang nonaktif. Hubungi admin untuk bantuan.',
          },
        };
      }
      const isPersisted = await persistAuthSession(token, user);
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        authNotice: isPersisted
          ? null
          : 'Login berhasil, tetapi sesi ini tidak bisa disimpan permanen di perangkat.',
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
      set({ token: null, user: null, isAuthenticated: false, authNotice: null });
    }
  },
  signOutAll: async () => {
    try {
      await logoutAll();
      await clearStoredAuth();
      set({ token: null, user: null, isAuthenticated: false, authNotice: null });
    } catch (error) {
      if (__DEV__) console.warn('Logout all request failed', error);
      throw error;
    }
  },
  refreshCurrentUser: async () => {
    const token = get().token;
    if (!token) {
      throw new Error('Sesi login tidak tersedia.');
    }

    const freshUser = await getCurrentUser(token);
    if (!isActiveUser(freshUser)) {
      await clearStoredAuth();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authNotice: 'Akun Anda sedang nonaktif. Hubungi admin untuk bantuan.',
      });
      throw new Error('Akun Anda sedang nonaktif. Hubungi admin untuk bantuan.');
    }

    const isPersisted = await persistCachedUser(freshUser);
    set({
      token,
      user: freshUser,
      isAuthenticated: true,
      isLoading: false,
      authNotice: isPersisted
        ? null
        : 'Data akun berhasil diperbarui, tetapi cache lokal perangkat gagal disimpan.',
    });
  },
  restoreSession: async () => {
    try {
      const [storedToken, cachedUser] = await Promise.all([
        SecureStore.getItemAsync('token'),
        readCachedUser(),
      ]);

      if (!storedToken) {
        await clearStoredAuth();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false, authNotice: null });
        return;
      }

      setAuthToken(storedToken);
      try {
        const freshUser = await getCurrentUser(storedToken);
        if (!isActiveUser(freshUser)) {
          await clearStoredAuth();
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authNotice: 'Akun Anda sedang nonaktif. Hubungi admin untuk bantuan.',
          });
          return;
        }
        const isPersisted = await persistCachedUser(freshUser);
        set({
          token: storedToken,
          user: freshUser,
          isAuthenticated: true,
          isLoading: false,
          authNotice: isPersisted
            ? null
            : 'Sesi aktif dipulihkan, tetapi cache lokal perangkat gagal diperbarui.',
        });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await clearStoredAuth();
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authNotice: 'Sesi login Anda telah berakhir. Silakan masuk lagi.',
          });
          return;
        }

        if (!cachedUser) {
          await clearStoredAuth();
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authNotice: 'Gagal memulihkan sesi login. Silakan masuk lagi.',
          });
          return;
        }

        set({
          token: storedToken,
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
          authNotice: 'Menggunakan data akun terakhir karena server sedang tidak dapat dijangkau.',
        });
      }
    } catch (e) {
      if (__DEV__) console.warn('Failed to restore token', e);
      await clearStoredAuth();
      set({ token: null, user: null, isAuthenticated: false, isLoading: false, authNotice: null });
    }
  },
  clearAuthNotice: () => set({ authNotice: null }),
}));

// Auto-logout when API returns 401
setOnUnauthorized(() => {
  useAuthStore.setState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    authNotice: 'Sesi login Anda telah berakhir. Silakan masuk lagi.',
  });
  useAuthBottomSheet.getState().open();
});
