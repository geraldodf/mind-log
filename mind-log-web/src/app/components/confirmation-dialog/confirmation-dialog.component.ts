import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {

  activeModal = inject(NgbActiveModal);

  onConfirm() {
    this.activeModal.close(true);
  }

  onCancel() {
    this.activeModal.dismiss(false);
  }

}
