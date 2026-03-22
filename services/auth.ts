import api from './api';
import { parseApiPayload } from './api-response';
import Constants from "expo-constants";
import { Platform } from "react-native";
import { z } from "zod";

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

const authCompanySchema = z.object({
  id: z.coerce.number().int(),
  name: z.string().min(1),
});

const authCurrentAccessTokenSchema = z.object({
  name: z.string().min(1),
  last_used_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
}).passthrough();

const authUserSchema = z.object({
  id: z.coerce.number().int(),
  name: z.string().min(1),
  email: z.string().email(),
  language: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  resource_permission: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  roles: z.array(z.unknown()).optional().default([]),
  permissions: z.array(z.unknown()).optional().default([]),
  default_company: authCompanySchema.nullable().optional(),
  allowed_companies: z.array(authCompanySchema).optional().default([]),
  current_access_token: authCurrentAccessTokenSchema.nullable().optional(),
}).passthrough();

const loginApiResponseSchema = z.object({
  message: z.string().optional(),
  token: z.string().min(1),
  token_type: z.string().min(1),
  user: authUserSchema,
});

const currentUserApiResponseSchema = z.object({
  message: z.string().optional(),
  data: authUserSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthCompany = z.infer<typeof authCompanySchema>;
export type AuthCurrentAccessToken = z.infer<typeof authCurrentAccessTokenSchema>;

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const buildDefaultDeviceName = () => {
  const appName = Constants.expoConfig?.name ?? "App Cesa";
  const platformLabel = Platform.OS === "ios"
    ? "iPhone"
    : Platform.OS === "android"
      ? "Android"
      : "Web";
  const platformConstants = Platform.constants as Record<string, unknown> | undefined;
  const brand = typeof platformConstants?.Brand === "string" ? platformConstants.Brand : null;
  const model = typeof platformConstants?.Model === "string" ? platformConstants.Model : null;
  const deviceLabel = [brand, model].filter(Boolean).join(" ").trim();

  return [appName, deviceLabel || platformLabel].filter(Boolean).join(" - ");
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/admin/api/v1/login', {
    ...credentials,
    device_name: credentials.device_name?.trim() || buildDefaultDeviceName(),
  });
  const payload = parseApiPayload(
    loginApiResponseSchema,
    response.data,
    "Respons login tidak valid."
  );

  return {
    token: payload.token,
    user: payload.user,
  };
};

export const getCurrentUser = async (tokenOverride?: string): Promise<AuthUser> => {
  const response = await api.get('/admin/api/v1/me', {
    headers: tokenOverride
      ? {
          Authorization: `Bearer ${tokenOverride}`,
        }
      : undefined,
  });
  const payload = parseApiPayload(
    currentUserApiResponseSchema,
    response.data,
    "Respons user saat ini tidak valid."
  );

  return payload.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/admin/api/v1/logout');
};

export const logoutAll = async (): Promise<void> => {
  await api.post('/admin/api/v1/logout-all');
};
