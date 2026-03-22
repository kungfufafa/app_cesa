import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { openExternalUrl } from "@/lib/open-url";
import { extractInlineUrlsFromHtml, htmlToPlainText } from "@/lib/helpdesk-rich-text";

type HelpdeskRichTextProps = {
  html?: string | null;
  className?: string;
  numberOfLines?: number;
  emptyText?: string;
  showInlineLinks?: boolean;
};

export function HelpdeskRichText({
  html,
  className,
  numberOfLines,
  emptyText = "-",
  showInlineLinks = false,
}: HelpdeskRichTextProps) {
  const text = htmlToPlainText(html);
  const links = showInlineLinks ? extractInlineUrlsFromHtml(html) : [];

  return (
    <View className="gap-2">
      <Text className={className} numberOfLines={numberOfLines}>
        {text || emptyText}
      </Text>

      {showInlineLinks && links.length > 0 ? (
        <View className="gap-1.5">
          {links.map((url) => (
            <Pressable
              key={url}
              onPress={() =>
                void openExternalUrl(url, {
                  fallbackTitle: "Tidak bisa membuka tautan",
                  fallbackMessage: "Tautan dari tiket tidak dapat dibuka di perangkat ini.",
                })
              }
            >
              <Text className="text-sm font-medium text-primary">{url}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
