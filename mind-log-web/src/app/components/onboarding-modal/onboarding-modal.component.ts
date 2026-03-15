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
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-400',
      titleKey: 'onboarding.step1.title',
      descriptionKey: 'onboarding.step1.description',
      detailKey: 'onboarding.step1.detail',
    },
    {
      icon: 'fa-solid fa-circle-plus',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
      titleKey: 'onboarding.step2.title',
      descriptionKey: 'onboarding.step2.description',
      detailKey: 'onboarding.step2.detail',
    },
    {
      icon: 'fa-solid fa-list-check',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      titleKey: 'onboarding.step3.title',
      descriptionKey: 'onboarding.step3.description',
      detailKey: 'onboarding.step3.detail',
    },
    {
      icon: 'fa-solid fa-star',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      titleKey: 'onboarding.step4.title',
      descriptionKey: 'onboarding.step4.description',
      detailKey: 'onboarding.step4.detail',
    },
    {
      icon: 'fa-solid fa-users',
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-400',
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
