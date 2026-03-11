import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import {TokenService} from "../services/token.service";
import {AuthService} from "../services/auth.service";
import {catchError, switchMap, throwError} from "rxjs";
import {AuthenticationResponse} from "../models/auth/authentication-response.interface";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenEndpoint = 'v1/auth/token';
  const refreshTokenEndpoint = 'v1/auth/refresh-token';
  const tokenService = inject(TokenService)
  const authService = inject(AuthService);

  const accessToken = tokenService.getAccessToken();

  if (accessToken && !req.url.includes(refreshTokenEndpoint) && !req.url.includes(tokenEndpoint)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes(refreshTokenEndpoint) && !req.url.includes(tokenEndpoint)) {
        return authService.refreshToken().pipe(
          switchMap((authResponse: AuthenticationResponse) => {
            tokenService.setAccessToken(authResponse.accessToken);
            const clonedRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${authResponse.accessToken}` },
            });
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            authService.signOut();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );

};
