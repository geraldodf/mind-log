import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

export type SheetTileTone = 'primary' | 'danger';

/**
 * Item da grade do bottom sheet "Mais" e da barra inferior do mobile.
 * Vira `<a>` quando recebe `link` e `<button>` quando não recebe, para o mesmo
 * tile servir navegação e ação sem markup duplicado no app-shell.
 */
@Component({
  selector: 'app-sheet-tile',
  standalone: true,
  imports: [NgIf, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // min-width: 0 — como item de grid, sem isso o rótulo longo alarga a coluna
  // (min-width: auto é o padrão) e estoura a largura da tela.
  styles: [':host { display: block; min-width: 0; }'],
  template: `
    <a *ngIf="link; else actionTile" [routerLink]="link" (click)="activated.emit()" [class]="tileClass">
      <i [class]="icon + ' text-lg ' + iconToneClass"></i>
      <span class="text-xs text-ink-muted text-center break-words min-w-0">{{ label }}</span>
    </a>
    <ng-template #actionTile>
      <button type="button" (click)="activated.emit()" [class]="tileClass + ' border-none bg-transparent cursor-pointer w-full'">
        <i [class]="icon + ' text-lg ' + iconToneClass"></i>
        <span class="text-xs text-ink-muted text-center break-words min-w-0">{{ label }}</span>
      </button>
    </ng-template>
  `,
})
export class SheetTileComponent {
  @Input() icon = '';
  @Input() label = '';
  @Input() link?: string | any[];
  @Input() tone: SheetTileTone = 'primary';
  @Output() activated = new EventEmitter<void>();

  protected readonly tileClass =
    'flex flex-col items-center gap-2 p-3 rounded-control hover:bg-surface-sunken no-underline min-h-[48px] w-full min-w-0';

  protected get iconToneClass(): string {
    return this.tone === 'danger' ? 'text-danger-500' : 'text-primary-600 dark:text-primary-300';
  }
}
