import { inject, Injectable } from '@angular/core';
import { ModalRef, ModalService } from '../shared/ui';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { OnboardingModalComponent } from '../pages/home/onboarding-modal/onboarding-modal.component';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly modalService = inject(ModalService);

  private openRef: ModalRef | null = null;

  constructor() {
    // O diálogo é anexado ao <body>, fora do router-outlet: sem isto
    // ele sobrevive ao fim da sessão e fica sobreposto à tela de login.
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated) this.dismiss();
    });
  }

  shouldShow(): boolean {
    if (!this.tokenService.getAccessToken()) return false;
    const userId = this.authService.getId();
    if (!userId) return false;
    return !localStorage.getItem(this.storageKey(userId));
  }

  openIfNeeded(): void {
    if (this.openRef || !this.shouldShow()) return;

    // Capturado na abertura: no fechamento a sessão pode já ter terminado e o id
    // viria nulo, fazendo o onboarding reaparecer no próximo login.
    const userId = this.authService.getId();

    const ref = this.modalService.open(OnboardingModalComponent);
    this.openRef = ref;

    ref.closed.subscribe(() => {
      this.openRef = null;
      // Só marca como visto se a sessão ainda for a mesma — um logout no meio
      // não deve consumir o onboarding do usuário.
      if (this.tokenService.getAccessToken() && this.authService.getId() === userId) {
        this.markAsSeen(userId);
      }
    });
  }

  private storageKey(userId: number): string {
    return `onboarding_seen_${userId}`;
  }

  private markAsSeen(userId: number): void {
    localStorage.setItem(this.storageKey(userId), '1');
  }

  private dismiss(): void {
    if (!this.openRef) return;
    const ref = this.openRef;
    this.openRef = null;
    ref.close();
  }
}
