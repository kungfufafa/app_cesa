import React from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";

type AuthRequiredStateProps = {
  title: string;
  description: string;
  iconName?: IconSymbolName;
  buttonLabel?: string;
};

export function AuthRequiredState({
  title,
  description,
  iconName = "person.fill",
  buttonLabel = "Login",
}: AuthRequiredStateProps) {
  const openSheet = useAuthBottomSheet((s) => s.open);

  return (
    <View className="flex-1 justify-center items-center px-6 bg-background">
      <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
        <IconSymbol name={iconName} size={32} color="#71717a" />
      </View>
      <Text className="text-lg font-semibold text-center">{title}</Text>
      <Text className="text-sm text-muted-foreground text-center mt-2">
        {description}
      </Text>
      <Button className="mt-5" onPress={() => openSheet()}>
        <Text className="text-primary-foreground font-bold">{buttonLabel}</Text>
      </Button>
    </View>
  );
}
