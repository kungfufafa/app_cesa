import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LocationCheckWebScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: "clock_in" | "clock_out" }>();
  const title = type === "clock_out" ? "Pulang" : "Masuk";

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#3b82f6", "#60a5fa", "#93c5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-72"
      />

      <SafeAreaView className="flex-1 px-5">
        <View className="flex-row items-center justify-between pt-2">
          <Pressable
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30"
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>

          <View className="items-center">
            <Text className="text-white text-base font-semibold">{title}</Text>
            <Text className="text-white/80 text-xs">Langkah 1 dari 2</Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        <View className="flex-1 justify-center">
          <Card className="border-border/70 bg-card/95 py-0">
            <CardContent className="px-5 py-6 gap-4">
              <View className="w-14 h-14 rounded-2xl bg-secondary items-center justify-center self-center">
                <IconSymbol name="mappin.circle.fill" size={28} color="#3b82f6" />
              </View>

              <View className="gap-2">
                <Text className="text-center text-xl font-semibold text-foreground">
                  Pengecekan lokasi tidak tersedia di web
                </Text>
                <Text className="text-center text-sm leading-6 text-muted-foreground">
                  Halaman ini menggunakan integrasi peta native untuk validasi area
                  presensi. Gunakan Android atau iOS untuk melanjutkan proses
                  lokasi dan kamera.
                </Text>
              </View>

              <Button onPress={() => router.replace("/presensi" as never)} size="lg">
                <Text className="font-bold text-primary-foreground">
                  Kembali ke Presensi
                </Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    </View>
  );
}
