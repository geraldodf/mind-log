import { MediaType } from './media-type.interface';

export interface Recommendation {
  id: number;
  title: string;
  mediaType: MediaType;
  reason: string;
  /** Títulos da biblioteca do usuário que levaram à sugestão. */
  basedOn: string[];
}

export interface Recommendations {
  /** Há provedor de IA configurado; falso esconde a seção inteira. */
  enabled: boolean;
  /** O usuário já tem entradas bem avaliadas suficientes para gerar. */
  eligible: boolean;
  /** Gerações que ainda cabem nas últimas 24 h. */
  remaining: number;
  /** Quando uma geração volta a caber (só com `remaining` 0). */
  nextAvailableAt: string | null;
  items: Recommendation[];
}
