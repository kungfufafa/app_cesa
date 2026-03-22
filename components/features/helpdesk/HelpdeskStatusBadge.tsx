import React from "react";

import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { getHelpdeskStatusBadgeClasses, getHelpdeskStatusLabel } from "@/lib/helpdesk";

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
    <Badge variant="outline" className={classes.container}>
      <Text className={classes.text}>
        {getHelpdeskStatusLabel(statusId, fallbackLabel)}
      </Text>
    </Badge>
  );
}
