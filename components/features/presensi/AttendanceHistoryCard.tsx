import React from "react";
import { View } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { cn } from "@/lib/utils";
import { AttendanceRecord } from "@/services/presensi/attendance";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";

dayjs.locale("id");

interface AttendanceHistoryCardProps {
  record: AttendanceRecord;
  className?: string;
}

export function AttendanceHistoryCard({
  record,
  className,
}: AttendanceHistoryCardProps) {
  const dateObj = dayjs(record.date);

  const formatTime = (time: string | null): string => {
    if (!time) return "--:--";
    return time.slice(0, 5);
  };

  return (
    <Card className={cn("py-0", className)}>
      <CardContent className="flex-row items-center py-4">
        <View className="items-center mr-4 w-12">
          <Text variant="h4">{dateObj.format("DD")}</Text>
          <Text variant="muted" className="text-xs uppercase">
            {dateObj.format("ddd")}
          </Text>
        </View>

        <View className="h-10 w-[1px] bg-border mr-4" />

        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <IconSymbol name="arrow.down.right" size={14} color="#10b981" />
            <Text className="text-sm font-semibold ml-2">
              {formatTime(record.check_in_time)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <IconSymbol name="arrow.up.right" size={14} color="#f59e0b" />
            <Text className="text-sm font-semibold ml-2">
              {formatTime(record.check_out_time)}
            </Text>
          </View>
        </View>

        <AttendanceStatusBadge status={record.status} isLate={record.is_late} />
      </CardContent>
    </Card>
  );
}
