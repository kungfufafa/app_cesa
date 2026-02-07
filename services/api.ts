import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Add it to your .env file (see .env.example).'
  );
}

let authToken: string | null | undefined = undefined;
let tokenLoadPromise: Promise<string | null> | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  tokenLoadPromise = null;
};

let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: (() => void) | null) => {
  onUnauthorized = callback;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (authToken === undefined) {
    if (!tokenLoadPromise) {
      tokenLoadPromise = SecureStore.getItemAsync('token');
    }
    authToken = await tokenLoadPromise;
    tokenLoadPromise = null;
  }
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
      authToken = null;
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      } catch (e) {
        if (__DEV__) console.warn('Failed to clear stored auth on 401', e);
      }
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
