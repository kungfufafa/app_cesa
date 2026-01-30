import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, CalendarOff } from 'lucide-react-native';
import { getHistory } from '@/services/attendance';
import { LogItem } from '@/components/features/history/LogItem';

export default function HistoryScreen() {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const month = currentDate.month();
  const year = currentDate.year();

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['history', month, year],
    queryFn: () => getHistory(month, year),
  });

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950" edges={['top']}>
      <View className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm z-10">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Attendance Log</Text>
        </View>
        
        <View className="flex-row items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <TouchableOpacity 
            onPress={handlePrevMonth}
            className="p-2 rounded-lg bg-white dark:bg-zinc-700 shadow-sm active:bg-zinc-50"
          >
            <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-300" color="#52525b" />
          </TouchableOpacity>
          
          <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            {currentDate.format('MMMM YYYY')}
          </Text>
          
          <TouchableOpacity 
            onPress={handleNextMonth}
            className="p-2 rounded-lg bg-white dark:bg-zinc-700 shadow-sm active:bg-zinc-50"
          >
            <ChevronRight size={20} className="text-zinc-600 dark:text-zinc-300" color="#52525b" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" className="text-indigo-600" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LogItem item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20 opacity-50">
              <CalendarOff size={48} className="text-zinc-300 mb-4" color="#d4d4d8" />
              <Text className="text-lg font-medium text-zinc-400 text-center">
                No records found for this month
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
