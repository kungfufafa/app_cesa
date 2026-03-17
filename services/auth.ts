import api from './api';
import { parseApiPayload } from './api-response';
import { z } from "zod";

export interface LoginCredentials {
  email: string;
  password: string;
}

const authUserSchema = z.object({
  id: z.coerce.number().int(),
  name: z.string().min(1),
  email: z.string().email(),
}).passthrough();

const loginApiResponseSchema = z.object({
  message: z.string().optional(),
  token: z.string().min(1),
  token_type: z.string().min(1),
  user: authUserSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/admin/api/v1/login', credentials);
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

export const logout = async (): Promise<void> => {
  await api.post('/admin/api/v1/logout');
};
