import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMoreServicesStore } from "@/store/useMoreServicesStore";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useMemo } from "react";
import { View } from "react-native";
import { ServiceItem } from "./ServiceItem";
import { SERVICES } from "@/constants/services";

export function MoreServicesSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close } = useMoreServicesStore();
  const colorScheme = useColorScheme();

  const snapPoints = useMemo(() => ["50%", "90%"], []);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const handleDismiss = () => {
    close();
  };

  const allServices = SERVICES.filter((s) => s.id !== "lainnya");

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
      backgroundStyle={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors[colorScheme ?? "light"].icon,
      }}
    >
      <View className="flex-1 px-4 pt-2">
        <Text className="text-lg font-semibold text-foreground mb-4 px-2">
          Semua Layanan
        </Text>
        <BottomSheetScrollView contentContainerClassName="pb-8">
          <View className="flex-row flex-wrap">
            {allServices.map((service) => (
              <View key={service.id} className="w-1/4 mb-4">
                <ServiceItem
                  label={service.label}
                  icon={service.icon}
                  image={service.image}
                  url={service.url}
                  iconColor={service.color}
                />
              </View>
            ))}
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
