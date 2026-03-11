import { Injectable } from '@angular/core';
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
  canDeactivate(
    component: CanComponentDeactivateGuard
  ): Observable<boolean> | Promise<boolean> | boolean {

    return component.canDeactivate ? component.canDeactivate() : true;
  }

}
