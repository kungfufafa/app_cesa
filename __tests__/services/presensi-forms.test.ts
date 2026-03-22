jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import api from "@/services/api";
import { submitLeave, submitOvertime } from "@/services/presensi/forms";

const mockApi = api as jest.Mocked<typeof api>;

class MockFormData {
  entries: Array<[string, unknown]> = [];

  append(key: string, value: unknown) {
    this.entries.push([key, value]);
  }
}

describe("presensi forms service", () => {
  const originalFormData = global.FormData;

  beforeEach(() => {
    jest.clearAllMocks();
    global.FormData = MockFormData as unknown as typeof FormData;
  });

  afterAll(() => {
    global.FormData = originalFormData;
  });

  it("submits leave as json when no file is attached", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        success: true,
        message: "Leave submitted successfully",
      },
    });

    await submitLeave({
      type: "Izin",
      start_date: "2026-03-22",
      end_date: "2026-03-22",
      reason: "Keperluan keluarga",
    });

    expect(mockApi.post).toHaveBeenCalledWith("/admin/api/v1/presensi/leaves", {
      type: "Izin",
      start_date: "2026-03-22",
      end_date: "2026-03-22",
      reason: "Keperluan keluarga",
    });
  });

  it("submits overtime as multipart when file is attached", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        success: true,
        message: "Overtime submitted successfully",
      },
    });

    await submitOvertime({
      date: "2026-03-22",
      start_time: "18:00",
      end_time: "20:00",
      reason: "Support production",
      file: {
        uri: "file:///tmp/evidence.pdf",
        name: "evidence.pdf",
        mimeType: "application/pdf",
      },
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/admin/api/v1/presensi/overtimes",
      expect.any(MockFormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  });
});
