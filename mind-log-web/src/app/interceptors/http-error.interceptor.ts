import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from "rxjs";
import {ErrorResponse} from "../models/util/error-response.interface";
import {I18nService} from '../services/i18n.service';

/**
 * Toda falha HTTP sai daqui como `ErrorResponse`, sempre com `status`: as
 * telas usam o status para separar "não existe" (404/403) de "falhou" (rede,
 * 5xx). A mensagem da API vale para erro de regra (4xx); rede e servidor
 * ganham um texto traduzido, porque o detalhe técnico não ajuda quem usa.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const i18n = inject(I18nService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error && typeof error.error === 'object' ? error.error : null;

      const typedError: ErrorResponse = {
        timestamp: body?.timestamp || '',
        status: body?.status || error.status,
        error: body?.error || i18n.t('error.unknown'),
        path: body?.path || req.url
      };

      if (error.status >= 500 && error.status < 600) typedError.error = i18n.t('error.server');
      if (error.status === 0) typedError.error = i18n.t('error.network');

      return throwError(() => typedError);
    })
  );
};
