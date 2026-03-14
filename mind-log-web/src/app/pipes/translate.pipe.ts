import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private i18n = inject(I18nService);
  private cd = inject(ChangeDetectorRef);
  private sub: Subscription;

  constructor() {
    this.sub = this.i18n.lang$.subscribe(() => this.cd.markForCheck());
  }

  transform(key: string): string {
    return this.i18n.t(key);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
