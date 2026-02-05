import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMoreServicesStore } from "@/store/useMoreServicesStore";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ServiceItem } from "./ServiceItem";
import { SERVICES } from "@/constants/services";

export function MoreServicesSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close } = useMoreServicesStore();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

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
      <BottomSheetView className="flex-1 px-6 pt-2 pb-8">
        <Text className="text-lg font-semibold text-foreground mb-4 px-2">
          Semua Layanan
        </Text>
        <BottomSheetScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="flex-row flex-wrap">
            {allServices.map((service) => (
              <View key={service.id} className="w-1/4 mb-4">
                <ServiceItem
                  label={service.label}
                  iconName={service.iconName}
                  image={service.image}
                  url={service.url}
                  iconColor={service.color}
                />
              </View>
            ))}
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
