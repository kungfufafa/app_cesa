import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginApiResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    is_default: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    language: string | null;
    is_active: number;
    resource_permission: string;
    has_all_form_transfer_access: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    default_company_id: number;
    partner_id: number;
  };
}

export type AuthUser = LoginApiResponse['user'];

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<LoginApiResponse>('/api/login', credentials);
  return {
    token: response.data.access_token,
    user: response.data.user,
  };
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>('/api/me');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/logout');
};
