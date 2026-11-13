import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConfirmationDialogService} from './confirmation-dialog.service';
import {I18nService} from './i18n.service';

/**
 * Pergunta única de "sair sem salvar?". Usada pela guarda de rota
 * (`CanDeactivateGuard`) e pelo `canClose` de diálogos com formulário,
 * para o texto e o botão serem os mesmos em todo lugar.
 */
@Injectable({providedIn: 'root'})
export class UnsavedChangesService {
  private readonly confirmation = inject(ConfirmationDialogService);
  private readonly i18n = inject(I18nService);

  confirmDiscard(): Observable<boolean> {
    return this.confirmation.confirm(undefined, {
      title: this.i18n.t('unsaved.title'),
      description: this.i18n.t('unsaved.description'),
      confirmLabel: this.i18n.t('unsaved.discard'),
    });
  }
}
