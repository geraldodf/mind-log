import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from "rxjs";
import {ErrorResponse} from "../models/util/error-response.interface";
import {I18nService} from '../services/i18n.service';

/**
 * Toda falha HTTP sai daqui como `ErrorResponse`, sempre com `status`: as
 * telas usam o status para separar "não existe" (404/403) de "falhou" (rede,
 * 5xx). O texto mostrado é sempre traduzido aqui: pelo `code` da API quando
 * ela manda um (`apiError.<code>`), senão por status. O texto cru da API tem
 * um idioma só e aparecia no meio da tela no outro idioma.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const i18n = inject(I18nService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error && typeof error.error === 'object' ? error.error : null;

      const status = body?.status || error.status;
      const typedError: ErrorResponse = {
        timestamp: body?.timestamp || '',
        status,
        error: messageFor(i18n, status, body?.code),
        path: body?.path || req.url,
        code: body?.code ?? undefined,
        field: body?.field ?? undefined,
      };

      return throwError(() => typedError);
    })
  );
};

function messageFor(i18n: I18nService, status: number, code?: string): string {
  if (code && i18n.has('apiError.' + code)) return i18n.t('apiError.' + code);
  if (status === 0) return i18n.t('error.network');
  if (status >= 500) return i18n.t('error.server');
  if (status === 401) return i18n.t('error.unauthorized');
  if (status === 403) return i18n.t('error.forbidden');
  if (status === 404) return i18n.t('error.notFound');
  if (status === 400 || status === 422) return i18n.t('error.invalid');
  return i18n.t('error.unknown');
}
