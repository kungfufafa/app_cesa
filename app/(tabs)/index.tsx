import React from "react";
import { View, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/useAuthStore";
import { ServiceGrid } from "@/components/features/home/ServiceGrid";
import { MoreServicesSheet } from "@/components/features/home/MoreServicesSheet";
import { getGreeting } from "@/lib/utils";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

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
          data={[]}
          keyExtractor={(_, index) => String(index)}
          renderItem={() => null}
          contentContainerClassName="pb-10"
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

                <View className="mt-5 rounded-xl border border-border bg-muted/40 px-4 py-3">
                  <Text className="text-xs text-muted-foreground leading-5">
                    Aplikasi ini masih dalam tahap uji coba dan pengembangan.
                    Fitur dapat berubah sewaktu-waktu dan belum siap digunakan
                    untuk produksi.
                  </Text>
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
