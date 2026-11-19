import { Pipe, PipeTransform } from '@angular/core';

/**
 * Preenche os `{campo}` de um texto traduzido: `{{ 'retro.title' | translate | format:{year} }}`.
 * Campo sem valor fica como está, para o erro aparecer na tela e não virar texto vazio.
 */
@Pipe({ name: 'format', standalone: true })
export class FormatPipe implements PipeTransform {
  transform(text: string, values: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (match, key: string) => key in values ? String(values[key]) : match);
  }
}
