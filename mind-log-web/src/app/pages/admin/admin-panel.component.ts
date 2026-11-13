import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminMetrics, SystemEvent } from '../../services/admin.service';
import { SuggestionService, SuggestionDTO } from '../../services/suggestion.service';
import { AvatarPlaceholderComponent } from '../../shared/ui/avatar/avatar.component';
import {
  BadgeComponent,
  CardComponent,
  CountUpDirective,
  EmptyStateComponent, LoadErrorComponent,
  FormSelectComponent,
  FormSelectOption,
  PageHeaderComponent,
  PaginationComponent,
  SegmentedControlComponent,
  SegmentedOption,
  SkeletonComponent,
  TableComponent,
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
    CardComponent, BadgeComponent, PageHeaderComponent, EmptyStateComponent, LoadErrorComponent, SkeletonComponent,
    TableComponent, PaginationComponent, SegmentedControlComponent, FormSelectComponent,
    CountUpDirective,
  ],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly i18n = inject(I18nService);
  private readonly suggestionService = inject(SuggestionService);
  private readonly toastr = inject(ToastrService);

  activeTab: AdminTab = 'overview';
  // Getter, não propriedade: o rótulo precisa ser relido quando o idioma muda.
  get tabOptions(): SegmentedOption[] {
    return [
      { value: 'overview', label: this.i18n.t('admin.tabs.overview') },
      { value: 'suggestions', label: this.i18n.t('admin.tabs.suggestions') },
    ];
  }

  metrics?: AdminMetrics;
  loading = true;

  systemEvents: SystemEvent[] = [];
  loadingEvents = true;
  eventsPage = 0;
  eventsTotalPages = 0;

  suggestions: SuggestionDTO[] = [];
  loadingSuggestions = false;
  metricsError = false;
  eventsError = false;
  suggestionsError = false;
  suggestionPage = 0;
  suggestionTotalPages = 0;

  ngOnInit(): void {
    this.loadMetrics();
    this.loadSystemEvents();
  }

  loadMetrics(): void {
    this.loading = true;
    this.metricsError = false;
    this.service.getMetrics().subscribe({
      next: (m) => { this.metrics = m; this.loading = false; },
      error: () => { this.metricsError = true; this.loading = false; }
    });
  }

  selectTab(tab: AdminTab): void {
    this.activeTab = tab;
    if (tab === 'suggestions' && this.suggestions.length === 0) {
      this.loadSuggestions();
    }
  }

  loadSystemEvents(): void {
    this.loadingEvents = true;
    this.eventsError = false;
    this.service.getSystemEvents(this.eventsPage).subscribe({
      next: (page) => {
        this.systemEvents = page.content;
        this.eventsTotalPages = page.totalPages;
        this.loadingEvents = false;
      },
      error: () => { this.eventsError = true; this.loadingEvents = false; }
    });
  }

  loadSuggestions(): void {
    this.loadingSuggestions = true;
    this.suggestionsError = false;
    this.suggestionService.getAll(this.suggestionPage).subscribe({
      next: (page) => {
        this.suggestions = page.content;
        this.suggestionTotalPages = page.totalPages;
        this.loadingSuggestions = false;
      },
      error: () => { this.suggestionsError = true; this.loadingSuggestions = false; }
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

  goToSuggestionPage(p: number): void {
    if (p >= 0 && p < this.suggestionTotalPages) { this.suggestionPage = p; this.loadSuggestions(); }
  }

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

  get statusOptions(): FormSelectOption[] {
    return ['PENDING', 'REVIEWED', 'IMPLEMENTED', 'REJECTED']
      .map(value => ({ value, label: this.i18n.t('suggestion.status.' + value) }));
  }
}
