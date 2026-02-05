import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { Button } from "@/components/ui/Button";

export default function InboxScreen() {
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
            <IconSymbol name="tray.fill" size={32} color="#71717a" />
          </View>
          <Text variant="h3" className="mb-2">
            Inbox
          </Text>
          <Text variant="muted" className="text-center mb-6">
            Login untuk melihat pesan dan notifikasi
          </Text>
          <Button onPress={() => openSheet()}>
            <Text className="text-primary-foreground">Login</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 justify-center items-center px-6">
        <View className="mb-4">
          <IconSymbol name="tray.fill" size={48} color="#a1a1aa" />
        </View>
        <Text variant="h3" className="mb-2">
          Inbox
        </Text>
        <Text variant="muted" className="text-center">
          Coming soon, this feature is under development.
        </Text>
      </View>
    </SafeAreaView>
  );
}
