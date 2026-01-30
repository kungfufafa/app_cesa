import { Tabs } from "expo-router";
import React from "react";
import { View, TouchableOpacity } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRequestBottomSheet } from "@/store/useRequestBottomSheet";
import { Plus } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const openRequestSheet = useRequestBottomSheet((s) => s.open);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="employee"
        options={{
          title: "Employee",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.2.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="request"
        options={{
          title: "Request",
          tabBarButton: (props: any) => (
            <TouchableOpacity
              {...props}
              className="justify-center items-center"
              style={{
                top: -20,
                ...(props.style as any),
              }}
              onPress={(e: any) => {
                e.preventDefault();
                openRequestSheet();
              }}
            >
              <View className="w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg">
                <Plus size={28} color="white" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="tray.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
