import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { ScreenHeader } from "@/components/ui/screen-header";

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: () => null,
}));

describe("ScreenHeader", () => {
  it("calls the provided back handler", () => {
    const onBackPress = jest.fn();
    const { getByLabelText } = render(
      <ScreenHeader title="Detail Tiket" onBackPress={onBackPress} />,
    );

    fireEvent.press(getByLabelText("Kembali"));

    expect(onBackPress).toHaveBeenCalledTimes(1);
  });
});
