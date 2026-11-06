import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `display: block` no host: sem isto o host fica inline e um `overflow-hidden`
  // aplicado nele recortaria os cantos arredondados do filho em quadrado.
  styles: [':host { display: block; }'],
  template: `
    <div
      class="h-full bg-surface-card rounded-card shadow-md border transition-[box-shadow,border-color] duration-base ease-inout"
      [ngClass]="[borderClass, paddingClass, clip ? 'overflow-hidden' : '', interactive ? 'cursor-pointer hover:shadow-lg hover:border-hairline-strong' : '']"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() interactive = false;
  /** Recorta o conteúdo no raio do card — para tabelas e listas coladas na borda. */
  @Input() clip = false;
  /** `danger` destaca a borda — zona de ações destrutivas. Não é escape hatch
   *  de estilo: são os dois únicos tipos de card do sistema. */
  @Input() tone: 'default' | 'danger' = 'default';

  get borderClass(): string {
    return this.tone === 'danger'
      ? 'border-danger-200 dark:border-danger-500/20'
      : 'border-hairline';
  }

  private readonly paddingMap: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  get paddingClass(): string {
    return this.paddingMap[this.padding] ?? this.paddingMap['md'];
  }
}
