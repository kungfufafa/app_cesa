import React from "react";
import { render } from "@testing-library/react-native";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

describe("Input", () => {
  it("renders textarea with multiline behavior and shared classes", () => {
    const { getByDisplayValue } = render(
      <Textarea value="Butuh deskripsi" onChangeText={jest.fn()} />,
    );

    const textarea = getByDisplayValue("Butuh deskripsi");

    expect(textarea.props.multiline).toBe(true);
    expect(textarea.props.className).toContain("border-input");
    expect(textarea.props.className).toContain("min-h-16");
  });

  it("renders input with the base text field classes", () => {
    const { getByDisplayValue } = render(
      <Input value="Halo" onChangeText={jest.fn()} />,
    );

    const input = getByDisplayValue("Halo");

    expect(input.props.className).toContain("border-input");
    expect(input.props.className).toContain("h-10");
    expect(input.props.className).toContain("bg-background");
  });
});
