import React, { useCallback } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency } from "@/lib/utils";
import { PayrollSummary } from "@/services/payroll";
import { formatDate } from "@/lib/dates";

export interface PayrollCardProps {
  payroll: PayrollSummary;
}

/**
 * Payroll card component for displaying payroll summary in list
 * Extracted to reduce inline render function and improve performance
 */
export function PayrollCard({ payroll }: PayrollCardProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push(`/payroll/${payroll.id}`);
  }, [router, payroll.id]);

  const statusColor =
    payroll.status === "paid"
      ? "bg-green-100 dark:bg-green-900/30"
      : "bg-orange-100 dark:bg-orange-900/30";

  const statusTextColor =
    payroll.status === "paid"
      ? "text-green-700 dark:text-green-400"
      : "text-orange-700 dark:text-orange-400";

  const statusLabel = payroll.status === "paid" ? "DIBAYAR" : "DIPROSES";

  return (
    <Pressable
      onPress={handlePress}
      className="bg-card rounded-xl p-4 mb-3 border border-border flex-row justify-between items-center active:bg-secondary/10 shadow-sm"
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold capitalize text-foreground">
            {payroll.month} {payroll.year}
          </Text>
          <View className={`px-2 py-1 rounded-full ${statusColor}`}>
            <Text className={`text-[10px] font-bold ${statusTextColor}`}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-end mt-1">
          <View>
            <Text className="text-xs text-muted-foreground">Gaji Bersih</Text>
            <Text className="text-xl font-bold text-primary mt-0.5">
              {formatCurrency(payroll.net_salary)}
            </Text>
          </View>
        </View>

        {payroll.payment_date && (
          <Text className="text-xs text-muted-foreground mt-2">
            Dibayar: {formatDate(payroll.payment_date)}
          </Text>
        )}
      </View>
      <View className="ml-2">
        <IconSymbol name="chevron.right" size={20} color="#9ca3af" />
      </View>
    </Pressable>
  );
}
