import {NgModule} from "@angular/core";
import {
  PreloadAllModules,
  provideRouter,
  RouterModule,
  Routes,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from "@angular/router";
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
    path: 'import',
    loadComponent: () => import('./pages/import/import.component').then(m => m.ImportComponent),
    canActivate: [authGuard],
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

/**
 * Aba oculta não pinta: a transição esperaria um quadro que não vem e a navegação
 * travaria (tela em branco). Com movimento reduzido, a troca é instantânea.
 */
const skipWhenItCannotPaint = ({transition}: {transition: {skipTransition(): void}}) => {
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.visibilityState === 'hidden' || reduced) transition.skipTransition();
};

@NgModule({
  // RouterModule sem forRoot só traz as diretivas; a configuração vem do provideRouter,
  // porque só ele aceita o callback das View Transitions.
  imports: [RouterModule],
  exports: [RouterModule],
  providers: [
    provideRouter(routes,
      // Voltar da detail para a lista mantinha o scroll no topo.
      withInMemoryScrolling({scrollPositionRestoration: 'enabled'}),
      // Páginas carregadas sob demanda e pré-carregadas depois do primeiro paint.
      withPreloading(PreloadAllModules),
      // Só o corpo troca, com fade curto (ver styles.scss).
      withViewTransitions({skipInitialTransition: true, onViewTransitionCreated: skipWhenItCannotPaint}),
    ),
  ],
})
export class AppRoutingModule {
}
