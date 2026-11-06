import {Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy} from '@angular/core';

// Conta de um número até o outro no próprio elemento, sem mudar a estrutura do
// template: `<p appCountUp [appCountUp]="total"></p>`.
//
// O elemento passa a ser DO DIRETIVO: ele escreve `textContent` direto. Por isso
// não pode sobrar interpolação dentro dele — `{{ total }}` seria reescrito pelo
// Angular a cada verificação e as duas escritas brigariam. Prefixo e sufixo
// entram por `countUpPrefix` / `countUpSuffix`, não como texto solto ao lado.
//
// A contagem roda FORA da zona do Angular: são ~60 quadros por segundo, e cada
// um deles dentro da zona dispararia uma rodada de change detection inteira.
//
// Casa com `tabular-nums` no elemento (todos os números do app já têm): sem
// largura fixa de dígito o número tremeria a cada quadro.
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnChanges, OnDestroy {
  /** Valor final. Não sendo número finito, é escrito como texto e nada anima. */
  @Input('appCountUp') value: number | string | null | undefined;
  /** Texto antes do número (ex.: `+` nas métricas de "hoje" do admin). */
  @Input() countUpPrefix = '';
  /** Texto depois do número (ex.: `%`). */
  @Input() countUpSuffix = '';

  private static duration?: number;

  private displayed = 0;
  private frame = 0;
  private guard?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
  ) {}

  ngOnChanges(): void {
    const target = typeof this.value === 'number' ? this.value : Number(this.value);

    if (this.value === null || this.value === undefined || this.value === '' || !Number.isFinite(target)) {
      this.cancel();
      this.host.nativeElement.textContent = this.value == null ? '' : String(this.value);
      return;
    }

    this.animateTo(target);
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  // Lido uma vez do `:root`: a duração é token como qualquer outra, não número
  // escrito dentro do componente.
  private static resolveDuration(): number {
    if (CountUpDirective.duration !== undefined) return CountUpDirective.duration;

    let value = 900;
    if (typeof window !== 'undefined') {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--ml-dur-count').trim();
      const parsed = raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : NaN;
      if (Number.isFinite(parsed) && parsed > 0) value = parsed;
    }

    CountUpDirective.duration = value;
    return value;
  }

  private animateTo(target: number): void {
    this.cancel();

    const from = this.displayed;
    // Quem pediu menos movimento recebe o número, não a contagem. A consulta é
    // feita a cada animação porque a preferência pode mudar com a tela aberta.
    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (from === target || reduced || typeof window === 'undefined') {
      this.settle(target);
      return;
    }

    const duration = CountUpDirective.resolveDuration();
    const decimals = this.decimalsOf(target);
    const element = this.host.nativeElement;

    // Enquanto conta, o número no DOM é intermediário: `aria-busy` avisa o
    // leitor de tela a esperar, e sai só depois do valor final estar escrito.
    element.setAttribute('aria-busy', 'true');

    this.zone.runOutsideAngular(() => {
      const started = performance.now();

      // Rede de segurança: `requestAnimationFrame` PARA de ser chamado quando a
      // janela não está sendo pintada (aba de fundo, janela coberta) — e nesse
      // caso `document.visibilityState` pode continuar dizendo "visible", então
      // ouvir `visibilitychange` não cobriria. Sem isto, o número ficaria
      // congelado num valor intermediário, com `aria-busy` preso em "true".
      // Temporizador continua disparando onde o quadro não vem.
      this.guard = setTimeout(() => this.settle(target), duration + 150);

      const step = (now: number) => {
        const elapsed = now - started;

        if (elapsed >= duration) {
          this.frame = 0;
          this.settle(target);
          return;
        }

        // easeOutCubic: anda rápido no começo e assenta no fim, que é o que faz
        // a contagem parecer chegar em vez de ser cortada.
        const t = elapsed / duration;
        const eased = 1 - Math.pow(1 - t, 3);
        this.write(from + (target - from) * eased, decimals);
        this.frame = requestAnimationFrame(step);
      };

      this.frame = requestAnimationFrame(step);
    });
  }

  private settle(target: number): void {
    this.clearTimers();
    this.displayed = target;
    this.write(target, this.decimalsOf(target));
    this.host.nativeElement.removeAttribute('aria-busy');
  }

  private write(current: number, decimals: number): void {
    this.host.nativeElement.textContent = this.countUpPrefix + current.toFixed(decimals) + this.countUpSuffix;
  }

  // O alvo manda nas casas decimais: 12 conta como inteiro, 4,5 conta com uma
  // casa. Arredondar tudo para inteiro cortaria média de nota.
  private decimalsOf(value: number): number {
    const text = String(value);
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : Math.min(text.length - dot - 1, 2);
  }

  private cancel(): void {
    const running = this.frame !== 0 || this.guard !== undefined;
    this.clearTimers();
    if (running) this.host.nativeElement.removeAttribute('aria-busy');
  }

  private clearTimers(): void {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    if (this.guard !== undefined) {
      clearTimeout(this.guard);
      this.guard = undefined;
    }
  }
}
