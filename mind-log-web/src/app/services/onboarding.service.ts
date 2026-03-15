import { inject, Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './auth.service';
import { OnboardingModalComponent } from '../components/onboarding-modal/onboarding-modal.component';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(NgbModal);

  private storageKey(): string {
    return `onboarding_seen_${this.authService.getId()}`;
  }

  shouldShow(): boolean {
    const userId = this.authService.getId();
    if (!userId) return false;
    return !localStorage.getItem(this.storageKey());
  }

  markAsSeen(): void {
    const userId = this.authService.getId();
    if (userId) localStorage.setItem(this.storageKey(), '1');
  }

  openIfNeeded(): void {
    if (!this.shouldShow()) return;
    const ref = this.modalService.open(OnboardingModalComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
      keyboard: false
    });
    ref.result.finally(() => this.markAsSeen());
  }
}
