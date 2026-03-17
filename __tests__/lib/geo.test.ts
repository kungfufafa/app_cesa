import { calculateDistance, isWithinRadius, formatDistance } from "@/lib/geo";

describe("calculateDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it("calculates distance between two known points", () => {
    // Jakarta (-6.2088, 106.8456) to Bandung (-6.9175, 107.6191)
    const distance = calculateDistance(-6.2088, 106.8456, -6.9175, 107.6191);
    // Approximately 118 km
    expect(distance).toBeGreaterThan(115_000);
    expect(distance).toBeLessThan(125_000);
  });

  it("calculates short distances accurately", () => {
    // Two points ~111m apart (0.001 degrees latitude at equator)
    const distance = calculateDistance(0, 0, 0.001, 0);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });

  it("is symmetric", () => {
    const d1 = calculateDistance(-6.2, 106.8, -6.9, 107.6);
    const d2 = calculateDistance(-6.9, 107.6, -6.2, 106.8);
    expect(d1).toBeCloseTo(d2, 5);
  });
});

describe("isWithinRadius", () => {
  it("returns true when point is within radius", () => {
    // Same point, 100m radius
    expect(isWithinRadius(-6.2, 106.8, -6.2, 106.8, 100)).toBe(true);
  });

  it("returns true when point is exactly at the boundary", () => {
    const distance = calculateDistance(0, 0, 0.001, 0);
    expect(isWithinRadius(0, 0, 0.001, 0, distance)).toBe(true);
  });

  it("returns false when point is outside radius", () => {
    // Jakarta to Bandung (~118km), 1km radius
    expect(isWithinRadius(-6.2088, 106.8456, -6.9175, 107.6191, 1000)).toBe(
      false
    );
  });
});

describe("formatDistance", () => {
  it("formats meters for distances under 1000m", () => {
    expect(formatDistance(150)).toBe("150m");
    expect(formatDistance(999)).toBe("999m");
    expect(formatDistance(0)).toBe("0m");
  });

  it("rounds meters to nearest integer", () => {
    expect(formatDistance(150.7)).toBe("151m");
    expect(formatDistance(150.3)).toBe("150m");
  });

  it("formats kilometers for distances 1000m and above", () => {
    expect(formatDistance(1000)).toBe("1.0km");
    expect(formatDistance(1500)).toBe("1.5km");
    expect(formatDistance(118000)).toBe("118.0km");
  });

  it("shows one decimal place for km", () => {
    expect(formatDistance(2345)).toBe("2.3km");
    expect(formatDistance(2367)).toBe("2.4km");
  });
});
