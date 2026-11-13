import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

/**
 * Contador pequeno de itens pendentes (não lidas). Acima de 9 mostra "9+".
 * Não renderiza com zero. O número troca com uma entrada curta, para se ver
 * que mudou. Fundo `primary-700`: branco sobre ele passa de 4,5:1.
 */
@Component({
  selector: 'app-count-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-flex; }'],
  template: `
    @if (count > 0) {
      <span class="min-w-4 h-4 px-1 rounded-full bg-primary-700 text-ink-invert text-2xs font-bold leading-none
                   inline-flex items-center justify-center tabular-nums">
        @for (v of [label]; track v) {
          <span class="animate-tick-in">{{ v }}</span>
        }
      </span>
    }
  `,
})
export class CountBadgeComponent {
  @Input() count = 0;

  get label(): string {
    return this.count > 9 ? '9+' : String(this.count);
  }
}
