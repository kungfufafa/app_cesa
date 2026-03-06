import React, { useState } from "react";
import { View, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { IconSymbol } from "@/components/ui/icon-symbol";
import dayjs from "@/lib/dates";

export default function InboxLayout() {
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);
  const [activeTab, setActiveTab] = useState<"permintaan" | "informasi">("permintaan");

  // State untuk data
  const [permintaanItems, setPermintaanItems] = useState([
    {
      id: 1,
      type: "cuti",
      title: "Pengajuan Cuti Tahunan",
      date: "2026-02-13",
      status: "pending",
      description: "Cuti tanggal 15-17 Februari 2026 (3 hari)",
    },
    {
      id: 2,
      type: "lembur",
      title: "Permintaan Lembur",
      date: "2026-02-12",
      status: "approved",
      description: "Lembur 3 jam pada tanggal 14 Februari 2026",
    },
    {
      id: 3,
      type: "cuti",
      title: "Pengajuan Cuti Sakit",
      date: "2026-02-10",
      status: "rejected",
      description: "Cuti sakit tanggal 20 Februari 2026",
    },
    {
      id: 4,
      type: "lembur",
      title: "Permintaan Lembur Weekend",
      date: "2026-02-08",
      status: "approved",
      description: "Lembur 5 jam pada tanggal 10 Februari 2026",
    },
  ]);

  const [informasiItems, setInformasiItems] = useState([
    {
      id: 1,
      title: "Pengumuman Libur Nasional",
      date: "2026-02-13",
      content: "Perhatian: Kantor akan tutup tanggal 17 Februari 2026 dalam rangka hari libur nasional. Harap pastikan semua pekerjaan diselesaikan sebelum tanggal tersebut.",
      isRead: false,
    },
    {
      id: 2,
      title: "Update Sistem Presensi",
      date: "2026-02-10",
      content: "Sistem presensi telah diperbarui dengan fitur deteksi wajah yang lebih akurat. Pastikan foto selfie Anda jelas saat melakukan presensi.",
      isRead: true,
    },
    {
      id: 3,
      title: "Jadwal Meeting Bulanan",
      date: "2026-02-08",
      content: "Meeting bulanan akan dilaksanakan pada tanggal 20 Februari 2026 pukul 10:00 WIB di ruang meeting lantai 3. Harap hadir tepat waktu.",
      isRead: true,
    },
    {
      id: 4,
      title: "Pembagian THR Karyawan",
      date: "2026-02-05",
      content: "Pembagian THR akan dilakukan pada tanggal 25 Februari 2026. Silakan cek slip gaji masing-masing untuk informasi lebih lanjut.",
      isRead: false,
    },
  ]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
            <IconSymbol name="envelope.fill" size={32} color="#71717a" />
          </View>
          <Text variant="h3" className="mb-2">
            Inbox
          </Text>
          <Text variant="muted" className="text-center mb-6">
            Login untuk melihat pesan dan notifikasi
          </Text>
          <Button onPress={() => openSheet()}>
            <Text className="text-primary-foreground">Login</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handlePermintaanPress = (item: any) => {
    Alert.alert(
      item.title,
      `${item.description}\n\nStatus: ${
        item.status === "approved"
          ? "Disetujui"
          : item.status === "rejected"
          ? "Ditolak"
          : "Menunggu"
      }\nTanggal: ${dayjs(item.date).format("DD MMMM YYYY")}`,
      [
        { text: "Tutup", style: "cancel" },
        ...(item.status === "pending"
          ? [
              {
                text: "Batalkan",
                style: "destructive" as const,
                onPress: () => {
                  Alert.alert(
                    "Batalkan Permintaan?",
                    "Apakah Anda yakin ingin membatalkan permintaan ini?",
                    [
                      { text: "Tidak", style: "cancel" },
                      {
                        text: "Ya, Batalkan",
                        style: "destructive",
                        onPress: () => {
                          setPermintaanItems((prev) =>
                            prev.filter((p) => p.id !== item.id)
                          );
                          Alert.alert("Berhasil", "Permintaan telah dibatalkan");
                        },
                      },
                    ]
                  );
                },
              },
            ]
          : []),
      ]
    );
  };

  const handleInformasiPress = (item: any) => {
    // Mark as read
    setInformasiItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i))
    );

    Alert.alert(item.title, `${item.content}\n\nTanggal: ${dayjs(item.date).format("DD MMMM YYYY")}`, [
      { text: "Tutup", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pb-3 pt-2">
        <Text variant="h2" className="mb-4">
          Inbox
        </Text>

        {/* Tab Buttons */}
        <View className="flex-row bg-secondary rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("permintaan")}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-md",
              activeTab === "permintaan" && "bg-card shadow-sm"
            )}
          >
            <Text
              className={cn(
                "text-center font-semibold",
                activeTab === "permintaan" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Permintaan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("informasi")}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-md",
              activeTab === "informasi" && "bg-card shadow-sm"
            )}
          >
            <Text
              className={cn(
                "text-center font-semibold",
                activeTab === "informasi" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Informasi
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "permintaan" ? (
          <PermintaanTab items={permintaanItems} onPress={handlePermintaanPress} />
        ) : (
          <InformasiTab items={informasiItems} onPress={handleInformasiPress} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Permintaan Tab Component
function PermintaanTab({ items, onPress }: { items: any[]; onPress: (item: any) => void }) {
  if (items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6 py-20 min-h-[400]">
        <Text className="text-5xl mb-4">📋</Text>
        <Text variant="h3" className="mb-2 text-center">
          Tidak Ada Permintaan
        </Text>
        <Text variant="muted" className="text-center">
          Semua permintaan Anda akan muncul di sini
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 pb-4 pt-2">
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onPress(item)}
          activeOpacity={0.7}
        >
          <View className="bg-card border border-border rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="font-semibold text-foreground">
                  {item.title}
                </Text>
              </View>
              <View
                className={cn(
                  "px-2 py-1 rounded-full",
                  item.status === "approved"
                    ? "bg-green-100"
                    : item.status === "rejected"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-medium",
                    item.status === "approved"
                      ? "text-green-700"
                      : item.status === "rejected"
                      ? "text-red-700"
                      : "text-yellow-700"
                  )}
                >
                  {item.status === "approved"
                    ? "Disetujui"
                    : item.status === "rejected"
                    ? "Ditolak"
                    : "Menunggu"}
                </Text>
              </View>
            </View>
            <Text variant="muted" className="text-sm mb-1">
              {item.description}
            </Text>
            <Text variant="muted" className="text-xs">
              {dayjs(item.date).format("DD MMM YYYY")}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Informasi Tab Component
function InformasiTab({ items, onPress }: { items: any[]; onPress: (item: any) => void }) {
  if (items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6 py-20 min-h-[400]">
        <Text className="text-5xl mb-4">📰</Text>
        <Text variant="h3" className="mb-2 text-center">
          Tidak Ada Informasi
        </Text>
        <Text variant="muted" className="text-center">
          Pengumuman dan informasi akan muncul di sini
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 pb-4 pt-2">
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onPress(item)}
          activeOpacity={0.7}
        >
          <View
            className={cn(
              "bg-card border border-border rounded-lg p-4 mb-3",
              !item.isRead && "border-l-4 border-l-primary"
            )}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-semibold text-foreground flex-1">
                {item.title}
              </Text>
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-primary ml-2" />
              )}
            </View>
            <Text variant="muted" className="text-sm mb-2" numberOfLines={2}>
              {item.content}
            </Text>
            <Text variant="muted" className="text-xs">
              {dayjs(item.date).format("DD MMM YYYY")}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
