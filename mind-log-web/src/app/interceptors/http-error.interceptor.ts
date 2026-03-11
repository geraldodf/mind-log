import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from "rxjs";
import {ErrorResponse} from "../models/util/error-response.interface";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let typedError: ErrorResponse;

      if (error.error && typeof error.error === 'object') {
        typedError = {
          timestamp: error.error.timestamp || '',
          status: error.error.status || error.status,
          error: error.error.error || 'Erro desconhecido',
          path: error.error.path || req.url
        };

        if (error.status >= 500 && error.status < 600) {
          typedError.error = 'Ocorreu um problema no servidor. Tente novamente mais tarde.'
        }

        if (error.status === 0) {
          typedError.error = 'Não foi possível se conectar ao servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.';
        }
      }

      return throwError(() => typedError);
    })
  );
};
