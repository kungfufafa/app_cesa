import { Alert } from "react-native";
import * as Linking from "expo-linking";

type OpenUrlOptions = {
  fallbackTitle?: string;
  fallbackMessage?: string;
};

export async function openExternalUrl(url: string, options?: OpenUrlOptions) {
  const title = options?.fallbackTitle ?? "Tidak bisa membuka";
  const message =
    options?.fallbackMessage ??
    "Aplikasi untuk membuka tautan ini tidak tersedia di perangkat ini.";

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(title, message);
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch (error) {
    Alert.alert(title, message);
    return false;
  }
}
