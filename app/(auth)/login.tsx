import React, { useState } from "react";
import "@/global.css";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Hexagon } from "lucide-react-native";

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await signIn({ email, password });
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow justify-center px-8 pb-10">
          <View className="items-center mb-12">
            <View className="mb-8 p-4 rounded-3xl bg-secondary/50 border border-border">
              <Hexagon size={42} strokeWidth={1.5} color="#fff" />
            </View>
            <Text variant="h3" className="mb-2">
              Welcome back
            </Text>
            <Text variant="muted" className="text-center">
              Enter your credentials to access your workspace
            </Text>
          </View>

          <View className="w-full gap-5">
            <View className="gap-4">
              <View className="gap-1.5">
                <Label nativeID="email">Email</Label>
                <Input
                  placeholder="name@work.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  aria-labelledby="email"
                  className={error ? "border-destructive" : undefined}
                />
                {error ? (
                  <Text className="text-xs text-destructive">{error}</Text>
                ) : null}
              </View>
              <View className="gap-1.5">
                <Label nativeID="password">Password</Label>
                <Input
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  aria-labelledby="password"
                />
              </View>
            </View>

            <View className="items-end">
              <Button variant="link">
                <Text>Forgot password?</Text>
              </Button>
            </View>

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text>Log in</Text>
              )}
            </Button>
          </View>

          <View className="flex-row justify-center items-center mt-8">
            <Text variant="muted">Don't have an account?</Text>
            <Button variant="link" className="px-1">
              <Text>Contact Admin</Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
