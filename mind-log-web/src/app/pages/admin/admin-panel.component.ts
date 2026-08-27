import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminMetrics, SystemEvent } from '../../services/admin.service';
import { SuggestionService, SuggestionDTO } from '../../services/suggestion.service';
import { AvatarPlaceholderComponent } from '../../shared/ui/avatar/avatar.component';
import {
  BadgeComponent,
  CardComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  SkeletonComponent,
  Tone,
} from '../../shared/ui';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

type AdminTab = 'overview' | 'suggestions';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AvatarPlaceholderComponent, TranslatePipe,
    CardComponent, BadgeComponent, PageHeaderComponent, EmptyStateComponent, SkeletonComponent,
  ],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly i18n = inject(I18nService);
  private readonly suggestionService = inject(SuggestionService);
  private readonly toastr = inject(ToastrService);

  activeTab: AdminTab = 'overview';

  metrics?: AdminMetrics;
  loading = true;

  systemEvents: SystemEvent[] = [];
  loadingEvents = true;
  eventsPage = 0;
  eventsTotalPages = 0;

  suggestions: SuggestionDTO[] = [];
  loadingSuggestions = false;
  suggestionPage = 0;
  suggestionTotalPages = 0;

  ngOnInit(): void {
    this.service.getMetrics().subscribe({
      next: (m) => { this.metrics = m; this.loading = false; },
      error: () => { this.toastr.error(this.i18n.t('toast.loadFailed')); this.loading = false; }
    });
    this.loadSystemEvents();
  }

  selectTab(tab: AdminTab): void {
    this.activeTab = tab;
    if (tab === 'suggestions' && this.suggestions.length === 0) {
      this.loadSuggestions();
    }
  }

  loadSystemEvents(): void {
    this.loadingEvents = true;
    this.service.getSystemEvents(this.eventsPage).subscribe({
      next: (page) => {
        this.systemEvents = page.content;
        this.eventsTotalPages = page.totalPages;
        this.loadingEvents = false;
      },
      error: () => this.loadingEvents = false
    });
  }

  loadSuggestions(): void {
    this.loadingSuggestions = true;
    this.suggestionService.getAll(this.suggestionPage).subscribe({
      next: (page) => {
        this.suggestions = page.content;
        this.suggestionTotalPages = page.totalPages;
        this.loadingSuggestions = false;
      },
      error: () => this.loadingSuggestions = false
    });
  }

  updateSuggestionStatus(id: number, status: string): void {
    this.suggestionService.updateStatus(id, status).subscribe({
      next: (updated) => {
        const idx = this.suggestions.findIndex(s => s.id === id);
        if (idx >= 0) this.suggestions[idx] = updated;
        this.toastr.success(this.i18n.t('toast.statusUpdated'));
      },
      error: () => this.toastr.error(this.i18n.t('toast.updateFailed'))
    });
  }

  goToEventsPage(p: number): void {
    if (p >= 0 && p < this.eventsTotalPages) { this.eventsPage = p; this.loadSystemEvents(); }
  }
  eventsPages(): number[] { return Array.from({ length: this.eventsTotalPages }, (_, i) => i); }

  goToSuggestionPage(p: number): void {
    if (p >= 0 && p < this.suggestionTotalPages) { this.suggestionPage = p; this.loadSuggestions(); }
  }
  suggestionPages(): number[] { return Array.from({ length: this.suggestionTotalPages }, (_, i) => i); }

  eventTone(eventType: string): Tone {
    if (eventType === 'ACCOUNT_CREATED') return 'success';
    if (eventType === 'ACCOUNT_DELETED') return 'danger';
    return 'neutral';
  }

  suggestionStatusTone(status: string): Tone {
    switch (status) {
      case 'IMPLEMENTED': return 'success';
      case 'REVIEWED': return 'primary';
      case 'REJECTED': return 'danger';
      default: return 'warning';
    }
  }

  statusOptions = ['PENDING', 'REVIEWED', 'IMPLEMENTED', 'REJECTED'];
}
