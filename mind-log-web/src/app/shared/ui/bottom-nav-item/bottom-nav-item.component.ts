import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {IconComponent, IconName} from '../icon/icon.component';

/**
 * Destino da barra inferior do celular: ícone sobre rótulo, 48 px de altura.
 * Com `link` navega (e marca o ativo pela rota); sem `link` é ação (abrir a
 * folha "Mais"). A barra é escura nos dois temas, por isso as cores de sidebar.
 */
@Component({
  selector: 'app-bottom-nav-item',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: block; }'],
  template: `
    @if (link) {
      <a [routerLink]="link" routerLinkActive="text-primary-300" [routerLinkActiveOptions]="{exact: exact}"
         #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null"
         [class]="itemClass + ' no-underline'">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </a>
    } @else {
      <button type="button" [attr.aria-expanded]="expanded" (click)="activated.emit()"
              [class]="itemClass + ' border-none bg-transparent cursor-pointer'">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </button>
    }
    <ng-template #content>
      <app-icon [name]="icon" size="base"></app-icon>
      <span>{{ label }}</span>
    </ng-template>
  `,
})
export class BottomNavItemComponent {
  @Input() link?: string;
  @Input({required: true}) icon!: IconName;
  @Input({required: true}) label = '';
  /** Rota exata (a Home não pode ficar ativa em toda rota). */
  @Input() exact = false;
  /** Para a ação que abre uma folha: estado de aberta. */
  @Input() expanded: boolean | null = null;
  @Output() activated = new EventEmitter<void>();

  readonly itemClass =
    'w-full flex flex-col items-center justify-center gap-1 min-h-12 text-surface-sidebar-fg text-2xs font-medium ' +
    'transition-[color,transform] duration-fast ease-inout active:scale-press';
}
