export type ImportSource = 'LETTERBOXD' | 'GOODREADS' | 'MYANIMELIST';

export interface ImportIssue {
  file: string;
  row: number;
  /** Código estável da API (`title.missing`, `shelf.unknown`...): a tela traduz por ele. */
  code: string;
  value?: string;
}

export interface ImportCount {
  name: string;
  count: number;
}

export interface ImportItem {
  title: string;
  mediaType: string;
  status: string;
  rating?: number;
  /** `NEW` será criada; `DUPLICATE` será pulada. */
  state: 'NEW' | 'DUPLICATE';
}

export interface ImportPreview {
  toImport: number;
  duplicates: number;
  invalid: number;
  byMediaType: ImportCount[];
  byStatus: ImportCount[];
  items: ImportItem[];
  issues: ImportIssue[];
  issuesTotal: number;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  invalid: number;
  issues: ImportIssue[];
  issuesTotal: number;
}
