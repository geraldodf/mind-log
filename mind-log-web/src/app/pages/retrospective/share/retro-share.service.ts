import { inject, Injectable } from '@angular/core';
import { Retrospective } from '../../../models/retrospective/retrospective.interface';
import { I18nService } from '../../../services/i18n.service';
import { MASCOT_ART } from '../../../shared/ui';
import { ShareCardModel } from './share-card';

/** Quantos títulos cabem na imagem. */
const TITLES_SHOWN = 3;
const TYPES_SHOWN = 3;
const FEELINGS_SHOWN = 3;
const REVOKE_DELAY_MS = 10_000;

/** Monta o modelo da imagem a partir da retrospectiva e entrega o arquivo (compartilhar ou baixar). */
@Injectable({ providedIn: 'root' })
export class RetroShareService {
  private readonly i18n = inject(I18nService);

  /** O mascote do fecho, em SVG de texto. */
  get mascotSvg(): string {
    return MASCOT_ART.celebrate.body;
  }

  /** O aparelho sabe compartilhar um arquivo de imagem? (celulares; no desktop a imagem é baixada.) */
  canShareFiles(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && typeof navigator.share === 'function'
      && navigator.canShare({ files: [new File([], 'mindlog.png', { type: 'image/png' })] });
  }

  buildModel(data: Retrospective, showTitles: boolean): ShareCardModel {
    const t = (key: string) => this.i18n.t(key);
    const tiles: ShareCardModel['tiles'] = [];
    if (!data.lowData) {
      if (data.busiestMonth) tiles.push({ label: t('retro.card.month'), value: this.monthName(data.busiestMonth) });
      if (data.averageRating !== null) tiles.push({ label: t('retro.card.rating'), value: this.decimal(data.averageRating) });
      if (data.topFeelings.length > 0) {
        tiles.push({ label: t('retro.card.feelings'), value: data.topFeelings.slice(0, FEELINGS_SHOWN).map(f => f.emoji).join(' ') });
      }
    }

    const titles = !showTitles ? [] : data.lowData ? data.titles : data.topRated.map(r => r.title);
    return {
      year: data.year,
      lead: t('retro.card.lead'),
      total: data.totalCompleted,
      unit: t(data.totalCompleted === 1 ? 'media.entries.one' : 'media.entries'),
      typesHeading: t('retro.card.types'),
      types: data.byType.slice(0, TYPES_SHOWN).map(type => ({ label: this.i18n.translateName(type.name), count: type.count })),
      tiles,
      titlesHeading: t(data.lowData ? 'retro.card.finished' : 'retro.card.top'),
      titles: titles.slice(0, TITLES_SHOWN),
      footer: 'MindLog',
    };
  }

  /** Abre a folha de compartilhar do sistema; devolve `false` quando quem usa desistiu. */
  async share(blob: Blob, year: number): Promise<boolean> {
    const file = new File([blob], this.fileName(year), { type: 'image/png' });
    try {
      await navigator.share({ files: [file], title: this.i18n.t('retro.title').replace('{year}', String(year)) });
      return true;
    } catch (error) {
      // Fechar a folha sem escolher lança AbortError: é desistência, não falha.
      if (error instanceof DOMException && error.name === 'AbortError') return false;
      throw error;
    }
  }

  download(blob: Blob, year: number): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.fileName(year);
    link.click();
    // Revogar na hora pode cancelar o download em alguns navegadores.
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
  }

  private fileName(year: number): string {
    return `mindlog-${year}.png`;
  }

  /** A nota no formato do idioma, sempre com uma casa (4,0 e não 4). */
  private decimal(value: number): string {
    const locale = this.i18n.current === 'pt' ? 'pt-BR' : 'en-US';
    return value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  private monthName(month: number): string {
    const locale = this.i18n.current === 'pt' ? 'pt-BR' : 'en-US';
    const name = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, month - 1, 15));
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
