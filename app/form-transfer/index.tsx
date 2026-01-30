import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  ChevronRight,
  FileText,
  Truck,
  User,
  Users,
  Box,
} from "lucide-react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";

const FORM_LINKS = [
  {
    id: "tf-stock-store",
    title: "Transfer Stok Antar Toko",
    description: "Form pengajuan pemindahan stok barang antar cabang",
    icon: Box,
    color: "#3b82f6",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfDUMMY...",
  },
  {
    id: "tf-stock-warehouse",
    title: "Retur ke Gudang",
    description: "Form pengembalian barang dari toko ke gudang pusat",
    icon: Truck,
    color: "#f59e0b",
    url: "https://docs.google.com/forms/d/e/DUMMY-URL-2...",
  },
  {
    id: "tf-asset",
    title: "Mutasi Aset",
    description: "Pemindahan aset inventaris (PC, Rak, AC, dll)",
    icon: FileText,
    color: "#10b981",
    url: "https://docs.google.com/forms/d/e/DUMMY-URL-3...",
  },
  {
    id: "tf-employee-temp",
    title: "Mutasi Karyawan (Sementara)",
    description: "Bantuan operasional toko sementara (< 1 bulan)",
    icon: User,
    color: "#8b5cf6",
    url: "https://docs.google.com/forms/d/e/DUMMY-URL-4...",
  },
  {
    id: "tf-employee-perm",
    title: "Mutasi Karyawan (Permanen)",
    description: "Pindah tugas lokasi kerja secara permanen",
    icon: Users,
    color: "#ec4899",
    url: "https://docs.google.com/forms/d/e/DUMMY-URL-5...",
  },
];

export default function FormTransferScreen() {
  const colorScheme = useColorScheme();

  const handlePress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Form Transfer",
          headerTintColor: "#fff",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerBackground: () => (
            <LinearGradient
              colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerRight: undefined,
        }}
      />

      <ScrollView contentContainerClassName="p-4 gap-3">
        {FORM_LINKS.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="flex-row items-center p-4 bg-card rounded-xl border border-border active:bg-secondary/50"
            activeOpacity={0.7}
            onPress={() => handlePress(item.url)}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <item.icon size={20} color={item.color} />
            </View>
            <View className="flex-1 mr-2">
              <Text className="font-medium text-foreground text-base mb-1">
                {item.title}
              </Text>
              <Text className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </Text>
            </View>
            <ChevronRight size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
