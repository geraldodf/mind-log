import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {User} from '../../../../models/user/user.interface';
import {TranslatePipe} from '../../../../pipes/translate.pipe';
import {BadgeComponent, BtnComponent, CardComponent} from '../../../../shared/ui';

@Component({
  selector: 'app-mobile-users-list',
  standalone: true,
  imports: [CardComponent, BadgeComponent, BtnComponent, CommonModule, TranslatePipe],
  templateUrl: './mobile-users-list.component.html'
})
export class MobileUsersListComponent {
  @Input() users: User[] = [];
  @Input() roleLabels: Record<string, string> = {};
  @Output() toggleEnabled = new EventEmitter<User>();
}

