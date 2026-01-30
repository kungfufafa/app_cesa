import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Clock, Calendar } from "lucide-react-native";

interface StatusCardProps {
  clockedIn: boolean;
  shiftStart: string;
  shiftEnd: string;
  lastClockIn?: string;
  lastClockOut?: string;
}

export const StatusCard = ({
  clockedIn,
  shiftStart,
  shiftEnd,
  lastClockIn,
  lastClockOut,
}: StatusCardProps) => {
  return (
    <View className="bg-card rounded-2xl p-4 my-2.5 shadow-sm border border-border">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-foreground">
          Today&apos;s Status
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${clockedIn ? "bg-success/10" : "bg-muted"}`}
        >
          <Text
            className={`text-xs font-bold ${clockedIn ? "text-success" : "text-muted-foreground"}`}
          >
            {clockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-2">
          <Calendar size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">Shift</Text>
          <Text className="text-sm font-medium text-foreground ml-1">
            {shiftStart} - {shiftEnd}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-border my-3" />

      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">Clock In</Text>
          <Text className="text-sm font-medium text-foreground ml-1">
            {lastClockIn
              ? new Date(lastClockIn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">Clock Out</Text>
          <Text className="text-sm font-medium text-foreground ml-1">
            {lastClockOut
              ? new Date(lastClockOut).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </Text>
        </View>
      </View>
    </View>
  );
};
