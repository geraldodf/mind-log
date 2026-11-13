import {inject, Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {ConfirmationDialogComponent} from "../shared/ui/confirmation-dialog/confirmation-dialog.component";
import {ModalService} from '../shared/ui/modal/modal.service';

/** Textos opcionais do diálogo; sem eles vale o texto genérico de exclusão. */
export interface ConfirmationOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  private modalService = inject(ModalService);

  /** `target`: o que será afetado (título da entrada, nome do tipo…), mostrado no diálogo. */
  confirm(target?: string, options: ConfirmationOptions = {}): Observable<boolean> {
    const modalRef = this.modalService.open<ConfirmationDialogComponent, boolean>(
      ConfirmationDialogComponent, { target: target ?? '', options });
    return modalRef.closed.pipe(map(result => result === true));
  }

}
