import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRequestBottomSheet } from "@/store/useRequestBottomSheet";
import {
  PRIMARY_GRADIENT,
  PRIMARY_GRADIENT_LOCATIONS,
} from "@/components/ui/Button";

export default function TabLayout() {
  const openRequestSheet = useRequestBottomSheet((s) => s.open);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_GRADIENT[1],
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
              className="justify-center items-center -top-5"
              style={props.style as any}
              onPress={(e: any) => {
                e.preventDefault();
                openRequestSheet();
              }}
            >
              <LinearGradient
                colors={PRIMARY_GRADIENT}
                locations={PRIMARY_GRADIENT_LOCATIONS}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="w-14 h-14 rounded-full justify-center items-center shadow-lg"
              >
                <IconSymbol size={28} name="plus" color="white" />
              </LinearGradient>
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
