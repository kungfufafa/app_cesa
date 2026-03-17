import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useSafeNetInfo, isOfflineState } from "@/lib/netinfo";

export function OfflineBanner() {
  const netInfo = useSafeNetInfo();
  const insets = useSafeAreaInsets();
  const isOffline = isOfflineState(netInfo.isConnected, netInfo.isInternetReachable);

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
