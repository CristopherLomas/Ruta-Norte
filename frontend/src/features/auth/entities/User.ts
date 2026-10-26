export interface AuthUser {
  name: string;
  email: string;
  role: string;
  token: string;
  dni?: string;
  picture?: string;
  provider?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
