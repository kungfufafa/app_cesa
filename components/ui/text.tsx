import { cn } from "@/lib/utils";
import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, Text as RNText, type Role } from "react-native";

const textVariants = cva(
  cn(
    "text-foreground text-base",
    Platform.select({
      web: "select-text",
    }),
  ),
  {
    variants: {
      variant: {
        default: "",
        h1: cn(
          "text-center text-4xl font-extrabold tracking-tight",
          Platform.select({ web: "scroll-m-20 text-balance" }),
        ),
        h2: cn(
          "border-border border-b pb-2 text-3xl font-semibold tracking-tight",
          Platform.select({ web: "scroll-m-20 first:mt-0" }),
        ),
        h3: cn(
          "text-2xl font-semibold tracking-tight",
          Platform.select({ web: "scroll-m-20" }),
        ),
        h4: cn(
          "text-xl font-semibold tracking-tight",
          Platform.select({ web: "scroll-m-20" }),
        ),
        p: "mt-3 leading-7 sm:mt-6",
        blockquote: "mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6",
        code: cn(
          "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        ),
        lead: "text-muted-foreground text-xl",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-muted-foreground text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps["variant"]>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  blockquote: Platform.select({ web: "blockquote" as Role }),
  code: Platform.select({ web: "code" as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
};

const TextClassContext = React.createContext<string | undefined>(undefined);

const MONOSPACE_FONT = Platform.select({
  web: "SFMono-Regular",
  default: "Menlo",
}) as string;

const FONT_FAMILY_BY_VARIANT: Record<TextVariant, string> = {
  default: "Inter_400Regular",
  h1: "Inter_700Bold",
  h2: "Inter_600SemiBold",
  h3: "Inter_600SemiBold",
  h4: "Inter_600SemiBold",
  p: "Inter_400Regular",
  blockquote: "Inter_500Medium",
  code: MONOSPACE_FONT,
  lead: "Inter_500Medium",
  large: "Inter_600SemiBold",
  small: "Inter_500Medium",
  muted: "Inter_500Medium",
};

function Text({
  className,
  asChild = false,
  variant = "default",
  style,
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean;
  }) {
  /* eslint-disable react-hooks/exhaustive-deps */
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  let fontFamily =
    FONT_FAMILY_BY_VARIANT[variant ?? "default"] ??
    FONT_FAMILY_BY_VARIANT.default;

  // Manual overflow for font-weight classes since we use custom fonts
  // and RN doesn't always handle font-weight mapping correctly for non-system fonts
  const combinedClass = `${className || ""} ${textClass || ""}`;
  if (combinedClass.includes("font-bold")) {
    fontFamily = "Inter_700Bold";
  } else if (combinedClass.includes("font-semibold")) {
    fontFamily = "Inter_600SemiBold";
  } else if (combinedClass.includes("font-medium")) {
    fontFamily = "Inter_500Medium";
  }

  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      style={[{ fontFamily }, style]}
      {...props}
    />
  );
}

export { Text, TextClassContext };
