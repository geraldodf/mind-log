import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

/**
 * Faixa de segmentos de uma sequência de telas ("stories"): um por tela, cheios até a atual.
 * É só indicação visual, por isso fica oculta para tecnologia assistiva; quem anuncia
 * "tela 3 de 8" é a tela em si. O enchimento é `transform`, nunca `width`.
 */
@Component({
  selector: 'app-story-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-1" aria-hidden="true">
      @for (segment of segments; track segment) {
        <div class="flex-1 h-1 rounded-full bg-hairline overflow-hidden">
          <div class="h-full w-full rounded-full bg-primary-600 origin-left transition-transform duration-slow ease-spring"
               [class.scale-x-0]="segment > index" [class.scale-x-100]="segment <= index"></div>
        </div>
      }
    </div>
  `,
})
export class StoryProgressComponent {
  /** Quantas telas a sequência tem. */
  @Input() count = 0;
  /** A tela atual, a partir de 0. */
  @Input() index = 0;

  get segments(): number[] {
    return Array.from({length: this.count}, (_, i) => i);
  }
}
