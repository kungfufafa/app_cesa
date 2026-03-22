import type * as React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  titleClassName,
  descriptionClassName,
}: EmptyStateProps) {
  return (
    <View className={cn("items-center justify-center gap-3 px-6 py-8", className)}>
      {icon ? <View className="items-center justify-center">{icon}</View> : null}
      <View className="items-center gap-1">
        <Text className={cn("text-center text-lg font-semibold", titleClassName)}>{title}</Text>
        {description ? (
          <Text variant="muted" className={cn("text-center", descriptionClassName)}>
            {description}
          </Text>
        ) : null}
      </View>
      {action ? <View className="pt-1">{action}</View> : null}
    </View>
  );
}
