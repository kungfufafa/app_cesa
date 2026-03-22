// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

const legacyUiPathEntries = [
  "@/components/ui/Button",
  "@/components/ui/Input",
  "@/components/ui/BottomSheet",
  "@/components/ui/ScreenHeader",
  "@/components/ui/SheetTextInput",
  "@/components/ui/ErrorBoundary",
].map((name) => ({
  name,
  message: "Gunakan lowercase ui import paths.",
}));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "expo-router",
              message: "UI primitives harus prop-driven. Jangan import expo-router di components/ui.",
            },
          ],
          patterns: [
            {
              group: ["@/store/**"],
              message: "UI primitives tidak boleh import store.",
            },
            {
              group: ["@/services/**"],
              message: "UI primitives tidak boleh import service.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: ["app/(tabs)/_layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["TouchableOpacity"],
              message: "Gunakan Button, Pressable, atau exception interop yang terdokumentasi.",
            },
            ...legacyUiPathEntries,
          ],
        },
      ],
    },
  },
  {
    files: ["app/(tabs)/_layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: legacyUiPathEntries,
        },
      ],
    },
  },
]);
