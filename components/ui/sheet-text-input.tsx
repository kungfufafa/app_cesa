import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cn } from "@/lib/utils";
import { cssInterop } from "nativewind";
import React from "react";
import { Platform, TextInput } from "react-native";

cssInterop(BottomSheetTextInput, {
  className: {
    target: "style",
  },
});

type SheetTextInputProps = Omit<React.ComponentPropsWithoutRef<typeof BottomSheetTextInput>, "ref">;

function getSheetTextInputClassName({
  className,
  editable,
  multiline = false,
}: {
  className?: string;
  editable?: boolean;
  multiline?: boolean;
}) {
  return cn(
    multiline
      ? "text-foreground border-input dark:bg-input/30 flex min-h-16 w-full flex-row rounded-md border bg-transparent px-3 py-2 text-base shadow-sm shadow-black/5 md:text-sm"
      : "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
    Platform.select({
      web: multiline
        ? "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content resize-y outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed"
        : cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          ),
      native: multiline ? undefined : "placeholder:text-muted-foreground/50",
    }),
    editable === false && "opacity-50",
    className
  );
}

const SheetTextInput = React.forwardRef<TextInput, SheetTextInputProps>(
  ({ className, multiline, ...props }, ref) => {
    const resolvedClassName = getSheetTextInputClassName({
      className,
      editable: props.editable,
      multiline,
    });

    if (Platform.OS === "web") {
      return (
        <TextInput
          ref={ref}
          className={resolvedClassName}
          multiline={multiline}
          {...props}
        />
      );
    }

    return (
      <BottomSheetTextInput
        ref={ref as never}
        className={resolvedClassName}
        multiline={multiline}
        {...props}
      />
    );
  },
);

SheetTextInput.displayName = "SheetTextInput";

export { SheetTextInput };
