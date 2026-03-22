import React, { useCallback } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

import { PayrollCard } from "@/components/features/payroll";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { usePayrollList } from "@/hooks/payroll/usePayrollQueries";
import type { PayrollSummary } from "@/services/payroll";

export default function PayrollListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: payrolls, isLoading, error } = usePayrollList();

  const renderItem = useCallback(
    ({ item }: { item: PayrollSummary }) => <PayrollCard payroll={item} />,
    [],
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Daftar Gaji"
        onBackPress={() => router.back()}
        className="rounded-b-[32px] pb-6"
        titleClassName="text-xl font-bold"
      />

      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <Spinner centered size="large" color="#3b82f6" />
        ) : error ? (
          <EmptyState
            className="flex-1"
            icon={<IconSymbol name="nosign" size={48} color="#ef4444" />}
            title="Gagal memuat data gaji."
            description="Silakan coba lagi beberapa saat lagi."
          />
        ) : (
          <FlatList
            data={payrolls}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                className="flex-1 pt-20"
                icon={<IconSymbol name="banknote.fill" size={40} color="#9ca3af" />}
                title="Belum ada data gaji"
                description="Data gaji Anda akan muncul di sini setiap bulan setelah diterbitkan."
              />
            }
          />
        )}
      </View>
    </View>
  );
}
