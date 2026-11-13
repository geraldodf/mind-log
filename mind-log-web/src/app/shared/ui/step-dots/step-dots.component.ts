import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslatePipe} from '../../../pipes/translate.pipe';

/** Indicador de passos clicável (onboarding, tour). O passo atual estica. */
@Component({
  selector: 'app-step-dots',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2" role="group" [attr.aria-label]="ariaLabel || null">
      @for (step of steps; track step) {
        <button type="button"
                class="h-2 rounded-full border-none p-0 cursor-pointer icon-btn-touch
                       transition-[width,background-color] duration-base ease-inout"
                [class]="step === current ? 'w-6 bg-primary-600' : 'w-2 bg-hairline-strong hover:bg-ink-subtle'"
                [attr.aria-label]="('onboarding.goToStep' | translate) + ' ' + (step + 1)"
                [attr.aria-current]="step === current ? 'step' : null"
                (click)="currentChange.emit(step)"></button>
      }
    </div>
  `,
})
export class StepDotsComponent {
  @Input({required: true}) set count(value: number) {
    this.steps = Array.from({length: value}, (_, i) => i);
  }
  @Input() current = 0;
  @Input() ariaLabel = '';
  @Output() currentChange = new EventEmitter<number>();

  steps: number[] = [];
}
