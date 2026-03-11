import {CommonModule, DatePipe} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {User} from '../../models/user/user.interface';

@Component({
  selector: 'app-mobile-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-users-list.component.html'
})
export class MobileUsersListComponent {
  @Input() users: User[] = [];
  @Input() roleLabels: Record<string, string> = {};
  @Output() toggleEnabled = new EventEmitter<User>();
}

