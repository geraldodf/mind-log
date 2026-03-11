import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-avatar-placeholder',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      class="rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none"
      style="background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2);"
      [ngClass]="sizeClass"
    >
      {{ initial }}
    </div>
  `,
  styleUrl: './avatar-placeholder.component.scss'
})
export class AvatarPlaceholderComponent {

  @Input() name: string = '';
  @Input() size: 'avatar-sm' | 'avatar-md' | 'avatar-lg' = 'avatar-sm';

  get initial(): string {
    return this.name.charAt(0).toUpperCase();
  }

  get sizeClass(): string {
    const map: Record<string, string> = {
      'avatar-sm': 'w-8 h-8 text-xs',
      'avatar-md': 'w-10 h-10 text-sm',
      'avatar-lg': 'w-14 h-14 text-lg',
    };
    return map[this.size] ?? 'w-8 h-8 text-xs';
  }

}
