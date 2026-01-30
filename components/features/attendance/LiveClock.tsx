import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import dayjs from "dayjs";

export const LiveClock = () => {
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View className="items-center justify-center py-4">
      <Text className="text-4xl font-bold text-foreground">
        {time.format("HH:mm:ss")}
      </Text>
      <Text className="text-sm text-muted-foreground">
        {time.format("dddd, D MMMM YYYY")}
      </Text>
    </View>
  );
};
