import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../services/user-media.service';
import { I18nService } from '../../services/i18n.service';
import { PlannedGroup } from '../../models/media/planned-group.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  IconBtnComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  SkeletonComponent,
} from '../../shared/ui';

@Component({
  selector: 'app-planned',
  standalone: true,
  imports: [
    NgClass, DatePipe, RouterLink, CdkDropList, CdkDrag, CdkDragHandle, TranslatePipe, SystemNamePipe,
    CardComponent, BadgeComponent, BtnComponent, IconBtnComponent, PageHeaderComponent, EmptyStateComponent,
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
    this.userMediaService.getPlanned().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: () => {
        this.toastr.error(this.i18n.t('toast.loadFailed'));
        this.loading = false;
      },
    });
  }

  isSaving(group: PlannedGroup): boolean {
    return this.savingTypeIds.has(group.mediaType.id);
  }

  onDrop(group: PlannedGroup, event: CdkDragDrop<PlannedGroup>): void {
    if (event.previousIndex === event.currentIndex) return;

    const previous = [...group.items];
    moveItemInArray(group.items, event.previousIndex, event.currentIndex);

    const typeId = group.mediaType.id;
    this.savingTypeIds.add(typeId);
    this.userMediaService.reorderPlanned(group.items.map(i => i.id)).subscribe({
      next: () => {
        this.savingTypeIds.delete(typeId);
        this.toastr.success(this.i18n.t('toast.plannedReordered'));
      },
      error: () => {
        group.items = previous;
        this.savingTypeIds.delete(typeId);
        this.toastr.error(this.i18n.t('toast.plannedReorderFailed'));
      },
    });
  }
}
