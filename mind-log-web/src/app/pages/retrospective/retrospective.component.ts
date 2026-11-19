import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, switchMap, tap } from 'rxjs';
import { RetrospectiveService } from '../../services/retrospective.service';
import { Retrospective } from '../../models/retrospective/retrospective.interface';
import { FormatPipe } from '../../pipes/format.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  AlertComponent,
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  LoadErrorComponent,
  PageHeaderComponent,
  SkeletonComponent,
  StatCardComponent,
  TextLinkComponent,
} from '../../shared/ui';

@Component({
  selector: 'app-retrospective',
  standalone: true,
  imports: [
    RouterLink, FormatPipe, TranslatePipe,
    AlertComponent, BadgeComponent, BtnComponent, CardComponent, EmptyStateComponent, LoadErrorComponent,
    PageHeaderComponent, SkeletonComponent, StatCardComponent, TextLinkComponent,
  ],
  templateUrl: './retrospective.component.html',
})
export class RetrospectiveComponent implements OnInit {
  private readonly service = inject(RetrospectiveService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Anos com ao menos uma mídia concluída, do mais novo para o mais antigo. */
  years: number[] = [];
  /** O ano em tela: o da rota, ou o mais recente quando a rota não traz ano. */
  year = new Date().getFullYear();
  data: Retrospective | null = null;
  loading = true;
  loadError = false;

  /** Até 31/12 o ano corrente ainda pode mudar. */
  get inProgress(): boolean {
    return this.year === new Date().getFullYear();
  }

  /** Os outros anos, para o aviso de ano vazio. */
  get otherYears(): number[] {
    return this.years.filter(y => y !== this.year);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => { this.loading = true; this.loadError = false; }),
      // switchMap descarta a resposta de um ano que já saiu de tela.
      switchMap(params => this.service.getYears().pipe(
        switchMap(years => {
          this.years = years;
          const requested = Number(params.get('year'));
          if (params.has('year') && !Number.isInteger(requested)) {
            void this.router.navigate(['/retrospective'], { replaceUrl: true });
            return of(null);
          }
          this.year = params.has('year') ? requested : (years[0] ?? new Date().getFullYear());
          return this.service.get(this.year);
        }),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (data) => { this.data = data; this.loading = data === null; },
      error: () => { this.loadError = true; this.loading = false; },
    });
  }

  retry(): void {
    void this.router.navigate(['/retrospective', this.year], { onSameUrlNavigation: 'reload' });
  }
}
