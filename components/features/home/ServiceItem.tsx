import { Text } from "@/components/ui/text";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Linking from "expo-linking";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";

interface ServiceItemProps {
  iconName?: IconSymbolName;
  image?: any;
  label: string;
  url: string;
  iconColor?: string;
  onPress?: () => void;
}

export function ServiceItem({
  iconName,
  image,
  label,
  url,
  iconColor,
  onPress,
}: ServiceItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const fallbackIconColor = Colors[colorScheme ?? "light"].icon;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (url) {
      if (url.startsWith("/")) {
        router.push(url as Href);
      } else {
        Linking.openURL(url);
      }
    }
  };

  return (
    <TouchableOpacity
      className="flex-1 items-center py-2"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="w-14 h-14 rounded-xl bg-secondary/50 border border-border items-center justify-center mb-1 overflow-hidden">
        {image ? (
          <Image source={image} className="w-full h-full" resizeMode="cover" />
        ) : iconName ? (
          <IconSymbol
            name={iconName}
            size={24}
            color={iconColor ?? fallbackIconColor}
          />
        ) : null}
      </View>
      <Text
        className="text-[10px] font-medium text-foreground text-center"
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
