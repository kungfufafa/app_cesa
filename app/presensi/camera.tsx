import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { submitPresensi } from "@/services/presensi/presensi";
import { useSchedule } from "@/hooks/presensi/usePresensiQueries";
import { normalizeApiError } from "@/lib/api-errors";
import dayjs from "@/lib/dates";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  NativeModules,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ABSOLUTE_FILL = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const detectFaceCount = async (photoUri: string): Promise<number | null> => {
  if (!NativeModules.FaceDetection) {
    return null;
  }

  try {
    const { default: FaceDetection } = await import(
      "@react-native-ml-kit/face-detection"
    );
    const faces = await FaceDetection.detect(photoUri, {
      landmarkMode: "none",
      contourMode: "none",
      classificationMode: "none",
      performanceMode: "fast",
      minFaceSize: 0.15,
    });

    return faces.length;
  } catch {
    return null;
  }
};

const getPresensiLocation = async () => {
  const currentPermission = await Location.getForegroundPermissionsAsync();
  const permission = currentPermission.granted
    ? currentPermission
    : await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  if (
    !Number.isFinite(location.coords.latitude) ||
    !Number.isFinite(location.coords.longitude)
  ) {
    throw new Error("Lokasi tidak valid.");
  }

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    isMockLocation: (location.coords as { mocked?: boolean }).mocked === true,
  };
};

export default function FaceCaptureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type: "clock_in" | "clock_out" }>();
  const type = params.type || "clock_in";
  const title = type === "clock_out" ? "Pulang" : "Masuk";
  const queryClient = useQueryClient();

  const { data: schedule } = useSchedule();
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const maskWidth = width * 0.65;
  const maskHeight = maskWidth * 1.35;
  const borderRadius = maskWidth / 2;

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Spinner size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background px-4 justify-center">
        <Card className="border-border">
          <CardContent className="items-center px-6 py-8">
            <View className="w-16 h-16 bg-secondary rounded-full items-center justify-center mb-4">
              <Ionicons name="camera" size={30} color="#6b7280" />
            </View>
            <Text className="text-foreground text-lg font-semibold text-center mb-2">
              Akses Kamera Diperlukan
            </Text>
            <Text className="text-muted-foreground text-center mb-6">
              Presensi membutuhkan selfie untuk proses verifikasi Masuk/Pulang.
            </Text>

            <Button onPress={requestPermission} size="lg" className="w-full">
              <Text className="text-primary-foreground font-bold">
                Izinkan Kamera
              </Text>
            </Button>

            <Button variant="link" onPress={() => router.back()} className="mt-2">
              <Text className="text-muted-foreground font-medium">Kembali</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (isSubmitting || !cameraRef.current) return;

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error("Gagal mengambil foto");
      }

      const faceCount = await detectFaceCount(photo.uri);
      if (faceCount === 0) {
        Alert.alert(
          "Wajah Tidak Terdeteksi",
          "Pastikan wajah Anda terlihat jelas di dalam area oval dan coba lagi.",
        );
        setIsSubmitting(false);
        return;
      }

      const location = await getPresensiLocation();
      if (!location) {
        Alert.alert(
          "Izin Diperlukan",
          "Presensi membutuhkan akses Lokasi. Aktifkan izin lokasi untuk melanjutkan.",
        );
        setIsSubmitting(false);
        return;
      }

      await submitPresensi({
        action: type,
        photoUri: photo.uri,
        latitude: location.latitude,
        longitude: location.longitude,
        isMockLocation: location.isMockLocation,
      });
      await queryClient.invalidateQueries({ queryKey: ["presensi"] });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Berhasil", `Presensi ${title.toLowerCase()} berhasil dikirim.`, [
        { text: "OK", onPress: () => router.navigate("/presensi" as never) },
      ]);
    } catch (error) {
      if (__DEV__) console.warn("Gagal mengirim presensi", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Gagal", normalizeApiError(error, "Gagal mengirim presensi. Silakan coba lagi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTime = schedule?.shift.start_time?.slice(0, 5) || "--:--";
  const endTime = schedule?.shift.end_time?.slice(0, 5) || "--:--";

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={ABSOLUTE_FILL}
        facing="front"
        animateShutter={false}
      />

      <View style={ABSOLUTE_FILL}>
        <View className="flex-[1.35] bg-black/50" />

        <View className="flex-row">
          <View className="flex-1 bg-black/50" />

          <View
            style={{ width: maskWidth, height: maskHeight, borderRadius }}
            className="bg-transparent border-2 border-dashed border-white/80 items-center justify-end pb-4"
          >
            <Ionicons
              name="person-outline"
              size={46}
              color="rgba(255,255,255,0.32)"
            />
          </View>

          <View className="flex-1 bg-black/50" />
        </View>

        <View className="flex-1 bg-black/50" />
      </View>

      <LinearGradient
        colors={["#3b82f6F2", "#60a5faD9", "#93c5fdC0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 px-4"
        style={{ paddingTop: insets.top, paddingBottom: 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </Pressable>

          <View className="items-center">
            <Text className="text-white text-base font-semibold">{title}</Text>
            <Text className="text-white/80 text-xs">Langkah 2 dari 2</Text>
          </View>

          <View className="w-9 h-9" />
        </View>
      </LinearGradient>

      <View
        className="absolute left-4 right-4"
        style={{ bottom: insets.bottom + 16 }}
      >
        <Card className="border-border/70 bg-card/95 py-0">
          <CardContent className="px-4 py-4">
            <Text variant="small" className="text-muted-foreground">
              {dayjs().format("dddd, D MMMM YYYY")}
            </Text>

            <View className="flex-row items-center justify-between mt-1 mb-4">
              <Text className="text-foreground font-bold text-base">
                {startTime} - {endTime}
              </Text>
              <View className="bg-secondary px-3 py-1 rounded-full border border-border">
                <Text className="text-xs font-semibold text-foreground">
                  {schedule?.shift.name || "Shift"}
                </Text>
              </View>
            </View>

            <Button onPress={handleSubmit} disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <Spinner color="#fff" />
              ) : (
                <Text className="text-primary-foreground font-bold">
                  Kirim Presensi
                </Text>
              )}
            </Button>
          </CardContent>
        </Card>
      </View>
    </View>
  );
}
