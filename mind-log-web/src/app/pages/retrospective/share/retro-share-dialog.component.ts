import { AfterViewInit, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Retrospective } from '../../../models/retrospective/retrospective.interface';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { FormatPipe } from '../../../pipes/format.pipe';
import { BtnComponent, ModalComponent, ModalRef, ToggleComponent } from '../../../shared/ui';
import { RetroShareService } from './retro-share.service';
import { canvasToBlob, drawShareCard, SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from './share-card';

/**
 * Prévia da imagem da retrospectiva e as saídas dela: compartilhar (onde o aparelho deixa) e baixar.
 * Aberto pelo `ModalService`. O que aparece na prévia é exatamente o que sai no arquivo: é a mesma `<canvas>`.
 * Os títulos começam escondidos: a imagem sai com números, e quem quer mostrar o que viu liga o interruptor.
 */
@Component({
  selector: 'app-retro-share-dialog',
  standalone: true,
  imports: [FormsModule, FormatPipe, TranslatePipe, BtnComponent, ModalComponent, ToggleComponent],
  templateUrl: './retro-share-dialog.component.html',
})
export class RetroShareDialogComponent implements AfterViewInit {
  private readonly shareService = inject(RetroShareService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);
  readonly modalRef = inject(ModalRef);

  @ViewChild('preview', { static: true }) private preview!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) data!: Retrospective;

  readonly width = SHARE_CARD_WIDTH;
  readonly height = SHARE_CARD_HEIGHT;
  readonly canShare = this.shareService.canShareFiles();

  showTitles = false;
  rendering = true;
  sending = false;

  /** Só vale o desenho da última escolha: ligar e desligar rápido não deixa um desenho velho por cima. */
  private drawn = 0;

  ngAfterViewInit(): void {
    void this.redraw();
  }

  onShowTitles(value: boolean): void {
    this.showTitles = value;
    void this.redraw();
  }

  async share(): Promise<void> {
    await this.deliver(async blob => { await this.shareService.share(blob, this.data.year); });
  }

  async download(): Promise<void> {
    await this.deliver(async blob => this.shareService.download(blob, this.data.year));
  }

  private async deliver(send: (blob: Blob) => Promise<void>): Promise<void> {
    this.sending = true;
    try {
      await send(await canvasToBlob(this.preview.nativeElement));
    } catch {
      this.toastr.error(this.i18n.t('toast.retroShareFailed'));
    } finally {
      this.sending = false;
    }
  }

  private async redraw(): Promise<void> {
    const turn = ++this.drawn;
    this.rendering = true;
    try {
      await drawShareCard(this.preview.nativeElement, this.shareService.buildModel(this.data, this.showTitles), this.shareService.mascotSvg);
    } catch {
      if (turn === this.drawn) this.toastr.error(this.i18n.t('toast.retroShareFailed'));
    } finally {
      if (turn === this.drawn) this.rendering = false;
    }
  }
}
