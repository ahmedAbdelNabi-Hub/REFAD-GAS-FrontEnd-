
export interface IAuthResponse {
  email: string;
  name: string;
  token: string;
  role: string;
  refreshToken: string;
  expiresAt: Date;
}