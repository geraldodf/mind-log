import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RecommendationService } from '../../../services/recommendation.service';
import { I18nService } from '../../../services/i18n.service';
import { Recommendation, Recommendations } from '../../../models/media/recommendation.interface';
import { ErrorResponse } from '../../../models/util/error-response.interface';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  IconBtnComponent,
  LoadErrorComponent,
  SectionComponent,
  SkeletonComponent,
} from '../../../shared/ui';

/**
 * "Recomendado para você" na Home. Só aparece se a API tem provedor de IA configurado
 * (`enabled`); as sugestões nascem de um clique, nunca sozinhas.
 */
@Component({
  selector: 'app-recommendations-section',
  standalone: true,
  imports: [
    TranslatePipe, SystemNamePipe,
    SectionComponent, CardComponent, BtnComponent, IconBtnComponent, BadgeComponent,
    EmptyStateComponent, LoadErrorComponent, SkeletonComponent,
  ],
  templateUrl: './recommendations-section.component.html',
})
export class RecommendationsSectionComponent implements OnInit {
  private readonly service = inject(RecommendationService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);

  /** Uma sugestão virou entrada: a Home recarrega os totais e a atividade recente. */
  @Output() added = new EventEmitter<void>();

  state: Recommendations | null = null;
  loading = true;
  loadError = false;
  generating = false;

  /** Sugestões com Adicionar/Descartar em voo: o botão fica ocupado e não aceita segundo clique. */
  private readonly busyIds = new Set<number>();

  get visible(): boolean {
    return this.loading || this.loadError || !!this.state?.enabled;
  }

  get canGenerate(): boolean {
    return !!this.state && this.state.eligible && this.state.remaining > 0;
  }

  /** Hora em que uma nova geração volta a caber, no idioma da tela. */
  get limitMessage(): string {
    const at = this.state?.nextAvailableAt;
    if (!at) return '';
    const time = new Date(at).toLocaleTimeString(this.i18n.current === 'pt' ? 'pt-BR' : 'en-US',
      { hour: '2-digit', minute: '2-digit' });
    return this.i18n.t('recommendations.limitReached').replace('{time}', time);
  }

  get remainingMessage(): string {
    return this.i18n.t('recommendations.remaining').replace('{n}', String(this.state?.remaining ?? 0));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.service.get().subscribe({
      next: (state) => { this.state = state; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; },
    });
  }

  generate(): void {
    if (this.generating || !this.canGenerate) return;
    this.generating = true;
    this.service.generate(this.i18n.current).subscribe({
      next: (state) => { this.state = state; this.generating = false; },
      error: (err: ErrorResponse) => {
        this.generating = false;
        this.toastr.error(this.i18n.t(this.generateErrorKey(err.status)));
        // O limite ou a elegibilidade podem ter mudado: a tela volta a refletir o servidor.
        if (err.status === 429 || err.status === 400 || err.status === 503) this.refreshState();
      },
    });
  }

  isBusy(item: Recommendation): boolean {
    return this.busyIds.has(item.id);
  }

  add(item: Recommendation): void {
    if (this.isBusy(item)) return;
    this.busyIds.add(item.id);
    this.service.add(item.id).subscribe({
      next: () => {
        this.busyIds.delete(item.id);
        this.remove(item);
        this.toastr.success(this.i18n.t('toast.recommendationAdded'));
        this.added.emit();
      },
      error: (err: ErrorResponse) => {
        this.busyIds.delete(item.id);
        // 404: a sugestão já foi respondida ou substituída (outra aba): a tela volta a refletir o servidor.
        if (err.status === 404) this.refreshState();
        this.toastr.error(this.i18n.t('toast.recommendationAddFailed'));
      },
    });
  }

  dismiss(item: Recommendation): void {
    if (this.isBusy(item)) return;
    this.busyIds.add(item.id);
    const items = this.state?.items ?? [];
    const index = items.indexOf(item);
    this.remove(item);
    this.service.dismiss(item.id).subscribe({
      next: () => this.busyIds.delete(item.id),
      error: (err: ErrorResponse) => {
        this.busyIds.delete(item.id);
        // 404: a sugestão já não existe (outra aba): o cartão não volta, a tela só se atualiza.
        if (err.status === 404) {
          this.refreshState();
          return;
        }
        // Falha de verdade: o cartão volta para o lugar de onde saiu.
        if (this.state) this.state = { ...this.state, items: this.insertAt(this.state.items, item, index) };
        this.toastr.error(this.i18n.t('toast.recommendationDismissFailed'));
      },
    });
  }

  aria(key: string, item: Recommendation): string {
    return this.i18n.t(key).replace('{title}', item.title);
  }

  private remove(item: Recommendation): void {
    if (this.state) this.state = { ...this.state, items: this.state.items.filter(i => i.id !== item.id) };
  }

  private insertAt(items: Recommendation[], item: Recommendation, index: number): Recommendation[] {
    const copy = [...items];
    copy.splice(Math.max(0, index), 0, item);
    return copy;
  }

  private refreshState(): void {
    this.service.get().subscribe({ next: (state) => this.state = state });
  }

  private generateErrorKey(status: number): string {
    if (status === 429) return 'toast.recommendationsLimit';
    if (status === 400) return 'toast.recommendationsNeedRatings';
    return 'toast.recommendationsFailed';
  }
}
