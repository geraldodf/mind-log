import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {debounceTime, first, map, Observable, of, switchMap} from "rxjs";
import {catchError} from "rxjs/operators";
import {UserService} from '../services/user.service';

export function usernameAvailableValidator(currentUsername: string, userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;
    if (!value) return of(null);

    if (control.invalid) return null;

    const regex = /^[a-z0-9._]*$/;
    if (!regex.test(value)) return of({ usernameValidator: true });

    if (value === currentUsername) {
      return of(null);
    }

    return control.valueChanges.pipe(
      debounceTime(800),
      switchMap(value =>
        userService.checkAvailabilityUsername(value).pipe(
          map(isAvailable =>
            isAvailable ? null : { usernameUnavailable: true }
          ),
          catchError(() => of(null))
        )
      ),
      first()
    );

  };
}
