import {inject, Injectable} from '@angular/core';
import {TokenService} from "./token.service";
import {RolesEnum} from "../enums/roles.enum";
import {AccessTokenDecoded} from "../models/auth/access-token-decoded.interface";
import {HttpClient} from "@angular/common/http";
import {AuthenticationResponse} from "../models/auth/authentication-response.interface";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {TokenRefreshToken} from "../models/auth/token-refresh-token.interface";
import {BehaviorSubject, catchError, tap, throwError} from "rxjs";
import {ChangePassword} from '../models/auth/change-password.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly RESOURCE_PATH: string = environment.apiPath + '/v1/auth';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  signIn(username: string, password: string) {
    return this.http.post<AuthenticationResponse>(`${this.RESOURCE_PATH}/token`, { "username": username, "password": password });
  }

  register(name: string, username: string, email: string, password: string) {
    return this.http.post<void>(`${this.RESOURCE_PATH}/register`, { name, username, email, password });
  }

  signInStoreToken(token: AuthenticationResponse): void {
    this.tokenService.setAccessToken(token.accessToken);
    this.tokenService.setRefreshToken(token.refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  signOut(): void {
    this.tokenService.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.router.navigateByUrl('login');
  }

  changePassword(data: ChangePassword) {
    return this.http.patch<void>(`${this.RESOURCE_PATH}/change-password`, data);
  }

  refreshToken() {
    const tokenRefreshToken: TokenRefreshToken = {
      refreshToken: this.tokenService.getRefreshToken()
    };
    return this.http.post<AuthenticationResponse>(`${this.RESOURCE_PATH}/refresh-token`, tokenRefreshToken).pipe(
      tap((res: AuthenticationResponse) => {
        this.tokenService.setAccessToken(res.accessToken);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  hasRole(role: RolesEnum): boolean {
    const userRoles: RolesEnum[] = this.getUserRoles();
    return userRoles.includes(role);
  }

  hasAnyRole(roles: RolesEnum[]): boolean {
    const userRoles: RolesEnum[] = this.getUserRoles();
    return roles.some(x => userRoles.includes(x));
  }

  private getUserRoles(): RolesEnum[] {
    const decoded: AccessTokenDecoded | null = this.tokenService.getDecodedToken();
    return decoded?.roles || [];
  }
  getUserRolesSafe(): ReadonlyArray<RolesEnum>{
    return [...(this.getUserRoles() ?? [])];
  }

  isLogged(): boolean {
    let token = this.tokenService.getAccessToken();
    return !!token;
  }

  getUsername(): string {
    const username: AccessTokenDecoded = this.tokenService.getDecodedToken();
    return username?.sub || '';
  }

  getId(): number {
    const decoded: AccessTokenDecoded = this.tokenService.getDecodedToken();
    return decoded?.id || null;
  }

}
