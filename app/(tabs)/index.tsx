import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/useAuthStore";
import { ServiceGrid } from "@/components/features/home/ServiceGrid";
import {
  AnnouncementCard,
  Announcement,
} from "@/components/features/home/AnnouncementCard";
import { MoreServicesSheet } from "@/components/features/home/MoreServicesSheet";
import { Megaphone } from "lucide-react-native";
import "@/lib/icons";
import { getGreeting } from "@/lib/utils";

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    type: "info",
    title: "Libur Natal & Tahun Baru 2025",
    date: "2024-12-20",
    preview:
      "Kantor akan tutup pada tanggal 25 Desember 2024 dan 1 Januari 2025. Selamat berlibur!",
  },
  {
    id: "2",
    type: "warning",
    title: "Maintenance System HRIS",
    date: "2024-12-18",
    preview:
      "Akan ada maintenance pada sistem HRIS pada tanggal 22 Desember 2024 pukul 22:00 - 02:00 WIB.",
  },
  {
    id: "3",
    type: "info",
    title: "Update Kebijakan Cuti 2025",
    date: "2024-12-15",
    preview:
      "Kebijakan cuti tahunan akan diperbarui mulai Januari 2025. Silakan cek email untuk detail.",
  },
];

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderAnnouncement = React.useCallback(
    ({ item }: { item: Announcement }) => (
      <View className="px-4">
        <AnnouncementCard announcement={item} />
      </View>
    ),
    []
  );

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-56"
      />

      <SafeAreaView className="flex-1">
        <FlatList
          data={ANNOUNCEMENTS}
          keyExtractor={(item) => item.id}
          renderItem={renderAnnouncement}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerClassName="pb-10"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              <View className="px-5 pt-2 pb-8">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-xl font-semibold text-white tracking-tight">
                      {getGreeting()}, {user?.name?.split(" ")[0] || "User"}
                    </Text>
                    <Text className="text-sm text-white/80">
                      Mau ngapain hari ini?
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30">
                    <Text className="text-white text-sm font-medium">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="px-4 -mt-2">
                <ServiceGrid />

                <View className="mt-6">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Megaphone size={16} className="text-muted-foreground" />
                    <Text className="text-sm font-medium text-foreground">
                      Pengumuman
                    </Text>
                  </View>
                </View>
              </View>
            </>
          }
        />
      </SafeAreaView>
      <MoreServicesSheet />
    </View>
  );
}
