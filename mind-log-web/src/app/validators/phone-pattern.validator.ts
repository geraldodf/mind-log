import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function phonePatternValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const minLength = 8;
    const maxLength = 11;

    let value = control.value;

    if (!value) return null;

    value = value.replace(/[^0-9]/g, '');

    if (value.length < minLength) return { phoneInvalid: true };

    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }

    const phonePattern = /^(\d{8}|\d{10}|\d{11})$/;

    return value && !phonePattern.test(value) ? { phoneInvalid: true } : null;

  };
}
