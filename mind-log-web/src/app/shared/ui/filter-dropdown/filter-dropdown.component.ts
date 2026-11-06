import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.scss',
  host: {'class': 'filter-dropdown-host'},
})
export class FilterDropdownComponent {
  private static nextId = 0;

  @Input() activeCount = 0;
  @Output() applied = new EventEmitter<void>();
  @Output() cleared = new EventEmitter<void>();

  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;

  readonly panelId = `filter-panel-${FilterDropdownComponent.nextId++}`;

  isOpen = false;

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  // Esc fecha e devolve o foco ao gatilho — sem isso o foco fica preso num
  // painel que já saiu do DOM e o teclado volta para o início da página.
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isOpen) return;
    this.close();
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  onApply(): void {
    this.applied.emit();
    this.close();
  }

  onClear(): void {
    this.cleared.emit();
    this.close();
  }

  private close(): void {
    this.isOpen = false;
    this.trigger?.nativeElement.focus();
  }
}
