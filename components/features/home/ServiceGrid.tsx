import React from "react";
import { View } from "react-native";
import { ServiceItem } from "./ServiceItem";
import { SERVICES } from "@/constants/services";
import { useMoreServicesStore } from "@/store/useMoreServicesStore";

export function ServiceGrid() {
  const { open } = useMoreServicesStore();
  const firstRow = SERVICES.slice(0, 4);
  const secondRow = SERVICES.slice(4, 8);

  return (
    <View className="bg-card rounded-2xl p-3 border border-border">
      <View className="flex-row justify-between">
        {firstRow.map((service) => (
          <ServiceItem
            key={service.id}
            icon={service.icon}
            image={service.image}
            label={service.label}
            url={service.url}
            iconColor={service.color}
          />
        ))}
      </View>
      <View className="flex-row justify-between mt-1">
        {secondRow.map((service) => (
          <ServiceItem
            key={service.id}
            icon={service.icon}
            image={service.image}
            label={service.label}
            url={service.url}
            iconColor={service.color}
            onPress={service.id === "lainnya" ? open : undefined}
          />
        ))}
      </View>
    </View>
  );
}
