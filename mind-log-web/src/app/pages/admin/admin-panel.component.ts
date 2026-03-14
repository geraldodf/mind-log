import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminMetrics, SystemEvent } from '../../services/admin.service';
import { SuggestionService, SuggestionDTO } from '../../services/suggestion.service';
import { AvatarPlaceholderComponent } from '../../components/avatar-placeholder/avatar-placeholder.component';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '../../pipes/translate.pipe';

type AdminTab = 'overview' | 'suggestions';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarPlaceholderComponent, TranslatePipe],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  private readonly service = inject(AdminService);
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
      error: () => { this.toastr.error('Failed to load metrics.'); this.loading = false; }
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
        this.toastr.success('Status updated.');
      },
      error: () => this.toastr.error('Failed to update status.')
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

  getEventBadge(eventType: string): string {
    if (eventType === 'ACCOUNT_CREATED') return 'badge-success';
    if (eventType === 'ACCOUNT_DELETED') return 'badge-danger';
    return 'badge-secondary';
  }

  getSuggestionStatusBadge(status: string): string {
    switch (status) {
      case 'IMPLEMENTED': return 'badge-success';
      case 'REVIEWED': return 'badge-indigo';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-warning';
    }
  }

  statusOptions = ['PENDING', 'REVIEWED', 'IMPLEMENTED', 'REJECTED'];
}
