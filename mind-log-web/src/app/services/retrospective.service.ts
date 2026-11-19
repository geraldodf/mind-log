import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Retrospective } from '../models/retrospective/retrospective.interface';

@Injectable({ providedIn: 'root' })
export class RetrospectiveService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/retrospective`;

  /** Anos em que o usuário concluiu algo, do mais novo para o mais antigo. */
  getYears() {
    return this.http.get<number[]>(`${this.BASE}/years`);
  }

  get(year: number) {
    return this.http.get<Retrospective>(`${this.BASE}/${year}`);
  }
}
