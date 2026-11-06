import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  @Input() pageNumber: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

  private readonly cdr = inject(ChangeDetectorRef);

  // 10 botões de 32px + setas + elipses estouram 375px de largura. A janela de
  // páginas é medida pela viewport, não fixa.
  private viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;

  @HostListener('window:resize')
  onResize(): void {
    const next = window.innerWidth;
    if (this.windowFor(next) === this.windowFor(this.viewportWidth)) return;
    this.viewportWidth = next;
    this.cdr.markForCheck();
  }

  get maxShowPages(): number {
    return this.windowFor(this.viewportWidth);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxShowPages = this.maxShowPages;
    const halfRange = Math.floor(maxShowPages / 2);

    if (this.totalPages <= maxShowPages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    let startPage = Math.max(this.pageNumber - halfRange, 1);
    let endPage = Math.min(startPage + maxShowPages - 1, this.totalPages);

    if (endPage - startPage < maxShowPages - 1) {
      startPage = Math.max(endPage - maxShowPages + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      pages.unshift(1);
      if (startPage > 2) {
        pages.splice(1, 0, -1); // -1 será usado como elipses
      }
    }

    if (endPage < this.totalPages) {
      pages.push(this.totalPages);
      if (endPage < this.totalPages - 1) {
        pages.splice(pages.length - 1, 0, -1); // -1 será usado como elipses
      }
    }

    return pages;
  }

  fetchToPage(page: number): void {
    if (page > 0 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageChanged.emit(page);
    }
  }

  private windowFor(width: number): number {
    if (width < 400) return 3;
    if (width < 640) return 5;
    return 10;
  }

}
