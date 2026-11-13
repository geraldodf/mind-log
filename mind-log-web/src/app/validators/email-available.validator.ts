import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {map, Observable, of, switchMap, timer} from "rxjs";
import {catchError} from "rxjs/operators";
import {UserService} from '../services/user.service';

/**
 * O Angular cancela a verificação anterior a cada novo valor, então o
 * `timer` faz o papel do debounce. Valor sem mudança ou ainda inválido nos
 * validadores síncronos não chega a consultar a API. Falha de rede não acusa
 * erro no campo: a API valida de novo ao salvar.
 */
export function emailAvailableValidator(currentEmail: string, userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;
    if (!value || value === currentEmail || control.invalid) return of(null);

    return timer(400).pipe(
      switchMap(() => userService.checkAvailabilityEmail(value)),
      map(isAvailable => isAvailable ? null : { emailUnavailable: true }),
      catchError(() => of(null))
    );
  };
}
