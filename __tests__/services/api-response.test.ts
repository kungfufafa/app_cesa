import { parseApiEnvelope, parseApiPayload, parseApiResult } from "@/services/api-response";
import { z } from "zod";

describe("api-response helpers", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("parses valid envelope payloads", () => {
    const schema = z.object({
      id: z.number(),
      name: z.string(),
    });

    const result = parseApiEnvelope(
      schema,
      {
        success: true,
        message: "OK",
        data: {
          id: 1,
          name: "CESA",
        },
      },
      "Envelope invalid."
    );

    expect(result).toEqual({
      id: 1,
      name: "CESA",
    });
  });

  it("throws when envelope shape is invalid", () => {
    expect(() =>
      parseApiEnvelope(
        z.object({ id: z.number() }),
        {
          success: true,
          data: {
            id: "wrong",
          },
        },
        "Envelope invalid."
      )
    ).toThrow("Envelope invalid.");
  });

  it("throws server message when envelope reports failure", () => {
    expect(() =>
      parseApiEnvelope(
        z.object({ id: z.number() }),
        {
          success: false,
          message: "Backend gagal.",
          data: {
            id: 1,
          },
        },
        "Fallback message."
      )
    ).toThrow("Backend gagal.");
  });

  it("parses raw payloads", () => {
    const result = parseApiPayload(
      z.object({
        token: z.string(),
      }),
      {
        token: "abc123",
      },
      "Payload invalid."
    );

    expect(result.token).toBe("abc123");
  });

  it("parses acknowledgement results", () => {
    const result = parseApiResult(
      {
        success: true,
        message: "Tersimpan.",
      },
      "Ack invalid."
    );

    expect(result).toEqual({
      success: true,
      message: "Tersimpan.",
    });
  });
});
