import React from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePayrollDetail } from '@/hooks/payroll/usePayrollQueries';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function PayrollDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payroll, isLoading, error } = usePayrollDetail(id!);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !payroll) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Stack.Screen options={{ headerShown: false }} />
        <IconSymbol name="nosign" size={48} color="#ef4444" />
        <Text className="text-red-500 mt-4 text-center">Gagal memuat detail gaji.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-secondary px-4 py-2 rounded-lg">
          <Text>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#3b82f6', '#60a5fa', '#93c5fd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-8 rounded-b-[32px] pt-12 shadow-lg z-10"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center mb-6">
          <Pressable
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 active:bg-white/30"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold flex-1 text-center mr-10">Detail Gaji</Text>
        </View>

        <View className="items-center mb-2">
          <Text className="text-white/90 text-lg font-medium capitalize mb-1">
            {payroll.month} {payroll.year}
          </Text>
          <Text className="text-white text-4xl font-extrabold tracking-tight drop-shadow-md">
            {formatCurrency(payroll.net_salary)}
          </Text>
          <View className={`mt-3 px-4 py-1.5 rounded-full ${payroll.status === 'paid' ? 'bg-green-500/30 border border-green-200/40' : 'bg-orange-500/30 border border-orange-200/40'}`}>
            <Text className="text-white text-xs font-bold uppercase tracking-wider">
              {payroll.status === 'paid' ? 'Sudah Dibayarkan' : 'Sedang Diproses'}
            </Text>
          </View>
          {payroll.payment_date && (
            <Text className="text-white/80 text-xs mt-2 font-medium">
               Dibayar pada {dayjs(payroll.payment_date).format('DD MMMM YYYY')}
            </Text>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1 px-4 -mt-6 z-0" 
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 30 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Summary Card */}
        <View className="bg-card rounded-2xl p-5 border border-border mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-4 text-foreground">Ringkasan Pendapatan</Text>
          
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
        </View>

        {/* Penalties Breakdown */}
        {payroll.penalties_breakdown && payroll.penalties_breakdown.length > 0 && (
          <View className="bg-card rounded-2xl p-5 border border-border mb-4 shadow-sm">
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
          </View>
        )}

        {/* Allowances Breakdown (if any) */}
        {payroll.allowances_breakdown && payroll.allowances_breakdown.length > 0 && (
          <View className="bg-card rounded-2xl p-5 border border-border mb-4 shadow-sm">
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
          </View>
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
