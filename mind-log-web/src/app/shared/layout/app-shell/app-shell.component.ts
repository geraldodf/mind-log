import {Component, EventEmitter, inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {DatePipe, NgClass, NgTemplateOutlet} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AvatarPlaceholderComponent} from '../../ui/avatar/avatar.component';
import {ThemeToggleComponent} from '../../ui/theme-toggle/theme-toggle.component';
import {
  BadgeComponent,
  BottomNavItemComponent,
  BrandMarkComponent,
  BtnComponent,
  CountBadgeComponent,
  FormTextareaComponent,
  IconBtnComponent,
  ModalComponent,
  SheetTileComponent,
  SpinnerComponent,
  TextLinkComponent,
} from '../../ui';
import {UnsavedChangesService} from '../../../services/unsaved-changes.service';
import {ThemeService} from '../../../services/theme.service';
import {AuthService} from '../../../services/auth.service';
import {RolesEnum} from '../../../enums/roles.enum';
import {NotificationService} from '../../../services/notification.service';
import {SuggestionService} from '../../../services/suggestion.service';
import {ToastrService} from 'ngx-toastr';
import {TranslatePipe} from '../../../pipes/translate.pipe';
import {Notification} from '../../../models/media/notification.interface';
import {I18nService} from '../../../services/i18n.service';
import {IconComponent} from '../../ui/icon/icon.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [IconComponent, 
    RouterLink, RouterLinkActive, AvatarPlaceholderComponent, ThemeToggleComponent,
    BtnComponent, IconBtnComponent, SpinnerComponent, FormTextareaComponent, SheetTileComponent,
    ModalComponent, BrandMarkComponent, CountBadgeComponent, BottomNavItemComponent, BadgeComponent, TextLinkComponent,
    NgbModule, NgClass, NgTemplateOutlet, FormsModule, TranslatePipe, DatePipe,
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private suggestionService = inject(SuggestionService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private i18n = inject(I18nService);
  private unsavedChanges = inject(UnsavedChangesService);

  @ViewChild('feedbackModal') feedbackModal!: ModalComponent;

  @Input() username = '';
  @Output() signOutEmitter = new EventEmitter<void>();

  unreadCount = 0;
  recentNotifications: Notification[] = [];
  notifLoading = false;
  notifLoaded = false;
  isMoreSheetOpen = false;

  feedbackOpen = false;
  feedbackText = '';
  feedbackSubmitting = false;

  get picture(): string | null {
    return this.authService.getPicture();
  }

  get isMoreRouteActive(): boolean {
    return this.router.url.startsWith('/media-types') || this.router.url.startsWith('/statuses');
  }

  hasAdminRole(): boolean {
    return this.authService.hasRole(RolesEnum.ADMIN);
  }

  ngOnInit(): void {
    this.notificationService.getUnreadCount().subscribe(count => this.unreadCount = count);
  }

  openNotifications(): void {
    if (this.notifLoaded) return;
    this.notifLoading = true;
    this.notificationService.getAll(0, 5).subscribe({
      next: (page) => {
        this.recentNotifications = page.content;
        this.notifLoading = false;
        this.notifLoaded = true;
      },
      error: () => {
        this.notifLoading = false;
        this.notifLoaded = true;
      }
    });
  }

  markAsReadIfUnread(n: Notification): void {
    if (!n.isRead) {
      this.markAsRead(n.id, new MouseEvent('click'));
    }
  }

  notifMsg(n: Notification): string {
    switch (n.notificationType) {
      case 'FOLLOW':
        return `${n.relatedName || n.relatedUsername} ${this.i18n.t('notifications.followedYou')}`;
      case 'MEDIA_RELEASE_TODAY':
        return `${this.i18n.t('notifications.mediaTodayMsg')} "${n.userMediaTitle}"!`;
      case 'MEDIA_RELEASE_SOON':
        return `${this.i18n.t('notifications.mediaSoonMsg')} "${n.userMediaTitle}"`;
      default:
        return n.message;
    }
  }

  markAsRead(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const n = this.recentNotifications.find(x => x.id === id);
        if (n) {
          n.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      }
    });
  }

  signOut(): void {
    this.signOutEmitter.emit();
  }

  toggleMoreSheet(): void {
    this.isMoreSheetOpen = !this.isMoreSheetOpen;
  }

  closeMoreSheet(): void {
    this.isMoreSheetOpen = false;
  }

  openFeedback(): void {
    this.feedbackOpen = true;
    this.feedbackText = '';
    this.isMoreSheetOpen = false;
  }

  closeFeedback(): void {
    this.feedbackOpen = false;
  }

  /** Texto digitado e não enviado: pergunta antes de descartar. */
  readonly canCloseFeedback = (): Observable<boolean> =>
    this.feedbackText.trim() && !this.feedbackSubmitting ? this.unsavedChanges.confirmDiscard() : of(true);

  submitFeedback(): void {
    if (!this.feedbackText.trim()) return;
    this.feedbackSubmitting = true;
    this.suggestionService.submit(this.feedbackText.trim()).subscribe({
      next: () => {
        this.toastr.success(this.i18n.t('suggestion.success'));
        this.feedbackText = '';
        this.feedbackSubmitting = false;
        this.feedbackOpen = false;
      },
      error: () => {
        this.toastr.error(this.i18n.t('toast.feedbackFailed'));
        this.feedbackSubmitting = false;
      }
    });
  }
}
