import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function passwordValidateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < 8) {
      return { minLength: true };
    }

    if (!/\d/.test(value)) {
      return { number: true };
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      return { specialCharacter: true };
    }

    if (/\s/.test(value)) {
      return { noSpaces: true };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
