import { cn, getGreeting, formatCurrency } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges conflicting tailwind classes", () => {
    // tailwind-merge should pick the last conflicting class
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles empty/undefined inputs", () => {
    expect(cn()).toBe("");
    expect(cn(undefined, null, "foo")).toBe("foo");
  });
});

describe("getGreeting", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function setHour(hour: number) {
    jest.setSystemTime(new Date(2026, 2, 6, hour, 0, 0));
  }

  it("returns 'Selamat pagi' for morning hours", () => {
    setHour(6);
    expect(getGreeting()).toBe("Selamat pagi");
    setHour(11);
    expect(getGreeting()).toBe("Selamat pagi");
  });

  it("returns 'Selamat siang' for afternoon hours", () => {
    setHour(12);
    expect(getGreeting()).toBe("Selamat siang");
    setHour(14);
    expect(getGreeting()).toBe("Selamat siang");
  });

  it("returns 'Selamat sore' for late afternoon hours", () => {
    setHour(15);
    expect(getGreeting()).toBe("Selamat sore");
    setHour(17);
    expect(getGreeting()).toBe("Selamat sore");
  });

  it("returns 'Selamat malam' for night hours (18-23)", () => {
    setHour(18);
    expect(getGreeting()).toBe("Selamat malam");
    setHour(23);
    expect(getGreeting()).toBe("Selamat malam");
  });

  it("returns 'Selamat pagi' for midnight (hour 0)", () => {
    setHour(0);
    expect(getGreeting()).toBe("Selamat pagi");
  });
});

describe("formatCurrency", () => {
  it("formats Indonesian Rupiah", () => {
    const result = formatCurrency(1000000);
    // Intl may use different non-breaking space characters
    expect(result).toMatch(/Rp/);
    expect(result).toMatch(/1[.,\s\u00a0]000[.,\s\u00a0]000/);
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/Rp/);
    expect(result).toMatch(/0/);
  });

  it("does not show decimal places", () => {
    const result = formatCurrency(50000);
    expect(result).not.toMatch(/\.\d\d$/);
  });
});
