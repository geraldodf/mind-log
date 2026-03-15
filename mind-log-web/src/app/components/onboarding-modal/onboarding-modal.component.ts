import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface OnboardingStep {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  detail: string;
}

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
      title: 'Bem-vindo ao MindLog',
      description: 'Seu diário pessoal de tudo que você consome.',
      detail: 'Filmes, séries, livros, jogos, podcasts, cursos — registre qualquer mídia em um só lugar e acompanhe sua jornada ao longo do tempo.'
    },
    {
      icon: 'fa-solid fa-circle-plus',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
      title: 'Adicione qualquer mídia',
      description: 'Crie entradas para tudo que você já consumiu ou quer consumir.',
      detail: 'A plataforma é genérica — você escolhe o tipo de mídia, seja um padrão do sistema ou uma categoria personalizada que você mesmo criou.'
    },
    {
      icon: 'fa-solid fa-list-check',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      title: 'Acompanhe seu progresso',
      description: 'Use status para saber onde você está com cada item.',
      detail: 'Planejado, Em andamento, Concluído, Pausado, Abandonado — ou crie seus próprios status personalizados para organizar do jeito que faz sentido pra você.'
    },
    {
      icon: 'fa-solid fa-star',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      title: 'Avalie e reflita',
      description: 'Registre o que você sentiu e o que achou de cada experiência.',
      detail: 'Dê uma nota de 1 a 5, escolha um emoji que representa como você se sentiu, escreva notas rápidas ou uma review completa, e indique se recomendaria para alguém.'
    },
    {
      icon: 'fa-solid fa-users',
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-400',
      title: 'Descubra pessoas',
      description: 'Veja o que outros estão consumindo e siga quem te interessa.',
      detail: 'Entradas marcadas como públicas aparecem no perfil do usuário. Siga pessoas e fique de olho no que a comunidade está explorando.'
    }
  ];

  get isFirst(): boolean { return this.currentStep === 0; }
  get isLast(): boolean { return this.currentStep === this.steps.length - 1; }
  get current(): OnboardingStep { return this.steps[this.currentStep]; }

  next(): void { if (!this.isLast) this.currentStep++; }
  prev(): void { if (!this.isFirst) this.currentStep--; }
  finish(): void { this.activeModal.close(); }
  skip(): void { this.activeModal.dismiss(); }
}
