import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {TokenService} from "../services/token.service";
import {RolesEnum} from "../enums/roles.enum";
import {AuthService} from "../services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.getAccessToken();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles: RolesEnum[] = route.data['roles'];
  if (requiredRoles && !authService.hasAnyRole(requiredRoles)) {
    return router.parseUrl('/nao-autorizado');
  }

  return true;
};
