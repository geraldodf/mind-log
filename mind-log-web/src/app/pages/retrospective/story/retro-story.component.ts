import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Subscription } from 'rxjs';
import { Retrospective } from '../../../models/retrospective/retrospective.interface';
import { I18nService } from '../../../services/i18n.service';
import { CountLabelPipe } from '../../../pipes/count-label.pipe';
import { FormatPipe } from '../../../pipes/format.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { RetroShareDialogComponent } from '../share/retro-share-dialog.component';
import {
  AlertComponent,
  BadgeComponent,
  BtnComponent,
  CardComponent,
  CountUpDirective,
  IconBtnComponent,
  MascotComponent,
  ModalService,
  RatingStarsComponent,
  StoryProgressComponent,
  TextLinkComponent,
} from '../../../shared/ui';

type SlideId = 'intro' | 'total' | 'types' | 'months' | 'rated' | 'taste' | 'feelings' | 'outro';

/** Arrasto horizontal mínimo, em px, para contar como "passar", e não como toque. */
const SWIPE_DISTANCE = 48;
/** A fração esquerda da tela volta; o resto avança. */
const BACK_ZONE = 0.3;
/** Quantos tipos de mídia aparecem no ranking. */
const TYPES_SHOWN = 5;

/**
 * A retrospectiva do ano como sequência de telas, em tela cheia. O avanço é manual (toque,
 * setas, arrastar): sem relógio, quem lê decide o ritmo. A versão curta (`lowData`) tem só
 * abertura, total com os títulos e fecho; a completa pula a tela que não tem dado.
 */
