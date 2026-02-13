/**
 * Typed FormData helper to work around React Native FormData typing issues
 * Eliminates the need for @ts-ignore comments when using FormData
 */

export interface FormDataFile {
  uri: string;
  name: string;
  type: string;
}

/**
 * Type-safe FormData wrapper for React Native
 */
export class TypedFormData {
  private formData: FormData;

  constructor() {
    this.formData = new FormData();
  }

  /**
   * Append a string field
   */
  appendField(name: string, value: string): void {
    this.formData.append(name, value);
  }

  /**
   * Append a file field
   */
  appendFile(name: string, file: FormDataFile): void {
    this.formData.append(name, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  }

  /**
   * Append optional file (only if file exists)
   */
  appendOptionalFile(name: string, file: FormDataFile | null | undefined): void {
    if (file) {
      this.appendFile(name, file);
    }
  }

  /**
   * Get the underlying FormData instance
   */
  getFormData(): FormData {
    return this.formData;
  }
}

/**
 * Helper function to create typed FormData
 */
export function createFormData(): TypedFormData {
  return new TypedFormData();
}

/**
 * Convert mime type string to proper format
 */
export function normalizeMimeType(mimeType: string | undefined): string {
  if (!mimeType) {
    return "application/octet-stream";
  }
  return mimeType;
}
