import React, { useCallback } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Pressable onPress={handlePress}>
      <Card className="mb-3 py-0 active:bg-secondary/10">
        <CardContent className="flex-row items-center justify-between p-4">
          <View className="flex-1">
            <View className="mb-2 flex-row items-start justify-between">
              <Text className="text-lg font-bold capitalize text-foreground">
                {payroll.month} {payroll.year}
              </Text>
              <Badge className={statusColor}>
                <Text className={statusTextColor}>
                  {statusLabel}
                </Text>
              </Badge>
            </View>

            <View className="mt-1 flex-row items-end justify-between">
              <View>
                <Text className="text-xs text-muted-foreground">Gaji Bersih</Text>
                <Text className="mt-0.5 text-xl font-bold text-primary">
                  {formatCurrency(payroll.net_salary)}
                </Text>
              </View>
            </View>

            {payroll.payment_date ? (
              <Text className="mt-2 text-xs text-muted-foreground">
                Dibayar: {formatDate(payroll.payment_date)}
              </Text>
            ) : null}
          </View>
          <View className="ml-2">
            <IconSymbol name="chevron.right" size={20} color="#9ca3af" />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
