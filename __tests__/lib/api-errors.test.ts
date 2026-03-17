import { normalizeApiError, createApiError } from "@/lib/api-errors";
import axios, { AxiosError, AxiosHeaders } from "axios";

function makeAxiosError(
  status: number | undefined,
  data?: unknown,
  code?: string
): AxiosError {
  const error = new AxiosError(
    code === "NETWORK_ERROR" ? "Network Error" : "Request failed",
    code,
    { headers: new AxiosHeaders() } as never,
    undefined,
    status
      ? ({
          status,
          data: data ?? {},
          headers: {},
          statusText: "Error",
          config: { headers: new AxiosHeaders() },
        } as never)
      : undefined
  );
  return error;
}

describe("normalizeApiError", () => {
  it("extracts first validation error from errors object", () => {
    const error = makeAxiosError(422, {
      errors: {
        email: ["Email is required", "Email is invalid"],
        name: ["Name is required"],
      },
    });
    expect(normalizeApiError(error)).toBe("Email is required");
  });

  it("extracts single message from response", () => {
    const error = makeAxiosError(400, { message: "Invalid input" });
    expect(normalizeApiError(error)).toBe("Invalid input");
  });

  it("returns network error message for network errors", () => {
    const error = makeAxiosError(undefined, undefined, "NETWORK_ERROR");
    expect(normalizeApiError(error)).toBe(
      "Koneksi jaringan gagal. Periksa koneksi internet Anda."
    );
  });

  it("returns timeout message for ECONNABORTED", () => {
    const error = makeAxiosError(undefined, undefined, "ECONNABORTED");
    expect(normalizeApiError(error)).toBe(
      "Permintaan timeout. Silakan coba lagi."
    );
  });

  it("returns Error.message for non-Axios errors", () => {
    const error = new Error("Something went wrong");
    expect(normalizeApiError(error)).toBe("Something went wrong");
  });

  it("returns fallback for unknown errors", () => {
    expect(normalizeApiError("string error")).toBe(
      "Terjadi kesalahan. Silakan coba lagi."
    );
  });

  it("uses custom fallback message when provided", () => {
    expect(normalizeApiError(null, "Custom fallback")).toBe("Custom fallback");
  });

  it("prefers errors over message when both exist", () => {
    const error = makeAxiosError(422, {
      message: "Validation failed",
      errors: { field: ["Field error"] },
    });
    expect(normalizeApiError(error)).toBe("Field error");
  });

  it("handles string errors in errors object", () => {
    const error = makeAxiosError(422, {
      errors: { field: "Single string error" },
    });
    expect(normalizeApiError(error)).toBe("Single string error");
  });
});

describe("createApiError", () => {
  it("creates an ApiError with correct type and message", () => {
    const error = new Error("Test error");
    const apiError = createApiError(error, "network", 503);
    expect(apiError.message).toBe("Test error");
    expect(apiError.type).toBe("network");
    expect(apiError.statusCode).toBe(503);
  });

  it("defaults to unknown type", () => {
    const apiError = createApiError("some error");
    expect(apiError.type).toBe("unknown");
    expect(apiError.statusCode).toBeUndefined();
  });

  it("normalizes axios error messages", () => {
    const axiosError = makeAxiosError(422, {
      message: "Validation error",
    });
    const apiError = createApiError(axiosError, "validation", 422);
    expect(apiError.message).toBe("Validation error");
    expect(apiError.type).toBe("validation");
  });
});
