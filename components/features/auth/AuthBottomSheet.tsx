import { Button } from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthBottomSheet } from "@/store/useAuthBottomSheet";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AuthBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { isOpen, close, executeCallback } = useAuthBottomSheet();
  const signIn = useAuthStore((s) => s.signIn);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ["60%", "80%"], []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setIsPasswordVisible(false);
    setErrors([]);
  };

  const normalizeErrorList = (message: string | string[]) =>
    (Array.isArray(message) ? message : message.split("\n"))
      .map((item) => item.trim())
      .filter(Boolean);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrors(["Mohon isi semua field"]);
      return;
    }
    setErrors([]);
    setIsLoading(true);
    try {
      const result = await signIn({ email, password });
      if (result.ok) {
        close();
        executeCallback();
        resetForm();
        return;
      }

      const messageSource =
        result.error.messages ??
        result.error.message ??
        "Login gagal. Coba lagi.";
      setErrors(normalizeErrorList(messageSource));
    } catch {
      setErrors(normalizeErrorList("Login gagal. Coba lagi."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    close();
    resetForm();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((current) => !current);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
      backgroundStyle={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors[colorScheme ?? "light"].icon,
      }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView className="flex-1 px-6 pt-2">
        <BottomSheetScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="items-center mb-6">
            <Text className="text-xl font-semibold text-foreground">
              Login untuk melanjutkan
            </Text>
            <Text className="text-muted-foreground text-center mt-1">
              Masuk ke akun untuk akses fitur
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-1.5">
              <Label>Email</Label>
              <BottomSheetTextInput
                placeholder="name@mail.com"
                placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-background"
              />
            </View>

            <View className="gap-1.5">
              <Label>Password</Label>
              <View className="flex-row items-center border border-border rounded-lg px-4 py-3 bg-background">
                <BottomSheetTextInput
                  placeholder="••••••••"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-foreground"
                />
                <Pressable
                  onPress={togglePasswordVisibility}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="pl-3"
                >
                  <IconSymbol
                    name={isPasswordVisible ? "eye.slash" : "eye"}
                    size={20}
                    color={Colors[colorScheme ?? "light"].icon}
                  />
                </Pressable>
              </View>
            </View>

            {errors.length > 0 ? (
              <View className="gap-1">
                {errors.map((item, index) => (
                  <Text
                    key={`${item}-${index}`}
                    className="text-destructive text-sm"
                  >
                    {item}
                  </Text>
                ))}
              </View>
            ) : null}

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              size="lg"
              className="mt-2"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-primary-foreground font-bold">
                  Masuk
                </Text>
              )}
            </Button>

            <Text className="text-center text-muted-foreground text-sm mt-2">
              Lupa password? Hubungi Admin
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
