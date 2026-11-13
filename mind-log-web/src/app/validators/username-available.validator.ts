import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {map, Observable, of, switchMap, timer} from "rxjs";
import {catchError} from "rxjs/operators";
import {UserService} from '../services/user.service';

/** Mesma mecânica de `emailAvailableValidator`, com o formato do usuário checado antes. */
export function usernameAvailableValidator(currentUsername: string, userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;
    if (!value || value === currentUsername || control.invalid) return of(null);

    if (!/^[a-z0-9._]*$/.test(value)) return of({ usernameValidator: true });

    return timer(400).pipe(
      switchMap(() => userService.checkAvailabilityUsername(value)),
      map(isAvailable => isAvailable ? null : { usernameUnavailable: true }),
      catchError(() => of(null))
    );
  };
}
