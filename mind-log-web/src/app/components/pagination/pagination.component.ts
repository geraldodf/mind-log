import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  maxShowPages = 10;
  @Input() pageNumber: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

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

}
