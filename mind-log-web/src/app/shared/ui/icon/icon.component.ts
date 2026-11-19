import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

/**
 * Mapa fechado de ícones do app. É o único lugar que conhece o Font Awesome:
 * tela nenhuma escreve `<i class="fa-...">`. Ícone novo entra aqui primeiro.
 * Quando o glifo existe nos dois estilos, `-outline` é a versão regular.
 * Só use `fa-regular` em glifo que existe no conjunto livre (ver CLAUDE.md).
 */
export const ICONS = {
  'angles-left': 'fa-solid fa-angles-left',
  'angles-right': 'fa-solid fa-angles-right',
  'arrow-down': 'fa-solid fa-arrow-down',
  'arrow-left': 'fa-solid fa-arrow-left',
  'arrow-right': 'fa-solid fa-arrow-right',
  'arrow-right-from-bracket': 'fa-solid fa-arrow-right-from-bracket',
  'arrow-up': 'fa-solid fa-arrow-up',
  'at': 'fa-solid fa-at',
  'bell': 'fa-solid fa-bell',
  'bell-slash': 'fa-solid fa-bell-slash',
  'brain': 'fa-solid fa-brain',
  'calendar': 'fa-regular fa-calendar',
  'calendar-check': 'fa-regular fa-calendar-check',
  'calendar-days': 'fa-solid fa-calendar-days',
  'champagne-glasses': 'fa-solid fa-champagne-glasses',
  'chart-line': 'fa-solid fa-chart-line',
  'chart-simple': 'fa-solid fa-chart-simple',
  'check': 'fa-solid fa-check',
  'check-double': 'fa-solid fa-check-double',
  'chevron-down': 'fa-solid fa-chevron-down',
  'chevron-left': 'fa-solid fa-chevron-left',
  'chevron-right': 'fa-solid fa-chevron-right',
  'chevron-up': 'fa-solid fa-chevron-up',
  'circle': 'fa-regular fa-circle',
  'circle-check': 'fa-solid fa-circle-check',
  'circle-exclamation': 'fa-solid fa-circle-exclamation',
  'circle-plus': 'fa-solid fa-circle-plus',
  'clock': 'fa-regular fa-clock',
  'comment-dots': 'fa-regular fa-comment-dots',
  'compass': 'fa-solid fa-compass',
  'ellipsis': 'fa-solid fa-ellipsis',
  'envelope': 'fa-regular fa-envelope',
  'download': 'fa-solid fa-download',
  'eye': 'fa-solid fa-eye',
  'eye-outline': 'fa-regular fa-eye',
  'eye-slash': 'fa-regular fa-eye-slash',
  'face-smile': 'fa-solid fa-face-smile',
  'file-import': 'fa-solid fa-file-import',
  'file-lines': 'fa-solid fa-file-lines',
  'filter-circle-xmark': 'fa-solid fa-filter-circle-xmark',
  'forward-step': 'fa-solid fa-forward-step',
  'globe': 'fa-solid fa-globe',
  'grip-vertical': 'fa-solid fa-grip-vertical',
  'hand': 'fa-solid fa-hand',
  'house': 'fa-solid fa-house',
  'id-card': 'fa-regular fa-id-card',
  'inbox': 'fa-solid fa-inbox',
  'key': 'fa-solid fa-key',
  'language': 'fa-solid fa-language',
  'layer-group': 'fa-solid fa-layer-group',
  'list': 'fa-solid fa-list',
  'list-check': 'fa-solid fa-list-check',
  'list-ol': 'fa-solid fa-list-ol',
  'lock': 'fa-solid fa-lock',
  'magnifying-glass': 'fa-solid fa-magnifying-glass',
  'medal': 'fa-solid fa-medal',
  'moon': 'fa-solid fa-moon',
  'minus': 'fa-solid fa-minus',
  'paper-plane': 'fa-solid fa-paper-plane',
  'pause': 'fa-solid fa-pause',
  'pen': 'fa-solid fa-pen',
  'pen-nib': 'fa-solid fa-pen-nib',
  'play': 'fa-solid fa-play',
  'plug-circle-xmark': 'fa-solid fa-plug-circle-xmark',
  'plus': 'fa-solid fa-plus',
  'rocket': 'fa-solid fa-rocket',
  'rotate-left': 'fa-solid fa-rotate-left',
  'rotate-right': 'fa-solid fa-rotate-right',
  'share-nodes': 'fa-solid fa-share-nodes',
  'sliders': 'fa-solid fa-sliders',
  'spinner': 'fa-solid fa-spinner',
  'star': 'fa-solid fa-star',
  'sun': 'fa-solid fa-sun',
  'star-outline': 'fa-regular fa-star',
  'tags': 'fa-solid fa-tags',
  'thumbs-down': 'fa-solid fa-thumbs-down',
  'thumbs-up': 'fa-solid fa-thumbs-up',
  'trash': 'fa-solid fa-trash',
  'triangle-exclamation': 'fa-solid fa-triangle-exclamation',
  'upload': 'fa-solid fa-upload',
  'user': 'fa-regular fa-user',
  'user-check': 'fa-solid fa-user-check',
  'user-gear': 'fa-solid fa-user-gear',
  'user-minus': 'fa-solid fa-user-minus',
  'user-plus': 'fa-solid fa-user-plus',
  'user-slash': 'fa-solid fa-user-slash',
  'users': 'fa-solid fa-users',
  'xmark': 'fa-solid fa-xmark',
} as const;

export type IconName = keyof typeof ICONS;

export type IconSize = '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

const SIZE_CLASSES: Record<IconSize, string> = {
  '2xs': 'text-2xs',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

/**
 * Ícone decorativo: sempre `aria-hidden`; o nome da ação vem do texto ou do
 * `ariaLabel` do controle. Herda cor do texto ao redor; sem `size`, herda
 * também o tamanho.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }'],
  template: `<i [class]="classes" aria-hidden="true"></i>`,
})
export class IconComponent {
  @Input({required: true}) name!: IconName;
  @Input() size?: IconSize;
  /** Gira (indicador de envio em andamento). */
  @Input() spin = false;

  get classes(): string {
    const parts: string[] = [ICONS[this.name] ?? ''];
    if (this.size) parts.push(SIZE_CLASSES[this.size]);
    if (this.spin) parts.push('fa-spin');
    return parts.join(' ');
  }
}
