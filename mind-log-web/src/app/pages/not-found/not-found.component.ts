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
      <app-empty-state pose="search" icon="fa-solid fa-compass"
                       [title]="'notFound.title' | translate"
                       [description]="'notFound.text' | translate">
        <app-btn variant="primary" icon="fa-solid fa-house" routerLink="/">{{ 'notFound.back' | translate }}</app-btn>
      </app-empty-state>
    </div>
  `,
})
export class NotFoundComponent {}
