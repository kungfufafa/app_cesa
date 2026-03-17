import { createApiError } from "@/lib/api-errors";
import { z } from "zod";

const apiErrorBagSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())])
);

export const apiResultSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    errors: apiErrorBagSchema.optional(),
  })
  .passthrough();

export const apiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  apiResultSchema.extend({
    data: dataSchema,
  });

const formatIssues = (issues: z.ZodIssue[]) =>
  issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`);

const createInvalidResponseError = (
  fallbackMessage: string,
  issues: z.ZodIssue[]
) => {
  if (__DEV__) {
    console.warn("[api] Invalid response payload", formatIssues(issues));
  }

  return createApiError(new Error(fallbackMessage), "server");
};

export function parseApiPayload<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown,
  fallbackMessage: string
): z.infer<T> {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(fallbackMessage, result.error.issues);
  }

  return result.data;
}

export function parseApiEnvelope<T extends z.ZodTypeAny>(
  dataSchema: T,
  payload: unknown,
  fallbackMessage: string
): z.infer<T> {
  const result = apiEnvelopeSchema(dataSchema).safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(fallbackMessage, result.error.issues);
  }

  if (!result.data.success) {
    throw createApiError(
      new Error(result.data.message || fallbackMessage),
      result.data.errors ? "validation" : "server"
    );
  }

  return result.data.data as z.infer<T>;
}

export function parseApiResult(
  payload: unknown,
  fallbackMessage: string
): { success: true; message: string } {
  const result = apiResultSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(fallbackMessage, result.error.issues);
  }

  if (!result.data.success) {
    throw createApiError(
      new Error(result.data.message || fallbackMessage),
      result.data.errors ? "validation" : "server"
    );
  }

  return {
    success: true,
    message: result.data.message || "",
  };
}
