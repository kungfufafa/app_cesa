import * as DocumentPicker from "expo-document-picker";

import type { HelpdeskFileUpload } from "@/services/helpdesk";

export type SelectedHelpdeskAttachment = DocumentPicker.DocumentPickerAsset;

export const MAX_HELPDESK_ATTACHMENTS = 5;
export const MAX_HELPDESK_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

export async function pickHelpdeskAttachments(
  remainingSlots: number = MAX_HELPDESK_ATTACHMENTS
): Promise<SelectedHelpdeskAttachment[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*", "application/pdf"],
    copyToCacheDirectory: true,
    multiple: remainingSlots > 1,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  return result.assets.slice(0, remainingSlots);
}

export function toHelpdeskFileUpload(
  asset: SelectedHelpdeskAttachment
): HelpdeskFileUpload {
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? "application/octet-stream",
  };
}

export function toHelpdeskFileUploads(
  assets: SelectedHelpdeskAttachment[]
): HelpdeskFileUpload[] {
  return assets.map(toHelpdeskFileUpload);
}

export function isHelpdeskAttachmentTooLarge(
  asset: SelectedHelpdeskAttachment
): boolean {
  return typeof asset.size === "number" && asset.size > MAX_HELPDESK_ATTACHMENT_SIZE_BYTES;
}
