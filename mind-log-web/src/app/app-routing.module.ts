import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {authGuard} from './guards/auth.guard';
import {CanDeactivateGuard} from './guards/can-component-deactivate.guard';
import {RolesEnum} from "./enums/roles.enum";

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/sign-in/sign-in.component').then(m => m.SignInComponent),
  },
  {
    path: 'auth/sign-up',
    loadComponent: () => import('./pages/auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'media',
    loadComponent: () => import('./pages/media/media-list/media-list.component').then(m => m.MediaListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'media/new',
    loadComponent: () => import('./pages/media/media-form/media-form.component').then(m => m.MediaFormComponent),
    canActivate: [authGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'media/:id',
    loadComponent: () => import('./pages/media/media-detail/media-detail.component').then(m => m.MediaDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'media/:id/edit',
    loadComponent: () => import('./pages/media/media-form/media-form.component').then(m => m.MediaFormComponent),
    canActivate: [authGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'planned',
    loadComponent: () => import('./pages/planned/planned.component').then(m => m.PlannedComponent),
    canActivate: [authGuard],
  },
  {
    path: 'top10',
    loadComponent: () => import('./pages/top10/top10.component').then(m => m.Top10Component),
    canActivate: [authGuard],
  },
  {
    path: 'people',
    loadComponent: () => import('./pages/people/people.component').then(m => m.PeopleComponent),
    canActivate: [authGuard],
  },
  {
    path: 'media-types',
    loadComponent: () => import('./pages/media-types/media-types.component').then(m => m.MediaTypesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'statuses',
    loadComponent: () => import('./pages/statuses/statuses.component').then(m => m.StatusesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/user/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard],
    data: {roles: [RolesEnum.ADMIN]}
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/user/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'alterar-senha',
    loadComponent: () => import('./pages/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [authGuard],
  },
  {
    path: 'u/:username',
    loadComponent: () => import('./pages/public-profile/public-profile.component').then(m => m.PublicProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [authGuard],
    data: {roles: [RolesEnum.ADMIN]}
  },
  {
    path: '**', pathMatch: "full", loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    canActivate: [authGuard]
  },
];

@NgModule({
  // scrollPositionRestoration: voltar da detail para a lista mantinha o scroll no topo.
  // Páginas carregadas sob demanda e pré-carregadas depois do primeiro paint.
  // View Transitions: só o corpo troca, com fade curto (ver styles.scss).
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    preloadingStrategy: PreloadAllModules,
    enableViewTransitions: true,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
