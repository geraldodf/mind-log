import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {IconComponent, IconName} from '../../../shared/ui/icon/icon.component';
import {BtnComponent, MascotComponent, ModalComponent, ModalRef, StepDotsComponent} from '../../../shared/ui';

interface OnboardingStep {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  descriptionKey: string;
  detailKey: string;
}

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [IconComponent, CommonModule, TranslatePipe, ModalComponent, BtnComponent, StepDotsComponent, MascotComponent],
  templateUrl: './onboarding-modal.component.html',
})
export class OnboardingModalComponent {
  readonly modalRef = inject(ModalRef);
  private readonly router = inject(Router);

  @ViewChild(ModalComponent) private modal?: ModalComponent;

  /** `finished`: concluiu o tour; `undefined`: pulou. */
  result?: 'finished';

  currentStep = 0;

  readonly steps: OnboardingStep[] = [
    {
      icon: 'brain',
      iconBg: 'bg-primary-500/15',
      iconColor: 'text-primary-500 dark:text-primary-400',
      titleKey: 'onboarding.step1.title',
      descriptionKey: 'onboarding.step1.description',
      detailKey: 'onboarding.step1.detail',
    },
    {
      icon: 'circle-plus',
      iconBg: 'bg-secondary-500/15',
      iconColor: 'text-secondary-500 dark:text-secondary-400',
      titleKey: 'onboarding.step2.title',
      descriptionKey: 'onboarding.step2.description',
      detailKey: 'onboarding.step2.detail',
    },
    {
      icon: 'list-check',
      iconBg: 'bg-success-500/15',
      iconColor: 'text-success-500 dark:text-success-400',
      titleKey: 'onboarding.step3.title',
      descriptionKey: 'onboarding.step3.description',
      detailKey: 'onboarding.step3.detail',
    },
    {
      icon: 'star',
      iconBg: 'bg-warning-500/15',
      iconColor: 'text-warning-500 dark:text-warning-400',
      titleKey: 'onboarding.step4.title',
      descriptionKey: 'onboarding.step4.description',
      detailKey: 'onboarding.step4.detail',
    },
    {
      icon: 'users',
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
  finish(): void {
    this.result = 'finished';
    this.modal?.close();
    this.router.navigateByUrl('/media/new');
  }

  skip(): void { this.modal?.close(); }
}
