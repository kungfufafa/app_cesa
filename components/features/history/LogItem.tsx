import React from 'react';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { AttendanceLog } from '@/services/attendance';
import dayjs from 'dayjs';
import { clsx } from 'clsx';

interface LogItemProps {
  item: AttendanceLog;
}

export const LogItem: React.FC<LogItemProps> = ({ item }) => {
  const date = dayjs(item.date);
  const clockIn = item.clockIn ? dayjs(item.clockIn).format('HH:mm') : '--:--';
  const clockOut = item.clockOut ? dayjs(item.clockOut).format('HH:mm') : '--:--';

  const statusStyles = {
    'on-time': {
      container: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      text: 'text-emerald-700 dark:text-emerald-400'
    },
    'late': {
      container: 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      text: 'text-amber-700 dark:text-amber-400'
    },
    'absent': {
      container: 'bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      text: 'text-rose-700 dark:text-rose-400'
    }
  };

  const statusLabel = {
    'on-time': 'On Time',
    'late': 'Late',
    'absent': 'Absent',
  }[item.status];

  return (
    <View className="mb-3 overflow-hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {date.format('DD')}
          </Text>
          <Text className="text-base font-medium text-zinc-500 dark:text-zinc-400">
            {date.format('MMM, ddd')}
          </Text>
        </View>
        <View 
          className={clsx(
            "px-3 py-1 rounded-full border", 
            statusStyles[item.status].container
          )}
        >
          <Text className={clsx("text-xs font-semibold capitalize", statusStyles[item.status].text)}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-3">
        <View className="flex-1 items-center border-r border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-medium text-zinc-400 uppercase mb-1">Clock In</Text>
          <Text className={clsx(
            "text-base font-bold",
            item.clockIn ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"
          )}>
            {clockIn}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-xs font-medium text-zinc-400 uppercase mb-1">Clock Out</Text>
          <Text className={clsx(
            "text-base font-bold",
            item.clockOut ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"
          )}>
            {clockOut}
          </Text>
        </View>
      </View>
    </View>
  );
};
