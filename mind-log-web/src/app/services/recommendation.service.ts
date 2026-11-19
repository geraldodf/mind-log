import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Recommendations } from '../models/media/recommendation.interface';
import { UserMedia } from '../models/media/user-media.interface';
import { Lang } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/recommendations`;

  get() {
    return this.http.get<Recommendations>(this.BASE);
  }

  /** Chama o modelo (ou devolve o cache); `lang` é o idioma do motivo de cada sugestão. */
  generate(lang: Lang) {
    return this.http.post<Recommendations>(`${this.BASE}/generate`, null, { params: new HttpParams().set('lang', lang) });
  }

  dismiss(id: number) {
    return this.http.post<void>(`${this.BASE}/${id}/dismiss`, null);
  }

  /** Cria a entrada em Planned (só título e tipo) e devolve a entrada criada. */
  add(id: number) {
    return this.http.post<UserMedia>(`${this.BASE}/${id}/add`, null);
  }
}
