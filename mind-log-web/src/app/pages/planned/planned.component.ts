import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../services/user-media.service';
import { I18nService } from '../../services/i18n.service';
import { PlannedGroup } from '../../models/media/planned-group.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {CountLabelPipe} from '../../pipes/count-label.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  LoadErrorComponent,
  IconBtnComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  SkeletonComponent,
} from '../../shared/ui';
import {IconComponent} from '../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-planned',
  standalone: true,
  imports: [CountLabelPipe, IconComponent, 
    NgClass, DatePipe, RouterLink, CdkDropList, CdkDrag, CdkDragHandle, TranslatePipe, SystemNamePipe,
    CardComponent, BadgeComponent, BtnComponent, IconBtnComponent, PageHeaderComponent, EmptyStateComponent, LoadErrorComponent,
    SkeletonComponent, RatingStarsComponent,
  ],
  templateUrl: './planned.component.html',
})
export class PlannedComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);

  groups: PlannedGroup[] = [];
  loading = false;
  loadError = false;
  /** Texto lido pelo leitor de tela depois de mover um item. */
  announcement = '';

  /** Tipos de mídia com uma reordenação em voo: o arraste fica bloqueado até a resposta. */
  private readonly savingTypeIds = new Set<number>();

  get totalCount(): number {
    return this.groups.reduce((sum, g) => sum + g.items.length, 0);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.userMediaService.getPlanned().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  isSaving(group: PlannedGroup): boolean {
    return this.savingTypeIds.has(group.mediaType.id);
  }

  onDrop(group: PlannedGroup, event: CdkDragDrop<PlannedGroup>): void {
    this.move(group, event.previousIndex, event.currentIndex, true);
  }

  /** Seta para cima/baixo no cabo: mesma reordenação do arrastar, sem precisar arrastar. */
  onHandleKeydown(event: KeyboardEvent, group: PlannedGroup, index: number): void {
    const step = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!step) return;
    event.preventDefault();
    const target = index + step;
    if (this.isSaving(group) || target < 0 || target >= group.items.length) return;
    this.move(group, index, target, false);
    // O item mudou de linha: o foco acompanha o cabo dele.
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-handle="${group.mediaType.id}-${target}"] button`)?.focus());
  }

  /** `notify`: toast de sucesso no arraste; no teclado o aviso falado já basta. */
  private move(group: PlannedGroup, from: number, to: number, notify: boolean): void {
    if (from === to) return;

    const previous = [...group.items];
    moveItemInArray(group.items, from, to);
    this.announcement = this.i18n.t('planned.movedTo')
      .replace('{title}', group.items[to].title)
      .replace('{position}', String(to + 1))
      .replace('{total}', String(group.items.length));

    const typeId = group.mediaType.id;
    this.savingTypeIds.add(typeId);
    this.userMediaService.reorderPlanned(group.items.map(i => i.id)).subscribe({
      next: () => {
        this.savingTypeIds.delete(typeId);
        if (notify) this.toastr.success(this.i18n.t('toast.plannedReordered'));
      },
      error: () => {
        group.items = previous;
        this.savingTypeIds.delete(typeId);
        this.toastr.error(this.i18n.t('toast.plannedReorderFailed'));
      },
    });
  }
}
