import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Inbox } from "lucide-react-native";

export default function InboxScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 justify-center items-center px-6">
        <Inbox
          size={48}
          className="text-muted-foreground mb-4"
          color="#a1a1aa"
        />
        <Text variant="h3" className="mb-2">
          Inbox
        </Text>
        <Text variant="muted" className="text-center">
          Your messages and notifications will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
