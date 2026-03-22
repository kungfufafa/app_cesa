import React from "react";
import { render } from "@testing-library/react-native";

import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  it("builds expected classes for outline small buttons", () => {
    const classes = buttonVariants({ variant: "outline", size: "sm" });

    expect(classes).toContain("border");
    expect(classes).toContain("px-3");
    expect(classes).toContain("rounded-md");
  });

  it("renders a pressable button with the official variant classes", () => {
    const { getByRole } = render(<Button variant="secondary">Simpan</Button>);

    const button = getByRole("button");

    expect(button.props.className).toContain("bg-secondary");
    expect(button.props.className).toContain("h-10");
  });
});
