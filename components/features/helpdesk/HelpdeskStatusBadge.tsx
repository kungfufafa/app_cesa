import React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { getHelpdeskStatusBadgeClasses, getHelpdeskStatusLabel } from "@/lib/helpdesk";
import { cn } from "@/lib/utils";

type HelpdeskStatusBadgeProps = {
  statusId?: number | null;
  fallbackLabel?: string | null;
};

export function HelpdeskStatusBadge({
  statusId,
  fallbackLabel,
}: HelpdeskStatusBadgeProps) {
  const classes = getHelpdeskStatusBadgeClasses(statusId);

  return (
    <View
      className={cn(
        "rounded-full border px-3 py-1",
        classes.container
      )}
    >
      <Text className={cn("text-xs font-semibold", classes.text)}>
        {getHelpdeskStatusLabel(statusId, fallbackLabel)}
      </Text>
    </View>
  );
}
