import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {IconComponent, IconName} from '../icon/icon.component';
import {MascotComponent} from '../mascot/mascot.component';
import {MascotPose} from '../mascot/mascot-art.generated';

/** Situação que o estado vazio comunica; vira a pose do mascote. */
export type EmptyStatePose = 'neutral' | 'empty' | 'search' | 'error' | 'celebrate';

const POSE_ICONS: Record<EmptyStatePose, IconName> = {
  neutral: 'hand',
  empty: 'inbox',
  search: 'magnifying-glass',
  error: 'plug-circle-xmark',
  celebrate: 'champagne-glasses',
};

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent, NgIf, MascotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center"
         [class.py-16]="!compact" [class.py-8]="compact"
         [attr.role]="pose === 'error' ? 'alert' : null">
      <app-mascot *ngIf="mascot; else iconTpl" class="mb-4" [pose]="mascotPose" [size]="compact ? 96 : 128"></app-mascot>
      <ng-template #iconTpl>
        <div class="w-14 h-14 rounded-full bg-grad-brand-soft flex items-center justify-center mb-4">
          <app-icon [name]="iconName" size="2xl" class="text-primary-700 dark:text-primary-300"></app-icon>
        </div>
      </ng-template>
      <h3 class="font-display text-lg font-semibold text-ink mb-1">{{ title }}</h3>
      <p *ngIf="description" class="text-sm text-ink-muted max-w-sm mb-4">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  /** Primeiro uso vazio (`empty`), busca sem resultado (`search`), falha de carga (`error`). */
  @Input() pose: EmptyStatePose = 'empty';
  /**
   * O mascote em pose (padrão). Falso só onde o mascote não entra (administração):
   * aí vale o ícone. Ver brand/mascot/playbook.html.
   */
  @Input() mascot = true;
  /** Ícone usado quando `mascot` é falso; sem ele, vale o ícone da pose. */
  @Input() icon?: IconName;
  @Input() title = '';
  @Input() description?: string;
  /** Versão baixa, para dentro de card ou seção. */
  @Input() compact = false;

  get mascotPose(): MascotPose {
    return this.pose === 'neutral' ? 'wave' : this.pose;
  }

  get iconName(): IconName {
    return this.icon || POSE_ICONS[this.pose];
  }
}
