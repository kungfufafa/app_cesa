import * as React from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("bg-muted/60 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
