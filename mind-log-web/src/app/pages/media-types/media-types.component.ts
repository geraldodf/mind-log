import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MediaTypeService } from '../../services/media-type.service';
import { MediaType } from '../../models/media/media-type.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';

@Component({
  selector: 'app-media-types',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, SystemNamePipe],
  templateUrl: './media-types.component.html',
})
export class MediaTypesComponent implements OnInit {
  private readonly service = inject(MediaTypeService);
  private readonly toastr = inject(ToastrService);

  all: MediaType[] = [];
  loading = false;
  newName = '';
  creating = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (items) => { this.all = items; this.loading = false; },
      error: () => { this.toastr.error('Failed to load.'); this.loading = false; }
    });
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.creating = true;
    this.service.create(this.newName.trim()).subscribe({
      next: (created) => {
        this.all = [...this.all, created];
        this.newName = '';
        this.creating = false;
        this.toastr.success('Media type created!');
      },
      error: () => { this.toastr.error('Failed to create.'); this.creating = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this media type?')) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.all = this.all.filter(t => t.id !== id);
        this.toastr.success('Deleted.');
      },
      error: () => this.toastr.error('Failed to delete.')
    });
  }
}
