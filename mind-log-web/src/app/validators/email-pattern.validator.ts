import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailPatternValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    } else if (control.value?.length === 0) {
      return null;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { 'invalidEmail': true };
  };
}
