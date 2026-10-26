export interface AuthUser {
  name: string;
  email: string;
  role: string;
  token: string;
  dni?: string;
  phone?: string;
  picture?: string;
  provider?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  dni?: string;
}
