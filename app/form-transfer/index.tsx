import React from "react";
import { View, FlatList, TouchableOpacity, Pressable, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import formTransferData from "@/assets/data/form-transfer.json";

type FormLink = {
  id: string;
  title: string;
  description: string;
  url: string;
};

type FormTransferItem = {
  name: string;
  url: string;
  source?: string;
};

type FormTransferJson = {
  affiliations: FormTransferItem[];
  non_affiliations: FormTransferItem[];
};

const formTransfer = formTransferData as unknown as FormTransferJson;

const toId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AFFILIATION_LINKS: FormLink[] = (formTransfer.affiliations ?? []).map(
  (item) => ({
    id: toId(item.name),
    title: item.name,
    description: item.source ?? "Google Form",
    url: item.url,
  })
);

const NON_AFFILIATION_LINKS: FormLink[] = (formTransfer.non_affiliations ?? []).map(
  (item) => ({
    id: toId(item.name),
    title: item.name,
    description: item.source ?? "Google Form",
    url: item.url,
  })
);


type TabKey = "afiliasi" | "non-afiliasi";

export default function FormTransferScreen() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("non-afiliasi");
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Tidak bisa membuka tautan ini.");
    }
  };

  const data =
    activeTab === "afiliasi" ? AFFILIATION_LINKS : NON_AFFILIATION_LINKS;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4"
        style={{ paddingTop: insets.top, paddingBottom: 8 }}
      >
        <View className="flex-row items-center">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
            accessibilityRole="button"
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-white text-base font-semibold">Form Transfer</Text>
          </View>
          <View className="w-9 h-9" />
        </View>
      </LinearGradient>

      <View className="px-4 pt-2 pb-2 bg-background">
        <View className="flex-row bg-muted/40 rounded-xl p-1 border border-border">
          <Pressable
            className={`flex-1 py-2 rounded-lg ${
              activeTab === "non-afiliasi" ? "bg-card" : ""
            }`}
            onPress={() => setActiveTab("non-afiliasi")}
            android_ripple={{ color: "#e5e7eb" }}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeTab === "non-afiliasi"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Non Afiliasi
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-lg ${
              activeTab === "afiliasi" ? "bg-card" : ""
            }`}
            onPress={() => setActiveTab("afiliasi")}
            android_ripple={{ color: "#e5e7eb" }}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeTab === "afiliasi"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Afiliasi
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        key={activeTab}
        data={data}
        extraData={activeTab}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-2"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="font-medium text-foreground mb-1">
              Belum ada data {activeTab === "afiliasi" ? "afiliasi" : "non afiliasi"}
            </Text>
            <Text className="text-xs text-muted-foreground text-center">
              Silakan tambahkan daftar form di tab ini.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center p-4 bg-card rounded-xl border border-border active:bg-secondary/50"
            activeOpacity={0.7}
            onPress={() => handlePress(item.url)}
          >
            <View className="flex-1 mr-2">
              <Text className="font-medium text-foreground text-base mb-1">
                {item.title}
              </Text>
              <Text className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#a1a1aa" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
