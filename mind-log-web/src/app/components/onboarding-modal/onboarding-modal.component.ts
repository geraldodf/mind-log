import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface OnboardingStep {
  icon: string;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  descriptionKey: string;
  detailKey: string;
}

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './onboarding-modal.component.html',
  styleUrl: './onboarding-modal.component.scss'
})
export class OnboardingModalComponent {
  readonly activeModal = inject(NgbActiveModal);

  currentStep = 0;

  readonly steps: OnboardingStep[] = [
    {
      icon: 'fa-solid fa-brain',
      iconBg: 'bg-primary-500/15',
      iconColor: 'text-primary-500 dark:text-primary-400',
      titleKey: 'onboarding.step1.title',
      descriptionKey: 'onboarding.step1.description',
      detailKey: 'onboarding.step1.detail',
    },
    {
      icon: 'fa-solid fa-circle-plus',
      iconBg: 'bg-secondary-500/15',
      iconColor: 'text-secondary-500 dark:text-secondary-400',
      titleKey: 'onboarding.step2.title',
      descriptionKey: 'onboarding.step2.description',
      detailKey: 'onboarding.step2.detail',
    },
    {
      icon: 'fa-solid fa-list-check',
      iconBg: 'bg-success-500/15',
      iconColor: 'text-success-500 dark:text-success-400',
      titleKey: 'onboarding.step3.title',
      descriptionKey: 'onboarding.step3.description',
      detailKey: 'onboarding.step3.detail',
    },
    {
      icon: 'fa-solid fa-star',
      iconBg: 'bg-warning-500/15',
      iconColor: 'text-warning-500 dark:text-warning-400',
      titleKey: 'onboarding.step4.title',
      descriptionKey: 'onboarding.step4.description',
      detailKey: 'onboarding.step4.detail',
    },
    {
      icon: 'fa-solid fa-users',
      iconBg: 'bg-primary-500/15',
      iconColor: 'text-primary-500 dark:text-primary-400',
      titleKey: 'onboarding.step5.title',
      descriptionKey: 'onboarding.step5.description',
      detailKey: 'onboarding.step5.detail',
    },
  ];

  get isFirst(): boolean { return this.currentStep === 0; }
  get isLast(): boolean { return this.currentStep === this.steps.length - 1; }
  get current(): OnboardingStep { return this.steps[this.currentStep]; }

  next(): void { if (!this.isLast) this.currentStep++; }
  prev(): void { if (!this.isFirst) this.currentStep--; }
  finish(): void { this.activeModal.close(); }
  skip(): void { this.activeModal.dismiss(); }
}
