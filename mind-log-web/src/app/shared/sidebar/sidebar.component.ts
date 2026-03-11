import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NgClass} from "@angular/common";
import {AvatarPlaceholderComponent} from "../../components/avatar-placeholder/avatar-placeholder.component";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ThemeService} from '../../services/theme.service';
import {SidebarCollapseService} from '../../services/sidebar-collapse.service';
import {AuthService} from '../../services/auth.service';
import {RolesEnum} from '../../enums/roles.enum';

export interface Link {
  url: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    AvatarPlaceholderComponent,
    RouterLinkActive,
    NgbModule,
    NgClass,

  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnChanges {

  private authService = inject(AuthService);
  private sidebarService = inject(SidebarCollapseService);
  private themeService = inject(ThemeService);
  @Input() username: string = '';
  @Input() isMobileOpen = false;
  @Output() signOutEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closeMobileNavEmitter: EventEmitter<void> = new EventEmitter<void>();
  isDarkMode: boolean = false;
  isCollapsed: boolean = false;

  links: Link[] = [
    {url: '', label: 'Home', icon: 'fa-house'},
  ];

  adminLinks: Link[] = [
    {url: 'usuarios', label: 'Usuários', icon: 'fa-users'}
  ];

  ngOnInit(){
    this.isCollapsed = this.sidebarService.getCollapseState();
    this.isDarkMode = this.themeService.getTheme();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isMobileOpen']?.currentValue && typeof window !== 'undefined' && window.innerWidth < 1024) {
      // Mobile drawer should always open expanded to avoid showing only a thin collapsed rail.
      this.isCollapsed = false;
    }
  }

  signOut(): void {
    this.signOutEmitter.emit(true);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getTheme();
  }

  toggleSidebar(): void {
    this.sidebarService.toggleCollapse();
    this.isCollapsed = this.sidebarService.getCollapseState();
  }

  hasAdminRole(): boolean {
    return this.authService.hasRole(RolesEnum.ADMIN);
  }

  closeMobileNav(): void {
    this.closeMobileNavEmitter.emit();
  }

}
