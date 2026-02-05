// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolWeight, SymbolViewProps } from "expo-symbols";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconMapping = Partial<
  Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>
>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "clock.fill": "schedule",
  clock: "schedule",
  calendar: "calendar-today",
  "person.fill": "person",
  gear: "settings",
  "questionmark.circle": "help-outline",
  "rectangle.portrait.and.arrow.right": "logout",
  "person.2.fill": "groups",
  "tray.fill": "inbox",
  plus: "add",
  "envelope.fill": "email",
  "phone.fill": "phone",
  "message.fill": "message",
  "arrow.left.arrow.right": "swap-horiz",
  "megaphone.fill": "campaign",
  nosign: "block",
  "cart.fill": "shopping-cart",
  headphones: "headset-mic",
  scope: "my-location",
  "shippingbox.fill": "inventory",
  ellipsis: "more-horiz",
  "doc.text.fill": "description",
  "truck.box.fill": "local-shipping",
  xmark: "close",
  "camera.rotate": "flip-camera-ios",
  eye: "visibility",
  "eye.slash": "visibility-off",
} as const satisfies IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
