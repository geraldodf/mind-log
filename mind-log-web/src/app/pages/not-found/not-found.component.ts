import {Component} from '@angular/core';
import {TranslatePipe} from '../../pipes/translate.pipe';
import {BtnComponent, EmptyStateComponent} from '../../shared/ui';

/** Endereço que não existe. Antes caía na Home, sem dizer que o link estava errado. */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [TranslatePipe, BtnComponent, EmptyStateComponent],
  template: `
    <div class="w-full">
      <!-- A página precisa de um h1; o título visível é o do estado vazio. -->
      <h1 class="sr-only">{{ 'notFound.title' | translate }}</h1>
      <app-empty-state pose="search" icon="compass"
                       [title]="'notFound.title' | translate"
                       [description]="'notFound.text' | translate">
        <app-btn variant="primary" icon="house" routerLink="/">{{ 'notFound.back' | translate }}</app-btn>
      </app-empty-state>
    </div>
  `,
})
export class NotFoundComponent {}
