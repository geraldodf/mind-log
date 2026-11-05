import {Component, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.scss',
  host: {'class': 'filter-dropdown-host'},
})
export class FilterDropdownComponent {
  @Input() activeCount = 0;
  @Output() applied = new EventEmitter<void>();
  @Output() cleared = new EventEmitter<void>();

  isOpen = false;

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  onApply(): void {
    this.applied.emit();
    this.isOpen = false;
  }

  onClear(): void {
    this.cleared.emit();
    this.isOpen = false;
  }
}
