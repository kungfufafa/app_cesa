import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, CalendarOff } from "lucide-react-native";
import { getHistory } from "@/services/attendance";
import { LogItem } from "@/components/features/history/LogItem";

export default function HistoryScreen() {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const month = currentDate.month();
  const year = currentDate.year();

  const {
    data: history,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["history", month, year],
    queryFn: () => getHistory(month, year),
  });

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 py-4 border-b border-border bg-background z-10">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold text-foreground tracking-tight">
            Attendance Log
          </Text>
        </View>

        <View className="flex-row items-center justify-between bg-secondary/50 rounded-lg p-1 border border-border">
          <TouchableOpacity
            onPress={handlePrevMonth}
            className="p-2 rounded-md hover:bg-background active:bg-background"
          >
            <ChevronLeft
              size={18}
              className="text-foreground"
              color="#71717a"
            />
          </TouchableOpacity>

          <Text className="text-sm font-medium text-foreground">
            {currentDate.format("MMMM YYYY")}
          </Text>

          <TouchableOpacity
            onPress={handleNextMonth}
            className="p-2 rounded-md hover:bg-background active:bg-background"
          >
            <ChevronRight
              size={18}
              className="text-foreground"
              color="#71717a"
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#71717a" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LogItem item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20 opacity-50">
              <CalendarOff
                size={40}
                className="text-muted-foreground mb-3"
                color="#a1a1aa"
              />
              <Text className="text-sm font-medium text-muted-foreground text-center">
                No records found
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}
