import {
  getStatusBadgeClasses,
  getStatusLabel,
  getPresensiStatusClasses,
  getPresensiStatusLabel,
  type PresensiStatus,
} from "@/lib/status-helpers";

describe("getStatusBadgeClasses", () => {
  it("returns emerald classes for approved status", () => {
    const result = getStatusBadgeClasses("approved");
    expect(result.container).toBe("bg-emerald-100");
    expect(result.text).toBe("text-emerald-700");
  });

  it("returns red classes for rejected status", () => {
    const result = getStatusBadgeClasses("rejected");
    expect(result.container).toBe("bg-red-100");
    expect(result.text).toBe("text-red-700");
  });

  it("returns secondary classes for pending status", () => {
    const result = getStatusBadgeClasses("pending");
    expect(result.container).toBe("bg-secondary");
    expect(result.text).toBe("text-muted-foreground");
  });

  it("handles case-insensitive input", () => {
    expect(getStatusBadgeClasses("APPROVED").container).toBe("bg-emerald-100");
    expect(getStatusBadgeClasses("Rejected").container).toBe("bg-red-100");
    expect(getStatusBadgeClasses("Pending").container).toBe("bg-secondary");
  });

  it("returns default classes for unknown status", () => {
    const result = getStatusBadgeClasses("unknown");
    expect(result.container).toBe("bg-secondary");
    expect(result.text).toBe("text-muted-foreground");
  });
});

describe("getStatusLabel", () => {
  it("returns Indonesian label for each status", () => {
    expect(getStatusLabel("approved")).toBe("Disetujui");
    expect(getStatusLabel("rejected")).toBe("Ditolak");
    expect(getStatusLabel("pending")).toBe("Menunggu");
  });

  it("handles case-insensitive input", () => {
    expect(getStatusLabel("APPROVED")).toBe("Disetujui");
    expect(getStatusLabel("Rejected")).toBe("Ditolak");
  });

  it("returns Menunggu for unknown status", () => {
    expect(getStatusLabel("something_else")).toBe("Menunggu");
  });
});

describe("getPresensiStatusClasses", () => {
  const cases: Array<{
    status: PresensiStatus;
    expectedContainer: string;
    expectedText: string;
  }> = [
    {
      status: "hadir",
      expectedContainer: "bg-emerald-100",
      expectedText: "text-emerald-700",
    },
    {
      status: "terlambat",
      expectedContainer: "bg-yellow-100",
      expectedText: "text-yellow-700",
    },
    {
      status: "pulang_cepat",
      expectedContainer: "bg-yellow-100",
      expectedText: "text-yellow-700",
    },
    {
      status: "izin",
      expectedContainer: "bg-blue-100",
      expectedText: "text-blue-700",
    },
    {
      status: "cuti",
      expectedContainer: "bg-blue-100",
      expectedText: "text-blue-700",
    },
    {
      status: "sakit",
      expectedContainer: "bg-purple-100",
      expectedText: "text-purple-700",
    },
    {
      status: "alpha",
      expectedContainer: "bg-red-100",
      expectedText: "text-red-700",
    },
  ];

  it.each(cases)(
    "returns correct classes for $status",
    ({ status, expectedContainer, expectedText }) => {
      const result = getPresensiStatusClasses(status);
      expect(result.container).toBe(expectedContainer);
      expect(result.text).toBe(expectedText);
    }
  );
});

describe("getPresensiStatusLabel", () => {
  const cases: Array<{ status: PresensiStatus; expected: string }> = [
    { status: "hadir", expected: "Hadir" },
    { status: "terlambat", expected: "Terlambat" },
    { status: "pulang_cepat", expected: "Pulang Cepat" },
    { status: "izin", expected: "Izin" },
    { status: "cuti", expected: "Cuti" },
    { status: "sakit", expected: "Sakit" },
    { status: "alpha", expected: "Alpha" },
  ];

  it.each(cases)(
    "returns $expected for $status",
    ({ status, expected }) => {
      expect(getPresensiStatusLabel(status)).toBe(expected);
    }
  );
});
