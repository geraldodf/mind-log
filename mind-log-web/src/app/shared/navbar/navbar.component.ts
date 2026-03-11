import {Component, Input, Output, EventEmitter} from '@angular/core';
import { DirectivesModule } from '../directives/directives.module';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    DirectivesModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  @Input() title: string = 'Title';
  @Input() label: string = '';

  @Output() actionClicked = new EventEmitter<void>();

  onActionClick() {
    this.actionClicked.emit();
  }

}
