import * as ExpoSecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getWebStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const shouldUseWebStorage = () =>
  Platform.OS === "web" && getWebStorage() !== null;

export const getItemAsync = async (key: string): Promise<string | null> => {
  if (shouldUseWebStorage()) {
    const storage = getWebStorage();
    return storage?.getItem(key) ?? null;
  }

  return ExpoSecureStore.getItemAsync(key);
};

export const setItemAsync = async (
  key: string,
  value: string
): Promise<void> => {
  if (shouldUseWebStorage()) {
    const storage = getWebStorage();
    storage?.setItem(key, value);
    return;
  }

  await ExpoSecureStore.setItemAsync(key, value);
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  if (shouldUseWebStorage()) {
    const storage = getWebStorage();
    storage?.removeItem(key);
    return;
  }

  await ExpoSecureStore.deleteItemAsync(key);
};
