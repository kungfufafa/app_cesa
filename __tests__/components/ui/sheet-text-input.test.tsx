import React from "react";
import { TextInput, View } from "react-native";

import { SheetTextInput } from "@/components/ui/sheet-text-input";

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { TextInput, View } = require("react-native");

  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: React.forwardRef(({ children }: { children?: React.ReactNode }, _ref: any) => (
      <View>{children}</View>
    )),
    BottomSheetScrollView: View,
    BottomSheetTextInput: React.forwardRef(
      (props: any, ref: any) => <TextInput ref={ref} {...props} />,
    ),
    BottomSheetView: View,
  };
});

describe("SheetTextInput", () => {
  it("passes through input props while applying shared classes", () => {
    const element = (SheetTextInput as unknown as { render: Function }).render(
      {
        value: "15",
        onChangeText: jest.fn(),
        placeholder: "Menit",
        multiline: true,
      },
      null,
    );

    expect(element.props.placeholder).toBe("Menit");
    expect(element.props.multiline).toBe(true);
    expect(element.props.className).toContain("border-input");
    expect(element.props.className).toContain("min-h-16");
  });
});
