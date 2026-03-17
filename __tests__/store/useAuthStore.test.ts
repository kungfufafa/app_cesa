import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/store/useAuthStore";

// Mock the services
jest.mock("@/services/api", () => ({
  setAuthToken: jest.fn(),
  setOnUnauthorized: jest.fn(),
}));

jest.mock("@/services/auth", () => ({
  login: jest.fn(),
  logout: jest.fn(),
}));

import { setAuthToken } from "@/services/api";
import { login, logout } from "@/services/auth";

const mockLogin = login as jest.MockedFunction<typeof login>;
const mockLogout = logout as jest.MockedFunction<typeof logout>;
const mockSetAuthToken = setAuthToken as jest.MockedFunction<
  typeof setAuthToken
>;

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  default_company_id: 1,
};

function resetStore() {
  useAuthStore.setState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
}

describe("useAuthStore", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.clearAllMocks();
    resetStore();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("signIn", () => {
    it("signs in successfully and stores token/user", async () => {
      mockLogin.mockResolvedValue({
        token: "test-token-123",
        user: mockUser,
      });

      const result = await useAuthStore.getState().signIn({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({ ok: true });

      const state = useAuthStore.getState();
      expect(state.token).toBe("test-token-123");
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "token",
        "test-token-123"
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
      expect(mockSetAuthToken).toHaveBeenCalledWith("test-token-123");
    });

    it("returns network error when login request fails without response", async () => {
      const { AxiosError, AxiosHeaders } = jest.requireActual("axios");
      const error = new AxiosError("Network Error", "ERR_NETWORK", {
        headers: new AxiosHeaders(),
      });
      mockLogin.mockRejectedValue(error);

      const result = await useAuthStore.getState().signIn({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({ type: "network" }),
      });
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it("handles token as nested object with access_token", async () => {
      mockLogin.mockResolvedValue({
        token: { access_token: "nested-token" } as unknown as string,
        user: mockUser,
      });

      const result = await useAuthStore.getState().signIn({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({ ok: true });
      expect(useAuthStore.getState().token).toBe("nested-token");
    });

    it("returns error when login API fails", async () => {
      mockLogin.mockRejectedValue(new Error("Login failed"));

      const result = await useAuthStore.getState().signIn({
        email: "test@example.com",
        password: "wrong",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe("unknown");
      }
    });

    it("maps invalid credentials from 422 response", async () => {
      const { AxiosError, AxiosHeaders } = jest.requireActual("axios");
      const error = new AxiosError("Unprocessable Entity", "ERR_BAD_REQUEST", {
        headers: new AxiosHeaders(),
      });
      error.response = {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: {
            email: ["The provided credentials are incorrect."],
          },
        },
        headers: {},
        statusText: "Unprocessable Entity",
        config: { headers: new AxiosHeaders() },
      };
      mockLogin.mockRejectedValue(error);

      const result = await useAuthStore.getState().signIn({
        email: "test@example.com",
        password: "wrong-password",
      });

      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({
          type: "validation",
          status: 422,
          messages: ["The provided credentials are incorrect."],
        }),
      });
    });
  });

  describe("signOut", () => {
    it("clears state and secure store", async () => {
      // Set up authenticated state
      useAuthStore.setState({
        token: "token",
        user: mockUser,
        isAuthenticated: true,
      });
      mockLogout.mockResolvedValue();

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("user");
      expect(mockSetAuthToken).toHaveBeenCalledWith(null);
    });

    it("clears state even if logout API call fails", async () => {
      useAuthStore.setState({
        token: "token",
        user: mockUser,
        isAuthenticated: true,
      });
      mockLogout.mockRejectedValue(new Error("Network error"));

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe("restoreSession", () => {
    it("restores session from stored token and cached user", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === "token") return Promise.resolve("stored-token");
        if (key === "user") return Promise.resolve(JSON.stringify(mockUser));
        return Promise.resolve(null);
      });

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.token).toBe("stored-token");
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(mockSetAuthToken).toHaveBeenCalledWith("stored-token");
    });

    it("clears auth when no stored token exists", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("clears auth when token exists but cached user is missing", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === "token") return Promise.resolve("stored-token");
          return Promise.resolve(null);
        }
      );

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("user");
    });

    it("clears auth when cached user is invalid JSON", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === "token") return Promise.resolve("stored-token");
          if (key === "user") return Promise.resolve("not-json");
          return Promise.resolve(null);
        }
      );

      await useAuthStore.getState().restoreSession();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
