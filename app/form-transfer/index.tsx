import React from "react";
import { View, FlatList, Pressable } from "react-native";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { openExternalUrl } from "@/lib/open-url";
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

  const handlePress = (url: string) => {
    openExternalUrl(url);
  };

  const data =
    activeTab === "afiliasi" ? AFFILIATION_LINKS : NON_AFFILIATION_LINKS;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Form Transfer" onBackPress={() => router.back()} />

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
          <Pressable
            className="flex-row items-center p-4 bg-card rounded-xl border border-border active:bg-secondary/50"
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
          </Pressable>
        )}
      />
    </View>
  );
}
