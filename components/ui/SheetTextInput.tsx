import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React from "react";
import { Platform, TextInput } from "react-native";

type SheetTextInputProps = Omit<
  React.ComponentProps<typeof BottomSheetTextInput>,
  "ref"
>;

export function SheetTextInput(props: SheetTextInputProps) {
  if (Platform.OS === "web") {
    return <TextInput {...props} />;
  }

  return <BottomSheetTextInput {...props} />;
}
