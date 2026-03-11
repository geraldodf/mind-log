import {Injectable} from '@angular/core';
import {AbstractControl} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  static getValidatorErrorMessage(validatorName: string, validatorValue?: any): string {
    const config: { [key: string]: string } = {
      required: 'Campo obrigatório.',
      minlength: `O tamanho mínimo é de ${validatorValue?.requiredLength} caracteres.`,
      maxlength: `O tamanho máximo é de ${validatorValue?.requiredLength} caracteres.`,
      email: 'Informe um email válido.',
      pattern: 'O formato do valor não é válido.',
      invalidEmail: 'E-mail inválido.',
      emailUnavailable: 'Este email já está em uso.',
      walletUnavailable: 'Você já possui uma carteira com este nome.',
      notUnique: 'Esta opção já foi escolhida em outro campo.',
      usernameUnavailable: 'Este nome de usuário já está em uso.',
      usernameValidator: 'Usuário inválido. Só pode conter letras, números, ponto e sublinhado.',
      sameAsCurrentPassword: 'Não pode ser igual a senha atual.',
      noSpaces: 'Não pode conter espaços.',
      specialCharacter: 'Deve conter pelo menos um caractere especial.',
      number: 'Deve conter pelo menos um número.'
    };

    return config[validatorName] || 'Campo inválido.';
  }

  getValidationMessage(control: AbstractControl): string | null {
    if (!control.errors) return null;

    const errorKey = Object.keys(control.errors)[0];
    const errorValue = control.errors[errorKey];
    return ValidationService.getValidatorErrorMessage(errorKey, errorValue);
  }

  isInvalidAndTouched(formControl: AbstractControl): boolean {
    return formControl?.touched && formControl?.invalid;
  }

}
