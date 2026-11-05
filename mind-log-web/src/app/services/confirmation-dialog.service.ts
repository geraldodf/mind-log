import {inject, Injectable} from '@angular/core';
import {first, Observable} from "rxjs";
import {ConfirmationDialogComponent} from "../shared/ui/confirmation-dialog/confirmation-dialog.component";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  private modalService = inject(NgbModal);

  /** `target`: o que será afetado (título da entrada, nome do tipo…), mostrado no diálogo. */
  confirm(target?: string): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: 'md', backdrop: 'static', centered: true });
    modalRef.componentInstance.target = target ?? '';

    return new Observable<boolean>((observer) => {
      modalRef.result.then(
        (result) => observer.next(result),
        () => observer.next(false)
      ).finally(() => observer.complete());
    }).pipe(first());
  }

}
