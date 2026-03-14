import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminMetrics, AuditLog } from '../../services/admin.service';
import { AvatarPlaceholderComponent } from '../../components/avatar-placeholder/avatar-placeholder.component';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, AvatarPlaceholderComponent, TranslatePipe],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  metrics?: AdminMetrics;
  auditLogs: AuditLog[] = [];
  loading = true;
  loadingLogs = true;
  auditPage = 0;
  auditTotalPages = 0;

  ngOnInit(): void {
    this.service.getMetrics().subscribe({
      next: (m) => { this.metrics = m; this.loading = false; },
      error: () => { this.toastr.error('Failed to load metrics.'); this.loading = false; }
    });
    this.loadLogs();
  }

  loadLogs(): void {
    this.loadingLogs = true;
    this.service.getAuditLogs(this.auditPage).subscribe({
      next: (page) => {
        this.auditLogs = page.content;
        this.auditTotalPages = page.totalPages;
        this.loadingLogs = false;
      },
      error: () => this.loadingLogs = false
    });
  }

  goToPage(p: number): void { if (p >= 0 && p < this.auditTotalPages) { this.auditPage = p; this.loadLogs(); } }
  pages(): number[] { return Array.from({ length: this.auditTotalPages }, (_, i) => i); }

  getActionBadge(action: string): string {
    if (action.includes('CREATED')) return 'badge-success';
    if (action.includes('DELETED')) return 'badge-danger';
    if (action.includes('UPDATED')) return 'badge-warning';
    if (action.includes('FOLLOW')) return 'badge-indigo';
    return 'badge-secondary';
  }
}
