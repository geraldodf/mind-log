import {inject, Injectable} from '@angular/core';
import {first, Observable} from "rxjs";
import {ConfirmationDialogComponent} from "../shared/ui/confirmation-dialog/confirmation-dialog.component";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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

  private modalService = inject(NgbModal);

  /** `target`: o que será afetado (título da entrada, nome do tipo…), mostrado no diálogo. */
  confirm(target?: string, options: ConfirmationOptions = {}): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: 'md', backdrop: 'static', centered: true });
    modalRef.componentInstance.target = target ?? '';
    modalRef.componentInstance.options = options;

    return new Observable<boolean>((observer) => {
      modalRef.result.then(
        (result) => observer.next(result),
        () => observer.next(false)
      ).finally(() => observer.complete());
    }).pipe(first());
  }

}
