import React from "react";
import { View, Text } from "react-native";
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
    <View className="bg-white dark:bg-zinc-900 rounded-2xl p-4 my-2.5 shadow-sm border border-gray-100 dark:border-zinc-800">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Today&apos;s Status
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${clockedIn ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"}`}
        >
          <Text
            className={`text-xs font-bold ${clockedIn ? "text-green-800 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            {clockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-2">
          <Calendar size={16} className="text-gray-500" color="#6b7280" />
          <Text className="text-sm text-gray-500">Shift</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-1">
            {shiftStart} - {shiftEnd}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-3" />

      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-2">
          <Clock size={16} className="text-gray-500" color="#6b7280" />
          <Text className="text-sm text-gray-500">Clock In</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-1">
            {lastClockIn
              ? new Date(lastClockIn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Clock size={16} className="text-gray-500" color="#6b7280" />
          <Text className="text-sm text-gray-500">Clock Out</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-1">
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
