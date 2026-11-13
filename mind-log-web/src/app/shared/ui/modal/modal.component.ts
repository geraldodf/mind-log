import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {NgClass} from '@angular/common';
import {isObservable, Observable, take} from 'rxjs';
import {A11yModule} from '@angular/cdk/a11y';
import {TranslatePipe} from '../../../pipes/translate.pipe';
import {IconBtnComponent} from '../icon-btn/icon-btn.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-4xl',
};

/** Duração da saída = `--ml-dur-fast`; o elemento só sai do DOM depois dela. */
const EXIT_MS = 150;

/**
 * Diálogo único do app. No celular é folha de baixo (sobe da borda, o polegar
 * alcança as ações); a partir de `sm` vira diálogo central. Fecha no Esc (só
 * o do topo, quando há dois empilhados), no fundo e no X; `canClose` deixa a
 * tela perguntar antes de fechar com alterações não salvas.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgClass, A11yModule, TranslatePipe, IconBtnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rendered) {
      <div class="fixed inset-0 z-modal flex items-end sm:items-center justify-center sm:p-4 bg-overlay backdrop-blur-sm"
           [ngClass]="leaving ? 'animate-fade-out' : 'animate-fade-in'"
           (click)="onBackdropClick()">
        <!-- cdkTrapFocus com autoCapture: o Tab não escapa para a página atrás e
             o foco volta para quem abriu o diálogo quando ele fecha. -->
        <div cdkTrapFocus [cdkTrapFocusAutoCapture]="true"
             role="dialog" aria-modal="true"
             [attr.aria-labelledby]="title ? titleId : null"
             [attr.aria-label]="title ? null : (ariaLabel || ('ui.dialog' | translate))"
             class="w-full max-h-[92dvh] flex flex-col overflow-hidden bg-surface-raised shadow-lg
                    rounded-t-panel sm:rounded-panel pb-[env(safe-area-inset-bottom)] sm:pb-0"
             [ngClass]="[sizeClass, leaving ? 'animate-sheet-out sm:animate-scale-out' : 'animate-slide-up sm:animate-scale-in']"
             (click)="$event.stopPropagation()">
          <div class="sm:hidden flex justify-center pt-3" aria-hidden="true">
            <span class="w-10 h-1 rounded-full bg-hairline-strong"></span>
          </div>
          @if (title) {
            <div class="flex items-center justify-between gap-4 px-6 pt-4 sm:pt-6 pb-4 border-b border-hairline">
              <h2 class="text-lg font-semibold tracking-tight text-ink" [id]="titleId">{{ title }}</h2>
              <app-icon-btn icon="xmark" [ariaLabel]="'common.close' | translate" (click)="close()"></app-icon-btn>
            </div>
          }
          <div class="p-6 flex-1 overflow-y-auto overscroll-contain text-ink-muted">
            <ng-content></ng-content>
          </div>
          @if (hasFooter) {
            <div class="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-hairline bg-surface-sunken">
              <ng-content select="[modalFooter]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent implements OnChanges, OnDestroy {
  private static nextId = 0;
  /** Diálogos abertos, do mais antigo ao do topo: Esc e trava de rolagem olham para cá. */
  private static readonly stack: ModalComponent[] = [];

  private readonly cdr = inject(ChangeDetectorRef);

  @Input() open = false;
  @Input() title = '';
  /** Nome acessível quando não há título visível. */
  @Input() ariaLabel = '';
  @Input() size: ModalSize = 'md';
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = false;
  /**
   * Chamado antes de fechar pelo X, Esc, fundo ou `close()`. `false` (ou um
   * Observable que emite `false`, como a pergunta de descartar) mantém aberto.
   */
  @Input() canClose: () => boolean | Observable<boolean> = () => true;
  @Output() closed = new EventEmitter<void>();

  readonly titleId = `app-modal-${ModalComponent.nextId++}-title`;
  rendered = false;
  leaving = false;
  /** Esperando a resposta do `canClose` assíncrono: ignora novos pedidos de fechar. */
  private asking = false;
  private exitTimer?: ReturnType<typeof setTimeout>;

  get sizeClass(): string {
    return SIZE_CLASSES[this.size];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;
    if (this.open) this.show();
    else if (this.rendered && !this.leaving) this.hide(false);
  }

  ngOnDestroy(): void {
    clearTimeout(this.exitTimer);
    this.release();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.rendered && !this.leaving && ModalComponent.stack.at(-1) === this) this.close();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) this.close();
  }

  /** Fecha pelo X, Esc ou fundo, ou por quem projetou conteúdo (botão Cancelar). */
  close(): void {
    if (!this.rendered || this.leaving || this.asking) return;
    const allowed = this.canClose();
    if (!isObservable(allowed)) {
      if (allowed) this.hide(true);
      return;
    }
    this.asking = true;
    allowed.pipe(take(1)).subscribe(ok => {
      this.asking = false;
      if (ok) this.hide(true);
    });
  }

  private show(): void {
    clearTimeout(this.exitTimer);
    this.leaving = false;
    if (this.rendered) return;
    this.rendered = true;
    ModalComponent.stack.push(this);
    ModalComponent.syncScrollLock();
  }

  private hide(emit: boolean): void {
    this.leaving = true;
    this.cdr.markForCheck();
    this.exitTimer = setTimeout(() => {
      this.rendered = false;
      this.leaving = false;
      this.release();
      this.cdr.markForCheck();
      if (emit) this.closed.emit();
    }, EXIT_MS);
  }

  private release(): void {
    const i = ModalComponent.stack.indexOf(this);
    if (i >= 0) ModalComponent.stack.splice(i, 1);
    ModalComponent.syncScrollLock();
  }

  // Sem isto a página de trás continua rolando sob o diálogo no celular.
  private static syncScrollLock(): void {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('overflow-hidden', ModalComponent.stack.length > 0);
  }
}
