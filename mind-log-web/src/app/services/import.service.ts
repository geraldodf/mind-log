import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ImportPreview, ImportResult, ImportSource} from '../models/import/import.interface';

@Injectable({providedIn: 'root'})
export class ImportService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/import`;

  /** Lê o arquivo no servidor e devolve o que seria feito; não grava nada. */
  preview(source: ImportSource, file: File) {
    return this.http.post<ImportPreview>(`${this.BASE}/preview`, this.body(source, file));
  }

  execute(source: ImportSource, file: File) {
    return this.http.post<ImportResult>(this.BASE, this.body(source, file));
  }

  private body(source: ImportSource, file: File): FormData {
    const body = new FormData();
    body.append('source', source);
    body.append('file', file, file.name);
    return body;
  }
}
