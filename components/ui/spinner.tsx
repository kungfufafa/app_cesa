import type * as React from "react";
import { ActivityIndicator, View } from "react-native";

import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/lib/utils";

type SpinnerProps = React.ComponentPropsWithoutRef<typeof ActivityIndicator> & {
  className?: string;
  label?: string;
  labelClassName?: string;
  centered?: boolean;
};

export function Spinner({
  className,
  label,
  labelClassName,
  centered = false,
  color,
  ...props
}: SpinnerProps) {
  const colorScheme = useColorScheme();
  const indicator = (
    <ActivityIndicator
      color={color ?? Colors[colorScheme ?? "light"].tint}
      {...props}
    />
  );

  if (!label && !centered && !className) {
    return indicator;
  }

  return (
    <View className={cn("items-center justify-center gap-3", centered && "flex-1", className)}>
      {indicator}
      {label ? (
        <Text variant="muted" className={cn("text-center", labelClassName)}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
