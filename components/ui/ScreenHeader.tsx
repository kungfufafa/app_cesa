import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  rightAction?: React.ReactNode;
}

/**
 * Reusable screen header with gradient background
 * Reduces code duplication across presensi screens
 */
export function ScreenHeader({
  title,
  showBackButton = true,
  gradientColors = ["#3b82f6", "#60a5fa", "#93c5fd"] as const,
  rightAction,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-4"
      style={{ paddingTop: insets.top, paddingBottom: 10 }}
    >
      <View className="flex-row items-center">
        {showBackButton ? (
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>
        ) : (
          <View className="w-9 h-9" />
        )}
        <View className="flex-1 items-center">
          <Text className="text-white text-base font-semibold">{title}</Text>
        </View>
        {rightAction ? rightAction : <View className="w-9 h-9" />}
      </View>
    </LinearGradient>
  );
}
