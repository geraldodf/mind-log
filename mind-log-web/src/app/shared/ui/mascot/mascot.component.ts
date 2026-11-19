import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {MASCOT_ART, MASCOT_CSS, MascotPose} from './mascot-art.generated';
import {MascotLife} from './mascot-life';

/** Se o token de movimento não puder ser lido (teste sem CSS), o mascote usa os 300 ms do `slow`. */
const FALLBACK_BEAT = 300;

/** O corpo é desenhado num quadro 160 × 150; a cabeça é quadrada. */
const BODY_ASPECT = 160 / 150;

/**
 * O mascote do MindLog: o nó do logo com rosto. A arte vem de `brand/mascot/mascot.js`, fonte única
 * de todo desenho, pelo `mascot-art.generated.ts` (gere de novo com `node brand/mascot/build.js`);
 * onde ele aparece, e com que texto, está em `brand/mascot/playbook.html`.
 *
 * A arte é SVG estático gerado no build, nunca dado de usuário, por isso confiar nela como HTML é
 * seguro. Vivo por padrão (`mascot-life.ts`): pisca, dorme na tela vazia, se assusta no erro e para sozinho
 * depois de ~30 s sem interação; `[alive]="false"` devolve o desenho parado. Com movimento reduzido o
 * desenho fica parado. É decorativo por padrão, porque sempre vem ao lado de um título que diz o mesmo.
 */
@Component({
  selector: 'app-mascot',
  standalone: true,
  template: '',
  styles: [MASCOT_CSS, 'app-mascot{display:inline-block;flex:none;line-height:0}app-mascot svg{display:block;width:100%;height:100%}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MascotComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private life?: MascotLife;

  @Input({required: true}) pose!: MascotPose;
  /** Altura em px. O corpo é um pouco mais largo que alto; a cabeça é quadrada. */
  @Input() size = 128;
  /** Só a cabeça: abas, avatar e qualquer lugar abaixo de 96 px. */
  @Input() headOnly = false;
  /** Quando o mascote carrega sentido próprio; sem isso fica oculto para tecnologia assistiva. */
  @Input() label: string | null = null;
  /** Reage ao estado da tela (pisca, dorme, susto). Falso devolve o desenho parado: avatar, lista densa, dropdown. */
  @Input() alive = true;

  /** Calculado só quando uma entrada muda: um SafeHtml novo a cada verificação recriaria o SVG e reiniciaria a animação. */
  @HostBinding('innerHTML') markup: SafeHtml = '';

  @HostBinding('style.height.px') get height(): number {
    return this.size;
  }

  @HostBinding('style.width.px') get width(): number {
    return this.headOnly ? this.size : Math.round(this.size * BODY_ASPECT);
  }

  @HostBinding('attr.aria-hidden') get hidden(): string | null {
    return this.label ? null : 'true';
  }

  @HostBinding('attr.role') get role(): string | null {
    return this.label ? 'img' : null;
  }

  @HostBinding('attr.aria-label') get ariaLabel(): string | null {
    return this.label;
  }

  ngOnChanges(): void {
    const art = MASCOT_ART[this.pose];
    this.markup = this.sanitizer.bypassSecurityTrustHtml(this.headOnly ? art.head : art.body);
    this.life?.update(this.pose, this.alive);
  }

  ngAfterViewInit(): void {
    this.life = new MascotLife(this.host, {beat: this.beat()});
    this.life.update(this.pose, this.alive);
  }

  ngOnDestroy(): void {
    this.life?.stop();
  }

  /** A duração `slow` lida do token `--ml-dur-slow`: os tempos da vida são múltiplos dela. */
  private beat(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--ml-dur-slow').trim();
    const ms = raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : NaN;
    return Number.isFinite(ms) && ms > 0 ? ms : FALLBACK_BEAT;
  }
}
