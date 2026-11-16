import {inject, Injectable} from '@angular/core';
import {AbstractControl, FormGroup} from "@angular/forms";
import {I18nService} from '../i18n.service';
import {ErrorResponse} from '../../models/util/error-response.interface';

/** Erros de validador → chave de i18n. O que não está aqui cai em `validation.invalid`. */
const MESSAGE_KEYS: Record<string, string> = {
  required: 'validation.required',
  minlength: 'validation.minlength',
  maxlength: 'validation.maxlength',
  email: 'validation.email',
  pattern: 'validation.pattern',
  invalidEmail: 'validation.email',
  emailUnavailable: 'apiError.email_in_use',
  notUnique: 'validation.notUnique',
  usernameUnavailable: 'apiError.username_in_use',
  usernameValidator: 'apiError.username_invalid',
  sameAsCurrentPassword: 'apiError.same_password',
  noSpaces: 'validation.noSpaces',
  specialCharacter: 'validation.specialCharacter',
  number: 'validation.number',
};

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private readonly i18n = inject(I18nService);

  getValidationMessage(control: AbstractControl): string | null {
    if (!control.errors) return null;

    const errorKey = Object.keys(control.errors)[0];
    const errorValue = control.errors[errorKey];
    // Erro vindo da API (`applyApiError`): a mensagem já chega traduzida.
    if (errorKey === 'api') return errorValue;
    const message = this.i18n.t(MESSAGE_KEYS[errorKey] ?? 'validation.invalid');
    return message.replace('{n}', String(errorValue?.requiredLength ?? ''));
  }

  isInvalidAndTouched(formControl: AbstractControl): boolean {
    return formControl?.touched && formControl?.invalid;
  }

  /**
   * Põe o erro da API no campo que ela apontou (`field`), quando o formulário tem esse
   * campo. Devolve `false` se não deu (erro sem campo, ou campo de outro formulário):
   * aí a tela mostra o erro junto da ação.
   */
  applyApiError(form: FormGroup, err: ErrorResponse | null | undefined): boolean {
    const control = err?.field ? form.get(err.field) : null;
    if (!control) return false;
    control.setErrors({...(control.errors ?? {}), api: err!.error});
    control.markAsTouched();
    return true;
  }
}
