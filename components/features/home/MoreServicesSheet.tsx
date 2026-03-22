import { SheetHeader, SheetModal, SheetScrollView, SheetView } from "@/components/ui/bottom-sheet";
import { useMoreServicesStore } from "@/store/useMoreServicesStore";
import React, { useEffect, useRef, useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ServiceItem } from "./ServiceItem";
import { SERVICES } from "@/constants/services";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export function MoreServicesSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close } = useMoreServicesStore();
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
    <SheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
    >
      <SheetView className="flex-1 px-6 pt-2 pb-8">
        <SheetHeader title="Semua Layanan" className="mb-4 px-2" onClose={handleDismiss} />
        <SheetScrollView
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
        </SheetScrollView>
      </SheetView>
    </SheetModal>
  );
}
