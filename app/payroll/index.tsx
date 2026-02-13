import React, { useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PayrollCard } from '@/components/features/payroll';
import { usePayrollList } from '@/hooks/payroll/usePayrollQueries';
import { PayrollSummary } from '@/services/payroll';

export default function PayrollListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: payrolls, isLoading, error } = usePayrollList();

  const renderItem = useCallback(({ item }: { item: PayrollSummary }) => (
    <PayrollCard payroll={item} />
  ), []);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#3b82f6', '#60a5fa', '#93c5fd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-6 rounded-b-[32px]"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center mb-2">
          <Pressable
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 active:bg-white/30"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Daftar Gaji</Text>
        </View>
      </LinearGradient>

      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
             <IconSymbol name="nosign" size={48} color="#ef4444" />
             <Text className="text-red-500 mt-4 text-center">Gagal memuat data gaji.</Text>
             <Text className="text-muted-foreground text-xs mt-2 text-center">Silakan coba lagi nanti.</Text>
          </View>
        ) : (
          <FlatList
            data={payrolls}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-4">
                   <IconSymbol name="banknote.fill" size={40} color="#9ca3af" />
                </View>
                <Text className="font-medium text-lg">Belum ada data gaji</Text>
                <Text className="text-muted-foreground mt-2 text-center px-10">
                  Data gaji Anda akan muncul di sini setiap bulan setelah diterbitkan.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
