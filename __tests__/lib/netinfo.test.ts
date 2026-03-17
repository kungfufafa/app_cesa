import { isOfflineState } from "@/lib/netinfo";

describe("isOfflineState", () => {
  it("returns true when isConnected is false", () => {
    expect(isOfflineState(false, true)).toBe(true);
    expect(isOfflineState(false, null)).toBe(true);
    expect(isOfflineState(false, false)).toBe(true);
  });

  it("returns true when isInternetReachable is false", () => {
    expect(isOfflineState(true, false)).toBe(true);
    expect(isOfflineState(null, false)).toBe(true);
  });

  it("returns false when connected and reachable", () => {
    expect(isOfflineState(true, true)).toBe(false);
  });

  it("returns false when values are null (unknown state)", () => {
    expect(isOfflineState(null, null)).toBe(false);
    expect(isOfflineState(true, null)).toBe(false);
    expect(isOfflineState(null, true)).toBe(false);
  });
});
