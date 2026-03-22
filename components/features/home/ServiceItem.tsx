import { Text } from "@/components/ui/text";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { openExternalUrl } from "@/lib/open-url";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { Href, useRouter } from "expo-router";

interface ServiceItemProps {
  iconName?: IconSymbolName;
  image?: number;
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
  const { requireAuth } = useRequireAuth();
  const fallbackIconColor = Colors[colorScheme ?? "light"].icon;
  const isProtectedInternalRoute =
    url.startsWith("/presensi") ||
    url.startsWith("/inbox") ||
    url.startsWith("/helpdesk");

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (url) {
      if (url.startsWith("/")) {
        if (isProtectedInternalRoute) {
          requireAuth(() => router.push(url as Href));
          return;
        }

        router.push(url as Href);
      } else {
        openExternalUrl(url);
      }
    }
  };

  return (
    <Pressable
      className="flex-1 items-center py-2"
      onPress={handlePress}
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
    </Pressable>
  );
}
