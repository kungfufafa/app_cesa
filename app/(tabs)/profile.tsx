import React from "react";
import { View, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { isAuthenticated } = useRequireAuth();
  const openSheet = useAuthBottomSheet((s) => s.open);
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4 border border-border">
            <IconSymbol name="person.fill" size={32} color="#71717a" />
          </View>
          <Text variant="h3" className="mb-2">
            Guest
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
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut().catch((e) => {
            if (__DEV__) console.warn("Sign out failed", e);
          });
        },
      },
    ]);
  };

  const handleOpenDeveloperWhatsApp = async () => {
    const whatsappUrl = "https://wa.me/62895636786435";
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (!canOpen) {
        Alert.alert("Error", "WhatsApp tidak dapat dibuka di perangkat ini.");
        return;
      }
      await Linking.openURL(whatsappUrl);
    } catch {
      Alert.alert("Error", "Gagal membuka WhatsApp.");
    }
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
  const displayName = name || email || "User";
  const displayEmail = email || "email@example.com";

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
            </View>
            <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center border border-border">
              <Text variant="h3">{getInitials(displayName)}</Text>
            </View>
          </CardContent>
        </Card>

        <Card className="py-0 gap-0">
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature is under development")
            }
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="person.fill" size={20} color="#71717a" />
              <Text>Edit Profile</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color="#a1a1aa" />
          </Button>
          <Separator className="my-0" />
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature is under development")
            }
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="gear" size={20} color="#71717a" />
              <Text>Settings</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color="#a1a1aa" />
          </Button>
          <Separator className="my-0" />
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature is under development")
            }
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name="questionmark.circle"
                size={20}
                color="#71717a"
              />
              <Text>Help & Support</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color="#a1a1aa" />
          </Button>
        </Card>

        <Card className="py-0 gap-0">
          <Button
            variant="ghost"
            className="justify-between px-4 py-4 rounded-none"
            onPress={handleSignOut}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={20}
                color="#ef4444"
              />
              <Text className="text-destructive">Sign Out</Text>
            </View>
          </Button>
        </Card>

        <Text variant="muted" className="text-center text-xs mt-auto">
          Version 1.0.0
        </Text>
        <Text variant="muted" className="text-center text-xs -mt-4">
          Engineered by{" "}
          <Text
            className="text-primary font-semibold text-xs"
            onPress={handleOpenDeveloperWhatsApp}
          >
            Web App Developer
          </Text>
          {" • Supported by IT Support Division"}
        </Text>
      </View>
    </SafeAreaView>
  );
}
