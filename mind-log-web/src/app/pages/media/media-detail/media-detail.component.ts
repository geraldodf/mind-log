import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../../services/user-media.service';
import { UserMedia } from '../../../models/media/user-media.interface';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SystemNamePipe],
  templateUrl: './media-detail.component.html',
})
export class MediaDetailComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  media?: UserMedia;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userMediaService.getById(+id).subscribe({
        next: (m) => { this.media = m; this.loading = false; },
        error: () => {
          this.toastr.error('Entry not found.');
          this.router.navigate(['/media']);
        }
      });
    }
  }

  delete(): void {
    if (!this.media || !confirm('Delete this entry?')) return;
    this.userMediaService.delete(this.media.id).subscribe({
      next: () => {
        this.toastr.success('Entry deleted.');
        this.router.navigate(['/media']);
      },
      error: () => this.toastr.error('Failed to delete.')
    });
  }

  getRatingStars(rating: number | null): string {
    if (!rating) return '';
    return '⭐'.repeat(rating);
  }

  getRecommendationConfig(r: string | null): { labelKey: string; css: string; icon: string } {
    switch (r) {
      case 'RECOMMEND': return { labelKey: 'media.recommend', css: 'badge-success', icon: 'fa-thumbs-up' };
      case 'NOT_RECOMMEND': return { labelKey: 'media.notRecommend', css: 'badge-danger', icon: 'fa-thumbs-down' };
      default: return { labelKey: 'media.neutral', css: 'badge-secondary', icon: 'fa-minus' };
    }
  }
}
