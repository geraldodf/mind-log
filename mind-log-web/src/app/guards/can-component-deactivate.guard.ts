import { inject, Injectable } from '@angular/core';
import { TokenService } from '../services/token.service';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivateGuard {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard
  implements CanDeactivate<CanComponentDeactivateGuard>
{
  private readonly tokenService = inject(TokenService);

  canDeactivate(
    component: CanComponentDeactivateGuard
  ): Observable<boolean> | Promise<boolean> | boolean {

    // Sem sessão (logout, 401) não há o que proteger: perguntar deixaria a pessoa presa na tela.
    if (!this.tokenService.getAccessToken()) return true;
    return component.canDeactivate ? component.canDeactivate() : true;
  }

}
