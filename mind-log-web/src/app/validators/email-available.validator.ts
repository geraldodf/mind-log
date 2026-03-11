import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {debounceTime, first, map, Observable, of, switchMap} from "rxjs";
import {catchError} from "rxjs/operators";
import {UserService} from '../services/user.service';

export function emailAvailableValidator(currentEmail: string, userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;
    if (!value) return of(null);

    if (control.invalid) return null;

    if (value === currentEmail) {
      return of(null);
    }

    return control.valueChanges.pipe(
      debounceTime(800),
      switchMap(value =>
        userService.checkAvailabilityEmail(value).pipe(
          map(isAvailable =>
            isAvailable ? null : { emailUnavailable: true }
          ),
          catchError(() => of(null))
        )
      ),
      first()
    );

  };
}
