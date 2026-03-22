import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { usePayrollDetail } from "@/hooks/payroll/usePayrollQueries";
import dayjs from "@/lib/dates";
import { formatCurrency } from "@/lib/utils";

export default function PayrollDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payroll, isLoading, error } = usePayrollDetail(id!);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Detail Gaji"
          onBackPress={() => router.back()}
          className="rounded-b-[32px] pb-8 shadow-lg"
          titleClassName="text-xl font-bold"
        />
        <Spinner centered size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !payroll) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          className="flex-1"
          icon={<IconSymbol name="nosign" size={48} color="#ef4444" />}
          title="Gagal memuat detail gaji."
          description="Silakan kembali dan coba lagi."
          action={
            <Button variant="secondary" onPress={() => router.back()}>
              <Text className="font-semibold">Kembali</Text>
            </Button>
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Detail Gaji"
        onBackPress={() => router.back()}
        className="rounded-b-[32px] pb-8 shadow-lg"
        titleClassName="text-xl font-bold"
      />

      <View className="z-10 -mt-2 px-4">
        <View className="items-center rounded-[28px] bg-primary px-4 py-6">
          <Text className="mb-1 text-lg font-medium capitalize text-white/90">
            {payroll.month} {payroll.year}
          </Text>
          <Text className="text-white text-4xl font-extrabold tracking-tight drop-shadow-md">
            {formatCurrency(payroll.net_salary)}
          </Text>
          <Badge
            className={`mt-3 border ${
              payroll.status === "paid"
                ? "border-green-200/40 bg-green-500/30"
                : "border-orange-200/40 bg-orange-500/30"
            }`}
          >
            <Text className="text-xs font-bold uppercase tracking-wider text-white">
              {payroll.status === "paid" ? "Sudah Dibayarkan" : "Sedang Diproses"}
            </Text>
          </Badge>
          {payroll.payment_date && (
            <Text className="text-white/80 text-xs mt-2 font-medium">
              Dibayar pada {dayjs(payroll.payment_date).format("DD MMMM YYYY")}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 -mt-4 z-0"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="mb-4 py-0">
          <CardContent className="gap-0 p-5">
            <Text className="mb-4 text-lg font-bold text-foreground">Ringkasan Pendapatan</Text>
          <View className="flex-row justify-between mb-3 items-center">
            <Text className="text-muted-foreground text-base">Gaji Kotor</Text>
            <Text className="font-semibold text-base">{formatCurrency(payroll.gross_salary)}</Text>
          </View>

          {payroll.overtime_amount > 0 && (
            <View className="flex-row justify-between mb-3 items-center">
              <Text className="text-muted-foreground text-base">Lembur</Text>
              <Text className="font-semibold text-green-600 text-base">+{formatCurrency(payroll.overtime_amount)}</Text>
            </View>
          )}

          {payroll.penalties_amount > 0 && (
            <View className="flex-row justify-between mb-3 items-center">
              <Text className="text-muted-foreground text-base">Potongan / Denda</Text>
              <Text className="font-semibold text-red-500 text-base">-{formatCurrency(payroll.penalties_amount)}</Text>
            </View>
          )}

          <View className="h-px bg-border my-4" />

          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-lg text-foreground">Total Diterima</Text>
            <Text className="font-bold text-xl text-primary">{formatCurrency(payroll.net_salary)}</Text>
          </View>
          </CardContent>
        </Card>

        {payroll.penalties_breakdown && payroll.penalties_breakdown.length > 0 && (
          <Card className="mb-4 py-0">
            <CardContent className="p-5">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-foreground">Rincian Potongan</Text>
            </View>

            {payroll.penalties_breakdown.map((item, index) => (
              <View key={item.id || index} className={`flex-row justify-between py-3 items-center ${index !== payroll.penalties_breakdown.length - 1 ? 'border-b border-border/50' : ''}`}>
                <Text className="text-muted-foreground flex-1 mr-4 text-sm leading-tight">{item.description}</Text>
                <Text className="font-medium text-red-500 text-sm whitespace-nowrap">-{formatCurrency(item.amount)}</Text>
              </View>
            ))}
            </CardContent>
          </Card>
        )}

        {payroll.allowances_breakdown && payroll.allowances_breakdown.length > 0 && (
          <Card className="mb-4 py-0">
            <CardContent className="p-5">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                  <IconSymbol name="plus" size={16} color="#22c55e" />
                </View>
                <Text className="text-lg font-bold text-foreground">Rincian Tunjangan</Text>
              </View>

              {payroll.allowances_breakdown.map((item, index) => (
                <View key={index} className={`flex-row justify-between py-3 items-center ${index !== payroll.allowances_breakdown!.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <Text className="text-muted-foreground flex-1 mr-4 text-sm leading-tight">{item.description}</Text>
                  <Text className="font-medium text-green-600 text-sm whitespace-nowrap">+{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        <View className="items-center mt-4 mb-8">
          <Text className="text-xs text-muted-foreground text-center px-8">
            Jika terdapat kesalahan pada data gaji, silakan hubungi HRD atau Finance department.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
