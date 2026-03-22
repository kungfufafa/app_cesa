import { SheetHeader, SheetModal, SheetView } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { useRequestBottomSheet } from "@/store/useRequestBottomSheet";
import { openExternalUrl } from "@/lib/open-url";
import { Href, router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Alert, Pressable, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

type MenuItem = {
  id: string;
  title: string;
  icon: IconSymbolName;
  description: string;
  color: string;
  url?: string;
  route?: Href;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "exit-clearance",
    title: "Exit Clearance",
    icon: "rectangle.portrait.and.arrow.right",
    description: "Proses pengunduran diri karyawan",
    color: "#ef4444",
    url: "https://cesa.completeselular.com/exit-clearance",
  },
  {
    id: "form-transfer",
    title: "Form Transfer",
    icon: "arrow.left.arrow.right",
    description: "Pindahkan karyawan ke departemen lain",
    color: "#3b82f6",
    route: "/form-transfer",
  },
  {
    id: "man-power",
    title: "Man Power",
    icon: "briefcase.fill",
    description: "Ajukan kebutuhan tenaga kerja",
    color: "#10b981",
    url: "https://cesa.completeselular.com/request-man-powers",
  },
];

export function RequestBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close } = useRequestBottomSheet();

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

  const handleMenuPress = (item: MenuItem) => {
    if (item.url) {
      openExternalUrl(item.url);
      close();
    } else if (item.route) {
      router.push(item.route);
      close();
    } else {
      Alert.alert("Segera Hadir", `${item.title} belum tersedia.`);
    }
  };

  return (
    <SheetModal
      ref={bottomSheetRef}
      snapPoints={["45%"]}
      onDismiss={handleDismiss}
    >
      <SheetView className="flex-1 px-6 pt-4 pb-8">
        <SheetHeader
          title="Pengajuan"
          description="Pilih layanan pengajuan yang tersedia."
          className="mb-4"
          onClose={handleDismiss}
        />
        <View className="gap-2">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              className="flex-row items-center p-4 rounded-xl border border-border bg-card active:bg-secondary"
              onPress={() => handleMenuPress(item)}
            >
              <View className="w-8 h-8 rounded-full items-center justify-center mr-4 bg-secondary">
                <IconSymbol
                  size={18}
                  name={item.icon}
                  color="#111827"
                />
              </View>
              <Text className="font-medium text-base text-foreground">
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </SheetView>
    </SheetModal>
  );
}
