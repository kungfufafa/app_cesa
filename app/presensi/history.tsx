import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAttendanceHistory } from "@/hooks/presensi/usePresensiQueries";
import { AttendanceRecord } from "@/services/presensi/attendance";
import { AttendanceHistoryCard } from "@/components/features/presensi";

dayjs.locale("id");

export default function AttendanceHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { data: history = [], isLoading: isLoadingHistory } = useAttendanceHistory(
    currentDate.month() + 1,
    currentDate.year()
  );

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <AttendanceHistoryCard record={item} />
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4"
        style={{ paddingTop: insets.top, paddingBottom: 10 }}
      >
        <View className="flex-row items-center">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-white text-base font-semibold">Riwayat Absensi</Text>
          </View>
          <View className="w-9 h-9" />
        </View>
      </LinearGradient>

      <View className="px-4 pt-4">
        <Card className="py-0 border-border">
          <CardContent className="flex-row justify-between items-center py-4">
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="w-10 h-10 bg-secondary rounded-lg items-center justify-center active:opacity-70"
            >
              <IconSymbol name="chevron.left" size={20} color="#6b7280" />
            </TouchableOpacity>

            <Text className="font-bold capitalize">
              {currentDate.format("MMMM YYYY")}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              className="w-10 h-10 bg-secondary rounded-lg items-center justify-center active:opacity-70"
            >
              <IconSymbol name="chevron.right" size={20} color="#6b7280" />
            </TouchableOpacity>
          </CardContent>
        </Card>
      </View>

      {isLoadingHistory ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id || item.date)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-4">
                <IconSymbol name="calendar" size={40} color="#9ca3af" />
              </View>
              <Text className="font-medium">Belum ada riwayat</Text>
              <Text variant="muted" className="text-center mt-1 px-10">
                Tidak ada data absensi untuk bulan{" "}
                {currentDate.format("MMMM YYYY")}
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
        />
      )}
    </SafeAreaView>
  );
}
