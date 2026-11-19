export interface RetrospectiveTypeCount {
  mediaTypeId: number;
  name: string;
  isSystem: boolean;
  count: number;
}

export interface RetrospectiveRatedMedia {
  id: number;
  title: string;
  mediaTypeName: string;
  mediaTypeIsSystem: boolean;
  rating: number;
  isFavorite: boolean;
}

export interface RetrospectiveFeeling {
  emoji: string;
  count: number;
}

/** Um ano de mídias concluídas de quem está logado. `lowData` = versão curta (1 ou 2 entradas). */
export interface Retrospective {
  year: number;
  totalCompleted: number;
  /** Concluídas sem data de fim nem de início: não cabem em ano nenhum. */
  undatedCompleted: number;
  lowData: boolean;
  byType: RetrospectiveTypeCount[];
  /** Doze posições, janeiro a dezembro. */
  byMonth: number[];
  /** 1 a 12; nulo quando nada foi concluído. */
  busiestMonth: number | null;
  topRated: RetrospectiveRatedMedia[];
  averageRating: number | null;
  ratedCount: number;
  topFeelings: RetrospectiveFeeling[];
  recommendedCount: number;
  /** Só na versão curta. */
  titles: string[];
}
