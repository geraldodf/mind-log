import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '../../../pipes/translate.pipe';
import {BtnComponent} from '../btn/btn.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [TranslatePipe, BtnComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {

  activeModal = inject(NgbActiveModal);

  /** O que será afetado (ex.: o título da entrada). Vazio mantém o texto genérico. */
  target = '';

  onConfirm() {
    this.activeModal.close(true);
  }

  onCancel() {
    this.activeModal.dismiss(false);
  }

}
