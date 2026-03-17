import React from "react";
import { Pressable, View } from "react-native";

import { HelpdeskStatusBadge } from "@/components/features/helpdesk/HelpdeskStatusBadge";
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
            <Text className="text-sm text-muted-foreground" numberOfLines={2}>
              {ticket.description}
            </Text>
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            {ticket.priority?.name ? (
              <View
                className={`rounded-full border px-3 py-1 ${priorityClasses.container}`}
              >
                <Text className={`text-xs font-semibold ${priorityClasses.text}`}>
                  {ticket.priority.name}
                </Text>
              </View>
            ) : null}
            {ticket.unit?.name ? (
              <View className="rounded-full border border-border bg-secondary px-3 py-1">
                <Text className="text-xs font-semibold text-muted-foreground">
                  {ticket.unit.name}
                </Text>
              </View>
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
