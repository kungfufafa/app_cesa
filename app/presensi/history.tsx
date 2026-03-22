import React, { useState } from "react";
import {
  FlatList,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import dayjs from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useRiwayatPresensi } from "@/hooks/presensi/usePresensiQueries";
import type { PresensiRecord } from "@/services/presensi/presensi";
import { PresensiHistoryCard } from "@/components/features/presensi";

export default function RiwayatPresensiScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { data: history = [], isLoading: isLoadingHistory } = useRiwayatPresensi(
    currentDate.month() + 1,
    currentDate.year()
  );

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const renderItem = ({ item }: { item: PresensiRecord }) => (
    <PresensiHistoryCard record={item} />
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
      <ScreenHeader title="Riwayat Presensi" onBackPress={() => router.back()} />

      <View className="px-4 pt-4">
        <Card className="py-0 border-border">
          <CardContent className="flex-row justify-between items-center py-4">
            <Button
              variant="secondary"
              size="icon"
              onPress={handlePrevMonth}
              className="rounded-lg"
            >
              <IconSymbol name="chevron.left" size={20} color="#6b7280" />
            </Button>

            <Text className="font-bold capitalize">
              {currentDate.format("MMMM YYYY")}
            </Text>

            <Button
              variant="secondary"
              size="icon"
              onPress={handleNextMonth}
              className="rounded-lg"
            >
              <IconSymbol name="chevron.right" size={20} color="#6b7280" />
            </Button>
          </CardContent>
        </Card>
      </View>

      {isLoadingHistory ? (
        <Spinner centered size="large" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id || item.date)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState
              className="flex-1 pt-20"
              icon={<IconSymbol name="calendar" size={40} color="#9ca3af" />}
              title="Belum ada riwayat"
              description={`Tidak ada data presensi untuk bulan ${currentDate.format("MMMM YYYY")}`}
            />
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
        />
      )}
    </SafeAreaView>
  );
}
