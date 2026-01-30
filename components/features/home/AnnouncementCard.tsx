import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export interface Announcement {
  id: string;
  type: "info" | "warning" | "urgent";
  title: string;
  date: string;
  preview: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: () => void;
}

const TYPE_STYLES = {
  info: {
    badge: "bg-primary/10",
    text: "text-primary",
    label: "INFO",
  },
  warning: {
    badge: "bg-warning/10",
    text: "text-warning",
    label: "WARNING",
  },
  urgent: {
    badge: "bg-destructive/10",
    text: "text-destructive",
    label: "URGENT",
  },
};

export function AnnouncementCard({
  announcement,
  onPress,
}: AnnouncementCardProps) {
  const typeStyle = TYPE_STYLES[announcement.type];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity
      className="bg-card rounded-xl p-4 border border-border"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className={cn("px-2 py-0.5 rounded", typeStyle.badge)}>
          <Text className={cn("text-[10px] font-bold", typeStyle.text)}>
            {typeStyle.label}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {formatDate(announcement.date)}
        </Text>
      </View>

      <Text className="text-sm font-semibold text-foreground mb-1">
        {announcement.title}
      </Text>

      <Text
        className="text-xs text-muted-foreground leading-5"
        numberOfLines={2}
      >
        {announcement.preview}
      </Text>
    </TouchableOpacity>
  );
}
