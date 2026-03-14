import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../services/user-media.service';
import { UserMedia } from '../../models/media/user-media.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';

@Component({
  selector: 'app-top10',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SystemNamePipe],
  templateUrl: './top10.component.html',
})
export class Top10Component implements OnInit {
  private readonly service = inject(UserMediaService);
  private readonly toastr = inject(ToastrService);

  items: UserMedia[] = [];
  loading = true;

  ngOnInit(): void {
    this.service.getFavorites().subscribe({
      next: (data) => { this.items = data.slice(0, 10); this.loading = false; },
      error: () => { this.toastr.error('Failed to load Top 10.'); this.loading = false; }
    });
  }

  getRatingStars(rating: number | null): string {
    if (!rating) return '';
    return '⭐'.repeat(rating);
  }
}
