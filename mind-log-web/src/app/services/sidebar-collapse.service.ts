import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarCollapseService {
  private isCollapsed: boolean;

  constructor() {
    this.loadCollapseState();
  }

  private loadCollapseState(): void {
    const savedState = localStorage.getItem('sidebar-collapsed');
    this.isCollapsed = savedState === 'true';
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebar-collapsed', String(this.isCollapsed));
  }

  getCollapseState(): boolean {
    return this.isCollapsed;
  }

}
