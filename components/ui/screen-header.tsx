import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}
export function ScreenHeader({
  title,
  showBackButton = true,
  onBackPress,
  gradientColors = ["#3b82f6", "#60a5fa", "#93c5fd"] as const,
  rightAction,
  leftAction,
  className,
  titleClassName,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const resolvedLeftAction = leftAction
    ? leftAction
    : showBackButton && onBackPress
      ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-white/20"
          onPress={onBackPress}
          hitSlop={8}
          accessibilityLabel="Kembali"
        >
          <IconSymbol name="chevron.left" size={20} color="#fff" />
        </Button>
      )
      : <View className="h-9 w-9" />;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={cn("px-4", className)}
      style={{ paddingTop: insets.top, paddingBottom: 10 }}
    >
      <View className="flex-row items-center">
        {resolvedLeftAction}
        <View className="flex-1 items-center">
          <Text className={cn("text-base font-semibold text-white", titleClassName)}>{title}</Text>
        </View>
        {rightAction ?? <View className="h-9 w-9" />}
      </View>
    </LinearGradient>
  );
}
