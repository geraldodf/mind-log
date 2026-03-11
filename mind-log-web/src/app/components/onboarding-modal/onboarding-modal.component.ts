import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './onboarding-modal.component.html',
  styleUrl: './onboarding-modal.component.scss'
})
export class OnboardingModalComponent {
  private dialogRef = inject(MatDialogRef<OnboardingModalComponent>);

  currentStep = 1;
  totalSteps = 1;

  steps = [
    {
      title: 'Bem-vindo!',
      description: 'Sua aplicação está pronta. Configure os próximos passos conforme o domínio do projeto.',
      icon: 'fa-hand-sparkles',
      color: 'primary'
    }
  ];

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.finish();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  skip() {
    this.finish();
  }

  finish() {
    localStorage.setItem('onboarding_completed', 'true');
    this.dialogRef.close();
  }
}