@Component({
  selector: 'app-retro-story',
  standalone: true,
  imports: [
    CdkTrapFocus, CountLabelPipe, FormatPipe, SystemNamePipe, TranslatePipe,
    AlertComponent, BadgeComponent, BtnComponent, CardComponent, CountUpDirective, IconBtnComponent, MascotComponent,
    RatingStarsComponent, StoryProgressComponent, TextLinkComponent,
  ],
  templateUrl: './retro-story.component.html',
  // A barra cresce de 0 a 1 em `transform`; o tamanho final vem do `width`/`height` do próprio elemento.
  styles: [`
    @keyframes retro-grow-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes retro-grow-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    .retro-bar-x {
      transform-origin: left;
      animation: retro-grow-x var(--ml-dur-enter) var(--ml-ease-enter) both;
      animation-delay: calc(var(--ml-dur-stagger) * var(--i, 0));
    }
    .retro-bar-y {
      transform-origin: bottom;
      animation: retro-grow-y var(--ml-dur-enter) var(--ml-ease-enter) both;
      animation-delay: calc(var(--ml-dur-stagger) * var(--i, 0));
    }
  `],
})
export class RetroStoryComponent implements OnInit, OnChanges, OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly modals = inject(ModalService);

  @Input({ required: true }) data!: Retrospective;
  /** Anos com retrospectiva, para o fecho oferecer os outros. */
  @Input() years: number[] = [];
  @Input() inProgress = false;
  @Output() closed = new EventEmitter<void>();

  readonly round = Math.round;

  slides: SlideId[] = [];
  index = 0;
  monthNames: string[] = [];
  monthLetters: string[] = [];

  private startX = 0;
  private startY = 0;
  private langSub?: Subscription;

  get slide(): SlideId {
    return this.slides[this.index];
  }

  get isLast(): boolean {
    return this.index === this.slides.length - 1;
  }

  get typeRanking() {
    return this.data.byType.slice(0, TYPES_SHOWN);
  }

  get busiestMonthName(): string {
    return this.data.busiestMonth ? this.monthNames[this.data.busiestMonth - 1] : '';
  }

  get busiestMonthCount(): number {
    return this.data.busiestMonth ? this.data.byMonth[this.data.busiestMonth - 1] : 0;
  }

  /** Texto do gráfico para leitor de tela: o gráfico em si é só desenho. */
  get monthsSummary(): string {
    return this.data.byMonth.map((n, i) => `${this.monthNames[i]}: ${n}`).join(', ');
  }

  get totalUnitKey(): string {
    return this.data.totalCompleted === 1 ? 'media.entries.one' : 'media.entries';
  }

  get otherYears(): number[] {
    return this.years.filter(y => y !== this.data.year);
  }

  /** Largura da barra de um tipo, em % da maior. */
  typeWidth(count: number): number {
    const max = this.data.byType[0]?.count || 1;
    return Math.round((count / max) * 100);
  }

  /** Altura da coluna de um mês, em % do mês mais cheio; mês vazio fica um filete. */
  monthHeight(count: number): number {
    const max = Math.max(...this.data.byMonth, 1);
    return count === 0 ? 2 : Math.max(8, Math.round((count / max) * 100));
  }

  /** O mês mais cheio leva o gradiente; os outros, um tom de marca; mês vazio, só um filete. Classes inteiras: o JIT do Tailwind não monta nome. */
  monthBarClass(count: number, index: number): string {
    if (index + 1 === this.data.busiestMonth) return 'bg-grad-brand';
    return count === 0 ? 'bg-hairline' : 'bg-primary-400 dark:bg-primary-500/40';
  }

  ngOnInit(): void {
    // O `<main>` tem `view-transition-name`, que vira contêiner de elemento `fixed` e prende o z-index dentro dele:
    // a tela cheia ficaria deslocada e abaixo da barra lateral. No `<body>` (como o ModalService) cobre tudo.
    document.body.appendChild(this.host.nativeElement);
    // O corpo da página atrás não rola junto no celular. `html` e não `body`: o diálogo de compartilhar usa a classe do `body`.
    document.documentElement.style.overflow = 'hidden';
    this.langSub = this.i18n.lang$.subscribe(() => this.buildMonthNames());
  }

  ngOnChanges(): void {
    this.slides = this.buildSlides();
    this.index = 0;
    this.buildMonthNames();
  }

  ngOnDestroy(): void {
    document.documentElement.style.overflow = '';
    this.langSub?.unsubscribe();
  }

  next(): void {
    if (this.index < this.slides.length - 1) this.index++;
  }

  prev(): void {
    if (this.index > 0) this.index--;
  }

  replay(): void {
    this.index = 0;
  }

  close(): void {
    this.closed.emit();
  }

  share(): void {
    this.modals.open(RetroShareDialogComponent, { data: this.data });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Diálogo aberto por cima (compartilhar): as teclas são dele.
    if (document.querySelector('app-modal [role="dialog"]')) return;
    if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'Escape') this.close();
  }

  onPointerDown(event: PointerEvent): void {
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  /** Arrastar passa a tela; tocar à esquerda volta, no resto avança. Botão e link ficam com o próprio clique. */
  onPointerUp(event: PointerEvent): void {
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) this.next(); else this.prev();
      return;
    }
    if ((event.target as HTMLElement).closest('button, a, [data-no-tap]')) return;
    const area = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (event.clientX - area.left < area.width * BACK_ZONE) this.prev(); else this.next();
  }

  /** Só entra a tela que tem o que mostrar. */
  private buildSlides(): SlideId[] {
    const d = this.data;
    if (d.lowData) return ['intro', 'total', 'outro'];
    const slides: SlideId[] = ['intro', 'total', 'types', 'months'];
    if (d.topRated.length > 0) slides.push('rated');
    if (d.averageRating !== null || d.recommendedCount > 0) slides.push('taste');
    if (d.topFeelings.length > 0) slides.push('feelings');
    slides.push('outro');
    return slides;
  }

  private buildMonthNames(): void {
    const locale = this.i18n.current === 'pt' ? 'pt-BR' : 'en-US';
    const long = new Intl.DateTimeFormat(locale, { month: 'long' });
    const narrow = new Intl.DateTimeFormat(locale, { month: 'narrow' });
    // Dia 15 e fuso local: nenhum mês escorrega para o vizinho.
    const months = Array.from({ length: 12 }, (_, m) => new Date(2000, m, 15));
    this.monthNames = months.map(d => long.format(d));
    this.monthLetters = months.map(d => narrow.format(d));
  }
}
