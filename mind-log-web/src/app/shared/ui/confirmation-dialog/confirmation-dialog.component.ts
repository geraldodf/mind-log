import {Component, inject, Input, ViewChild} from '@angular/core';
import {TranslatePipe} from '../../../pipes/translate.pipe';
import {BtnComponent} from '../btn/btn.component';
import {IconComponent} from '../icon/icon.component';
import {ModalComponent} from '../modal/modal.component';
import {ModalRef} from '../modal/modal.service';

/** Aberto pelo `ConfirmationDialogService`; devolve `true` só no botão de confirmar. */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [TranslatePipe, BtnComponent, IconComponent, ModalComponent],
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  readonly modalRef = inject(ModalRef<boolean>);

  @ViewChild(ModalComponent) private modal?: ModalComponent;

  /** O que será afetado (ex.: o título da entrada). Vazio mantém o texto genérico. */
  @Input() target = '';

  /** Textos já traduzidos; o que faltar cai no texto genérico. */
  @Input() options: { title?: string; description?: string; confirmLabel?: string } = {};

  confirmed = false;

  onConfirm(): void {
    this.confirmed = true;
    this.modal?.close();
  }

  onCancel(): void {
    this.modal?.close();
  }
}
