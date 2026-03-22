import React from "react";
import { Pressable, View } from "react-native";

import { HelpdeskStatusBadge } from "@/components/features/helpdesk/HelpdeskStatusBadge";
import { HelpdeskRichText } from "@/components/features/helpdesk/HelpdeskRichText";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { getHelpdeskPriorityBadgeClasses } from "@/lib/helpdesk";
import type { HelpdeskTicketSummary } from "@/services/helpdesk";
import dayjs from "@/lib/dates";

type HelpdeskTicketCardProps = {
  ticket: HelpdeskTicketSummary;
  onPress: () => void;
};

export function HelpdeskTicketCard({
  ticket,
  onPress,
}: HelpdeskTicketCardProps) {
  const priorityClasses = getHelpdeskPriorityBadgeClasses(ticket.priority?.name);

  return (
    <Pressable onPress={onPress}>
      <Card className="py-0">
        <CardContent className="py-4 gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="font-semibold text-base">{ticket.title}</Text>
              <Text className="text-sm text-muted-foreground mt-1">
                #{ticket.id}
              </Text>
            </View>
            <HelpdeskStatusBadge
              statusId={ticket.ticket_status_id}
              fallbackLabel={ticket.ticket_status?.name}
            />
          </View>

          {ticket.description ? (
            <HelpdeskRichText
              html={ticket.description}
              className="text-sm text-muted-foreground"
              numberOfLines={2}
            />
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            {ticket.priority?.name ? (
              <Badge variant="outline" className={priorityClasses.container}>
                <Text className={priorityClasses.text}>
                  {ticket.priority.name}
                </Text>
              </Badge>
            ) : null}
            {ticket.unit?.name ? (
              <Badge variant="secondary">
                <Text className="text-muted-foreground">
                  {ticket.unit.name}
                </Text>
              </Badge>
            ) : null}
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-muted-foreground">
              {ticket.owner?.name || "Pelapor tidak diketahui"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {dayjs(ticket.created_at).format("DD MMM YYYY, HH:mm")}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
