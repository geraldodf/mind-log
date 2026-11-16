import { ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../services/i18n.service';

/**
 * Número com o rótulo no singular ou no plural: `{{ 3 | countLabel:'media.entries' }}`
 * → "3 entradas"; com 1 usa a chave `<chave>.one` ("1 entrada"). Sem a chave do
 * singular, cai na do plural. Antes a tela mostrava "1 entries".
 */
@Pipe({ name: 'countLabel', standalone: true, pure: false })
export class CountLabelPipe implements PipeTransform, OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly sub: Subscription = this.i18n.lang$.subscribe(() => this.cd.markForCheck());

  transform(count: number | null | undefined, key: string): string {
    const n = count ?? 0;
    const label = n === 1 && this.i18n.has(key + '.one') ? this.i18n.t(key + '.one') : this.i18n.t(key);
    return `${n} ${label}`;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
