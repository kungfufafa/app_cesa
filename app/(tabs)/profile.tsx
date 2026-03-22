import React, { useState } from "react";
import { View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spinner } from "@/components/ui/spinner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { SUPPORT_CONTACT } from "@/constants/config";
import { openExternalUrl } from "@/lib/open-url";
import { normalizeApiError } from "@/lib/api-errors";
import dayjs from "@/lib/dates";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const signOutAll = useAuthStore((s) => s.signOutAll);
  const refreshCurrentUser = useAuthStore((s) => s.refreshCurrentUser);
  const authNotice = useAuthStore((s) => s.authNotice);
  const clearAuthNotice = useAuthStore((s) => s.clearAuthNotice);
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);
  const [activeAction, setActiveAction] = useState<"refresh" | "sign_out" | "sign_out_all" | null>(null);
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
            <IconSymbol name="person.fill" size={32} color="#71717a" />
          </View>
          <Text variant="h3" className="mb-2">
            Tamu
          </Text>
          <Text variant="muted" className="text-center mb-6">
            Login untuk melihat profil dan pengaturan
          </Text>
          <Button onPress={() => openSheet()}>
            <Text className="text-primary-foreground">Login</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert("Keluar", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          try {
            setActiveAction("sign_out");
            await signOut();
          } catch (e) {
            if (__DEV__) console.warn("Gagal keluar", e);
          } finally {
            setActiveAction(null);
          }
        },
      },
    ]);
  };

  const handleSignOutAll = () => {
    Alert.alert(
      "Keluar dari Semua Perangkat",
      "Semua sesi login Anda akan dihapus. Anda perlu login ulang di perangkat lain. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar Semua",
          style: "destructive",
          onPress: async () => {
            try {
              setActiveAction("sign_out_all");
              await signOutAll();
            } catch (e) {
              Alert.alert("Gagal", normalizeApiError(e, "Gagal keluar dari semua perangkat."));
            } finally {
              setActiveAction(null);
            }
          },
        },
      ]
    );
  };

  const handleRefreshProfile = async () => {
    try {
      setActiveAction("refresh");
      await refreshCurrentUser();
      Alert.alert("Berhasil", "Data akun berhasil disinkronkan.");
    } catch (error) {
      Alert.alert("Gagal", normalizeApiError(error, "Gagal menyinkronkan data akun."));
    } finally {
      setActiveAction(null);
    }
  };

  const handleOpenDeveloperWhatsApp = () => {
    openExternalUrl(`https://wa.me/${SUPPORT_CONTACT.whatsapp}`, {
      fallbackTitle: "Kesalahan",
      fallbackMessage: "WhatsApp tidak dapat dibuka di perangkat ini.",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const name = user?.name?.trim() || "";
  const email = user?.email?.trim() || "";
  const displayName = name || email || "Pengguna";
  const displayEmail = email || "email@example.com";
  const defaultCompanyName = user?.default_company?.name || "Belum diatur";
  const allowedCompanyCount = user?.allowed_companies?.length ?? 0;
  const accessTokenName = user?.current_access_token?.name || "Perangkat aktif";
  const accessTokenCreatedAt = user?.current_access_token?.created_at
    ? dayjs(user.current_access_token.created_at).format("DD MMM YYYY, HH:mm")
    : "-";
  const accessTokenLastUsedAt = user?.current_access_token?.last_used_at
    ? dayjs(user.current_access_token.last_used_at).format("DD MMM YYYY, HH:mm")
    : "Belum ada";
  const resourcePermission = user?.resource_permission || "unknown";
  const isAccountActive = user?.is_active !== false;
  const isBusy = activeAction !== null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 p-4 gap-6">
        <Card className="py-0">
          <CardContent className="flex-row items-center justify-between py-6 gap-4">
            <View className="flex-1">
              <Text variant="large" className="mb-1">
                {displayName}
              </Text>
              <Text variant="muted" className="mb-1">
                {displayEmail}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                <Badge variant="secondary" className={isAccountActive ? "bg-emerald-100" : "bg-rose-100"}>
                  <Text className={isAccountActive ? "text-emerald-700" : "text-rose-700"}>
                    {isAccountActive ? "Aktif" : "Nonaktif"}
                  </Text>
                </Badge>
                <Badge variant="outline">
                  <Text className="capitalize">{resourcePermission}</Text>
                </Badge>
              </View>
            </View>
            <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center border border-border">
              <Text variant="h3">{getInitials(displayName)}</Text>
            </View>
          </CardContent>
        </Card>

        {authNotice ? (
          <Card className="py-0 border-amber-200 bg-amber-50">
            <CardContent className="py-4 gap-3">
              <Text className="text-sm leading-6 text-amber-900">{authNotice}</Text>
              <Button variant="outline" size="sm" onPress={clearAuthNotice}>
                <Text className="font-semibold">Tutup Pesan</Text>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="py-0">
          <CardContent className="py-5 gap-4">
            <Text className="font-semibold">Info Akun</Text>
            <InfoRow label="Bahasa" value={user?.language || "id"} />
            <InfoRow label="Perusahaan Default" value={defaultCompanyName} />
            <InfoRow label="Perusahaan Diizinkan" value={`${allowedCompanyCount} perusahaan`} />
            <InfoRow label="Role" value={`${user?.roles?.length ?? 0} role`} />
            <InfoRow label="Permission" value={`${user?.permissions?.length ?? 0} permission`} />
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="py-5 gap-4">
            <Text className="font-semibold">Sesi Perangkat</Text>
            <InfoRow label="Nama Device" value={accessTokenName} />
            <InfoRow label="Dibuat" value={accessTokenCreatedAt} />
            <InfoRow label="Terakhir Digunakan" value={accessTokenLastUsedAt} />
            <Button
              variant="outline"
              onPress={handleRefreshProfile}
              disabled={isBusy}
            >
              {activeAction === "refresh" ? (
                <Spinner size="small" />
              ) : (
                <Text className="font-semibold">Sinkronkan Data Akun</Text>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="py-0 gap-0">
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={handleOpenDeveloperWhatsApp}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name="questionmark.circle"
                size={20}
                color="#71717a"
              />
              <Text>Bantuan & Dukungan</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color="#a1a1aa" />
          </Button>
        </Card>

        <Card className="py-0 gap-0">
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={handleSignOut}
            disabled={isBusy}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={20}
                color="#ef4444"
              />
              <Text className="text-destructive">Keluar</Text>
            </View>
            {activeAction === "sign_out" ? (
              <Spinner size="small" />
            ) : null}
          </Button>
          <Separator className="my-0" />
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={handleSignOutAll}
            disabled={isBusy}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name="person.2.fill"
                size={20}
                color="#ef4444"
              />
              <Text className="text-destructive">Keluar dari Semua Perangkat</Text>
            </View>
            {activeAction === "sign_out_all" ? (
              <Spinner size="small" />
            ) : null}
          </Button>
        </Card>

        <Text variant="muted" className="text-center text-xs mt-auto">
          Versi 1.0.0
        </Text>
        <Text variant="muted" className="text-center text-xs -mt-4">
          Dikembangkan oleh{" "}
          <Text
            className="text-primary font-semibold text-xs"
            onPress={handleOpenDeveloperWhatsApp}
          >
            Tim Pengembang Web App
          </Text>
          {" • Didukung oleh Divisi IT Support"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="font-medium">{value}</Text>
    </View>
  );
}
