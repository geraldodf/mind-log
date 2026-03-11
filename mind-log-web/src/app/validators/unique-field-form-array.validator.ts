import {AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export function uniqueFieldFormArrayValidator(fieldName: string): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    if (!(formArray instanceof FormArray)) return null;

    const controls = formArray.controls as FormGroup[];
    const values = controls.map(control => control.get(fieldName)?.value);

    const duplicateValues: number[] = values
      .map((value, index) => values.indexOf(value) !== index ? index : -1)
      .filter(index => index !== -1);

    controls.forEach((control, index) => {
      const fieldControl = control.get(fieldName);
      if (!fieldControl) return;

      const errors = fieldControl.errors || {};

      if (duplicateValues.includes(index)) {
        errors['notUnique'] = true;
      } else {
        delete errors['notUnique'];
      }

      if (Object.keys(errors).length > 0) {
        fieldControl.setErrors(errors);
      } else {
        fieldControl.setErrors(null);
      }
    });

    return duplicateValues.length > 0 ? { notUnique: true } : null;
  };
}
