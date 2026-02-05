import { Text } from "@/components/ui/text";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRequestBottomSheet } from "@/store/useRequestBottomSheet";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Href, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect, useRef } from "react";
import { Alert, TouchableOpacity, View } from "react-native";

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
    description: "Process employee resignation",
    color: "#ef4444",
    url: "https://cesa.completeselular.com/exit-clearance",
  },
  {
    id: "form-transfer",
    title: "Form Transfer",
    icon: "arrow.left.arrow.right",
    description: "Transfer employee to another department",
    color: "#3b82f6",
    route: "/form-transfer",
  },
];

export function RequestBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close } = useRequestBottomSheet();
  const colorScheme = useColorScheme();
  const router = useRouter();

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
      Linking.openURL(item.url);
      close();
    } else if (item.route) {
      router.push(item.route);
      close();
    } else {
      Alert.alert("Coming Soon", `${item.title} belum tersedia.`);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={["45%"]}
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
      <BottomSheetView className="flex-1 px-6 pt-4 pb-8">
        <View className="gap-2">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center p-4 rounded-xl border border-border bg-card active:bg-secondary"
              onPress={() => handleMenuPress(item)}
            >
              <View className="w-8 h-8 rounded-full items-center justify-center mr-4 bg-secondary">
                <IconSymbol
                  size={18}
                  name={item.icon}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </View>
              <Text className="font-medium text-base text-foreground">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
