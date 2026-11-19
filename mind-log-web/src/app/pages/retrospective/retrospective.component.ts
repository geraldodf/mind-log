import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, map, merge, of, Subject, switchMap, tap } from 'rxjs';
import { RetrospectiveService } from '../../services/retrospective.service';
import { Retrospective } from '../../models/retrospective/retrospective.interface';
import { FormatPipe } from '../../pipes/format.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RetroStoryComponent } from './story/retro-story.component';
import {
  AlertComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  LoadErrorComponent,
  PageHeaderComponent,
  SkeletonComponent,
  TextLinkComponent,
} from '../../shared/ui';

/** Mesma faixa de anos que a API aceita. */
const MIN_YEAR = 1900;
const MAX_YEAR = 9999;

@Component({
  selector: 'app-retrospective',
  standalone: true,
  imports: [
    RouterLink, FormatPipe, TranslatePipe,
    AlertComponent, BtnComponent, CardComponent, EmptyStateComponent, LoadErrorComponent,
    PageHeaderComponent, SkeletonComponent, TextLinkComponent, RetroStoryComponent,
  ],
  templateUrl: './retrospective.component.html',
})
export class RetrospectiveComponent implements OnInit {
  private readonly service = inject(RetrospectiveService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  /** "Tentar de novo": a rota é a mesma, então o `paramMap` não emite; este canal refaz a carga. */
  private readonly reload = new Subject<void>();

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
    merge(this.route.paramMap, this.reload.pipe(map(() => this.route.snapshot.paramMap))).pipe(
      tap(() => { this.loading = true; this.loadError = false; }),
      // switchMap descarta a resposta de um ano que já saiu de tela; o catchError fica por dentro
      // para uma falha não encerrar o fluxo e os links de ano continuarem carregando.
      switchMap(params => this.service.getYears().pipe(
        switchMap(years => {
          this.years = years;
          const requested = Number(params.get('year'));
          if (params.has('year') && !(Number.isInteger(requested) && requested >= MIN_YEAR && requested <= MAX_YEAR)) {
            void this.router.navigate(['/retrospective'], { replaceUrl: true });
            return of(null);
          }
          this.year = params.has('year') ? requested : (years[0] ?? new Date().getFullYear());
          return this.service.get(this.year);
        }),
        catchError(() => { this.loadError = true; this.loading = false; return EMPTY; }),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => { this.data = data; this.loading = data === null; });
  }

  /** Fechar a história leva ao início: quem chegou por link direto não tem para onde "voltar". */
  exit(): void {
    void this.router.navigateByUrl('/');
  }

  retry(): void {
    this.reload.next();
  }
}
