import React from "react";
import { View } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

export function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const isOffline =
    netInfo.isConnected === false || netInfo.isInternetReachable === false;

  if (!isOffline) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 z-50 px-4"
      style={{ top: insets.top }}
    >
      <View className="bg-destructive rounded-full py-2 px-4 items-center shadow-sm self-center">
        <Text className="text-destructive-foreground text-xs font-medium">
          Koneksi terputus. Kamu sedang offline.
        </Text>
      </View>
    </View>
  );
}
