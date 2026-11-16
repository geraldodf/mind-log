export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  /** Código estável da API (traduzido no cliente); ausente em erro genérico. */
  code?: string;
  /** Campo do formulário a que o erro se refere, quando é de um campo. */
  field?: string;
}
