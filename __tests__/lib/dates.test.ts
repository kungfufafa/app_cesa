import { formatTimeString } from "@/lib/dates";

describe("formatTimeString", () => {
  it("formats HH:mm:ss to HH:mm", () => {
    expect(formatTimeString("14:30:00")).toBe("14:30");
    expect(formatTimeString("08:05:30")).toBe("08:05");
    expect(formatTimeString("23:59:59")).toBe("23:59");
  });

  it("passes through HH:mm unchanged", () => {
    expect(formatTimeString("14:30")).toBe("14:30");
  });

  it("returns --:-- for null/undefined", () => {
    expect(formatTimeString(null)).toBe("--:--");
    expect(formatTimeString(undefined)).toBe("--:--");
  });

  it("returns --:-- for empty string", () => {
    expect(formatTimeString("")).toBe("--:--");
  });
});
