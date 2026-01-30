import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Users } from "lucide-react-native";

export default function EmployeeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 justify-center items-center px-6">
        <Users
          size={48}
          className="text-muted-foreground mb-4"
          color="#a1a1aa"
        />
        <Text variant="h3" className="mb-2">
          Employee Directory
        </Text>
        <Text variant="muted" className="text-center">
          Find and connect with your colleagues.
        </Text>
      </View>
    </SafeAreaView>
  );
}
