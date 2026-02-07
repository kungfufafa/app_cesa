import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { EmployeeDetail } from "@/components/features/employee/EmployeeDetail";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4"
        style={{ paddingTop: insets.top, paddingBottom: 8 }}
      >
        <View className="flex-row items-center">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
            accessibilityRole="button"
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-white text-base font-semibold">
              Detail Karyawan
            </Text>
          </View>
          <View className="w-9 h-9" />
        </View>
      </LinearGradient>

      {!isAuthenticated ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
            <IconSymbol name="person.2.fill" size={32} color="#71717a" />
          </View>
          <Text variant="h3" className="mb-2">
            Detail Karyawan
          </Text>
          <Text variant="muted" className="text-center mb-6">
            Login untuk melihat detail karyawan
          </Text>
          <Button onPress={() => openSheet()}>
            <Text className="text-primary-foreground">Login</Text>
          </Button>
        </View>
      ) : !id ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text variant="h4" className="mb-2">Data tidak ditemukan</Text>
          <Text variant="muted" className="text-center">ID karyawan tidak valid.</Text>
        </View>
      ) : (
        <EmployeeDetail employeeId={id} />
      )}
    </View>
  );
}
