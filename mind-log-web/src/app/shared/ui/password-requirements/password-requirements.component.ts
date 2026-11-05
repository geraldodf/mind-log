import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgFor} from '@angular/common';
import {TONE_ICON_CLASSES} from '../tone';
import {TranslatePipe} from '../../../pipes/translate.pipe';

interface PasswordRule {
  labelKey: string;
  test: (value: string) => boolean;
}

// Mesmas regras de `passwordValidateValidator` — mantenha os dois alinhados.
const RULES: PasswordRule[] = [
  {labelKey: 'password.rule.minLength', test: v => v.length >= 8},
  {labelKey: 'password.rule.number', test: v => /\d/.test(v)},
  {labelKey: 'password.rule.special', test: v => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)},
  {labelKey: 'password.rule.noSpaces', test: v => v.length > 0 && !/\s/.test(v)},
];

@Component({
  selector: 'app-password-requirements',
  standalone: true,
  imports: [NgFor, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: block; }'],
  template: `
    <ul class="mt-2 flex flex-col gap-1 list-none p-0 m-0">
      <li
        *ngFor="let rule of rules"
        class="flex items-center gap-2 text-xs transition-colors duration-200"
        [class.text-ink-muted]="rule.test(value ?? '')"
        [class.text-ink-subtle]="!rule.test(value ?? '')"
      >
        <i [class]="rule.test(value ?? '') ? 'fa-solid fa-circle-check ' + metClass : 'fa-regular fa-circle ' + unmetClass"></i>
        {{ rule.labelKey | translate }}
      </li>
    </ul>
  `,
})
export class PasswordRequirementsComponent {
  /** Senha digitada, checada ao vivo contra cada requisito. */
  @Input() value = '';

  protected readonly rules = RULES;
  protected readonly metClass = TONE_ICON_CLASSES.success;
  protected readonly unmetClass = TONE_ICON_CLASSES.neutral;

  get valid(): boolean {
    return RULES.every(rule => rule.test(this.value ?? ''));
  }
}
