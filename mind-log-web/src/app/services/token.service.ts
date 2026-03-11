import {inject, Injectable} from '@angular/core';
import {JwtHelperService} from "@auth0/angular-jwt";
import {AccessTokenDecoded} from "../models/auth/access-token-decoded.interface";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private jwtHelper = inject(JwtHelperService);

  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  removeAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getDecodedToken(): AccessTokenDecoded | null {
    const token: string | null = this.getAccessToken();
    if (!token) return null;
    return this.jwtHelper.decodeToken(token) as AccessTokenDecoded;
  }

  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }
  getUserRole(): string | null {
    const  decodedToken = this.getDecodedToken();
    if (!decodedToken || !decodedToken.roles) return null;

    return Array.isArray(decodedToken.roles) ? decodedToken.roles[0] : decodedToken.roles;
  }

}
