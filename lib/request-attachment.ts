import * as DocumentPicker from "expo-document-picker";

import type { RequestAttachment } from "@/services/presensi/forms";

export type SelectedRequestAttachment = DocumentPicker.DocumentPickerAsset;

export async function pickRequestAttachment(): Promise<SelectedRequestAttachment | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*", "application/pdf"],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0] ?? null;
}

export function toRequestAttachment(
  asset: SelectedRequestAttachment | null
): RequestAttachment | null {
  if (!asset) {
    return null;
  }

  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? "application/octet-stream",
  };
}
