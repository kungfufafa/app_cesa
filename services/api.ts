import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/constants/config';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Add it to your .env file (see .env.example).'
  );
}

let authToken: string | null | undefined = undefined;
let tokenInitialization: Promise<void> | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  tokenInitialization = null;
};

let onUnauthorized: (() => void) | null = null;
let isHandling401 = false;

export const setOnUnauthorized = (callback: (() => void) | null) => {
  onUnauthorized = callback;
};

const ensureTokenLoaded = async () => {
  if (authToken !== undefined) return;

  if (!tokenInitialization) {
    tokenInitialization = (async () => {
      authToken = await SecureStore.getItemAsync('token');
    })();
  }

  await tokenInitialization;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  await ensureTokenLoaded();

  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (!isHandling401) {
        isHandling401 = true;
        authToken = null;
        try {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
        } catch (e) {
          if (__DEV__) console.warn('Failed to clear stored auth on 401', e);
        }
        onUnauthorized?.();
        // Reset flag after a delay to prevent rapid-fire handling
        setTimeout(() => {
          isHandling401 = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
