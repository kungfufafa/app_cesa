import { openExternalUrl } from "@/lib/open-url";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

jest.mock("react-native", () => ({
  Alert: { alert: jest.fn() },
}));

describe("openExternalUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens URL when supported", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

    const result = await openExternalUrl("https://example.com");
    expect(result).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith("https://example.com");
  });

  it("shows alert when URL is not supported", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    const result = await openExternalUrl("custom://scheme");
    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Tidak bisa membuka",
      expect.any(String)
    );
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it("uses custom fallback messages", async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    await openExternalUrl("custom://scheme", {
      fallbackTitle: "Error",
      fallbackMessage: "Cannot open WhatsApp",
    });

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Cannot open WhatsApp");
  });

  it("shows alert on error and returns false", async () => {
    (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error("fail"));

    const result = await openExternalUrl("https://example.com");
    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
