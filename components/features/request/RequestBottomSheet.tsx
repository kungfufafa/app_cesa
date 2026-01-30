import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRequestBottomSheet } from "@/store/useRequestBottomSheet";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { Briefcase, FileText, LogOut, RefreshCw } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

const MENU_ITEMS = [
  {
    id: "exit-clearance",
    title: "Exit Clearance",
    icon: LogOut,
    description: "Process employee resignation",
    color: "#ef4444",
    url: "https://cesa.completeselular.com/exit-clearance",
  },
  {
    id: "form-transfer",
    title: "Form Transfer",
    icon: RefreshCw,
    description: "Transfer employee to another department",
    color: "#3b82f6",
    route: "/form-transfer",
  },
  {
    id: "leave-request",
    title: "Leave Request",
    icon: Briefcase,
    description: "Apply for annual or sick leave",
    color: "#10b981",
  },
  {
    id: "document-request",
    title: "Document Request",
    icon: FileText,
    description: "Request official documents",
    color: "#f59e0b",
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

  const handleMenuPress = (item: (typeof MENU_ITEMS)[number]) => {
    if (item.url) {
      Linking.openURL(item.url);
      close();
    } else if (item.route) {
      router.push(item.route as any);
      close();
    } else {
      console.log("Selected:", item.title);
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
                <item.icon
                  size={18}
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
