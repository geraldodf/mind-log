import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {IconComponent} from '../icon/icon.component';
import {IconBtnComponent} from '../icon-btn/icon-btn.component';
import {TranslatePipe} from '../../../pipes/translate.pipe';

/**
 * Escolha de um arquivo, por clique ou arrastando. O `<input type="file">` nativo cobre a área inteira
 * (transparente): o teclado, o leitor de tela e o soltar arquivo funcionam sem código, e o anel de
 * foco aparece na área visível pelo `peer`. O arquivo escolhido é do consumidor (`file`/`fileChange`);
 * o tamanho e o tipo aceito são validados por quem usa, que devolve `invalid`/`errorMessage`.
 */
@Component({
  selector: 'app-file-input',
  // O id vai para o controle interno; no host ele duplicaria o id e o <label for> apontaria para o host.
  host: {'[attr.id]': 'null'},
  standalone: true,
  imports: [IconComponent, IconBtnComponent, NgIf, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      <label *ngIf="label" [for]="id" class="ios-label">
        {{ label }}<span *ngIf="required" class="text-danger-700 dark:text-danger-400" aria-hidden="true">&nbsp;*</span>
      </label>
      <div class="relative">
        <input
          #picker
          type="file"
          [id]="id"
          [accept]="accept"
          [disabled]="disabled"
          [attr.required]="required || null"
          [attr.aria-invalid]="invalid"
          [attr.aria-describedby]="describedBy"
          class="peer absolute inset-0 z-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          (change)="onPick(picker)"
          (dragenter)="dragging = true"
          (dragover)="dragging = true"
          (dragleave)="dragging = false"
          (drop)="dragging = false"
        />
        <div
          class="flex items-center gap-3 min-h-control-lg px-4 py-4 rounded-card border-2 border-dashed transition-[background-color,border-color] duration-base ease-inout peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-40"
          [class]="zoneClasses"
        >
          <app-icon [name]="file ? 'file-lines' : 'upload'" size="xl" class="text-primary-700 dark:text-primary-300"></app-icon>
          <div class="min-w-0 flex-1">
            <ng-container *ngIf="file; else emptyTpl">
              <p class="text-sm font-semibold text-ink truncate">{{ file.name }}</p>
              <p class="text-xs text-ink-muted tabular-nums">{{ size(file.size) }} · {{ 'fileInput.replace' | translate }}</p>
            </ng-container>
            <ng-template #emptyTpl>
              <p class="text-sm text-ink-muted">{{ 'fileInput.drop' | translate }}</p>
            </ng-template>
          </div>
          <app-icon-btn
            *ngIf="file && !disabled"
            class="relative z-10"
            icon="xmark"
            [ariaLabel]="'fileInput.remove' | translate"
            (click)="clear(picker)"
          ></app-icon-btn>
        </div>
      </div>
      <p *ngIf="hint && !invalid" [id]="id + '-hint'" class="ios-hint">{{ hint }}</p>
      <p *ngIf="invalid && errorMessage" [id]="id + '-error'" class="error-message" role="alert">
        <app-icon name="circle-exclamation"></app-icon>{{ errorMessage }}
      </p>
    </div>
  `,
})
export class FileInputComponent {
  private static nextId = 0;

  @Input() label = '';
  /** Tipos aceitos pelo seletor do sistema (`.csv`, `.zip,.xml`...). Não substitui a validação de quem usa. */
  @Input() accept = '';
  @Input() file: File | null = null;
  @Input() hint?: string;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Input() disabled = false;
  // Gerado quando não vem de fora: sem id o `for` do <label> não aponta para nada.
  @Input() id = `app-file-input-${FileInputComponent.nextId++}`;

  @Output() fileChange = new EventEmitter<File | null>();

  dragging = false;

  /** Cor da borda e do fundo por estado; strings completas para o scanner do Tailwind enxergar. */
  get zoneClasses(): string {
    if (this.invalid) return 'border-danger-500 bg-surface-card';
    if (this.dragging) return 'border-primary-500 bg-primary-50 dark:bg-primary-500/10';
    return 'border-hairline bg-surface-card';
  }

  get describedBy(): string | null {
    if (this.invalid && this.errorMessage) return `${this.id}-error`;
    if (this.hint) return `${this.id}-hint`;
    return null;
  }

  onPick(picker: HTMLInputElement): void {
    const file = picker.files?.[0] ?? null;
    // Zera o controle nativo: escolher o mesmo arquivo de novo (depois de remover) tem de disparar `change`.
    picker.value = '';
    if (file) this.fileChange.emit(file);
  }

  clear(picker: HTMLInputElement): void {
    picker.value = '';
    this.fileChange.emit(null);
  }

  size(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
