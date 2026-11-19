import {Component, inject} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {ImportService} from '../../services/import.service';
import {I18nService} from '../../services/i18n.service';
import {ImportIssue, ImportPreview, ImportResult, ImportSource} from '../../models/import/import.interface';
import {ErrorResponse} from '../../models/util/error-response.interface';
import {TranslatePipe} from '../../pipes/translate.pipe';
import {SystemNamePipe} from '../../pipes/system-name.pipe';
import {
  AlertComponent,
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  FieldGroupComponent,
  FileInputComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  SegmentedControlComponent,
  SegmentedOption,
  StatCardComponent,
  StatusChipComponent,
} from '../../shared/ui';

type Step = 'upload' | 'preview' | 'done';

/** Mesmo teto do servidor (`spring.servlet.multipart.max-file-size`); o servidor é quem manda. */
const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<ImportSource, string[]> = {
  LETTERBOXD: ['.zip'],
  GOODREADS: ['.csv'],
  MYANIMELIST: ['.xml', '.gz'],
};

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [
    NgTemplateOutlet, RouterLink, TranslatePipe, SystemNamePipe,
    AlertComponent, BadgeComponent, BtnComponent, CardComponent, EmptyStateComponent, FieldGroupComponent,
    FileInputComponent, PageHeaderComponent, RatingStarsComponent, SegmentedControlComponent, StatCardComponent,
    StatusChipComponent,
  ],
  templateUrl: './import.component.html',
})
export class ImportComponent {
  private readonly service = inject(ImportService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);

  /** Nomes próprios das plataformas: não se traduzem. */
  readonly sources: SegmentedOption[] = [
    {value: 'LETTERBOXD', label: 'Letterboxd'},
    {value: 'GOODREADS', label: 'Goodreads'},
    {value: 'MYANIMELIST', label: 'MyAnimeList'},
  ];

  step: Step = 'upload';
  source: ImportSource = 'LETTERBOXD';
  file: File | null = null;
  fileError = '';
  working = false;
  preview?: ImportPreview;
  result?: ImportResult;

  get accept(): string {
    return EXTENSIONS[this.source].join(',');
  }

  get totalEntries(): number {
    return this.preview ? this.preview.toImport + this.preview.duplicates : 0;
  }

  get doneDescription(): string {
    if (!this.result) return '';
    return this.i18n.t('import.done.summary')
      .replace('{imported}', String(this.result.imported))
      .replace('{duplicates}', String(this.result.duplicates))
      .replace('{invalid}', String(this.result.invalid));
  }

  selectSource(source: ImportSource): void {
    this.source = source;
    this.file = null;
    this.fileError = '';
  }

  pickFile(file: File | null): void {
    this.fileError = '';
    this.file = null;
    if (!file) return;
    if (!this.hasValidExtension(file)) {
      this.fileError = this.i18n.t('import.error.extension').replace('{types}', this.accept);
      return;
    }
    if (file.size > MAX_BYTES) {
      this.fileError = this.i18n.t('apiError.file.tooLarge');
      return;
    }
    this.file = file;
  }

  runPreview(): void {
    if (!this.file || this.working) return;
    this.working = true;
    this.service.preview(this.source, this.file).subscribe({
      next: preview => {
        this.preview = preview;
        this.step = 'preview';
        this.working = false;
      },
      error: err => this.fail(err),
    });
  }

  runImport(): void {
    if (!this.file || this.working || !this.preview?.toImport) return;
    this.working = true;
    this.service.execute(this.source, this.file).subscribe({
      next: result => {
        this.result = result;
        this.step = 'done';
        this.working = false;
      },
      error: err => this.fail(err),
    });
  }

  backToUpload(): void {
    this.step = 'upload';
    this.preview = undefined;
  }

  startOver(): void {
    this.backToUpload();
    this.result = undefined;
    this.file = null;
    this.fileError = '';
  }

  /** Linha do problema, no idioma da tela: "arquivo · linha N: motivo (valor)". */
  issueText(issue: ImportIssue): string {
    const row = this.i18n.t('import.row').replace('{n}', String(issue.row));
    const reason = this.i18n.t('import.issue.' + issue.code);
    return `${issue.file} · ${row}: ${reason}${issue.value ? ` (${issue.value})` : ''}`;
  }

  private hasValidExtension(file: File): boolean {
    const name = file.name.toLowerCase();
    return EXTENSIONS[this.source].some(ext => name.endsWith(ext));
  }

  /** Erro do arquivo (tamanho, formato) volta para o campo de upload; o resto vira aviso. */
  private fail(err: ErrorResponse): void {
    this.working = false;
    if (err?.field === 'file') {
      this.fileError = err.error;
      this.step = 'upload';
    } else {
      this.toastr.error(err?.error ?? this.i18n.t('error.unknown'));
    }
  }
}
