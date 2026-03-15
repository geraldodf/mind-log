import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from './pages/home/home.component';
import {authGuard} from './guards/auth.guard';
import {SignInComponent} from './pages/auth/sign-in/sign-in.component';
import {UsersComponent} from './pages/user/users/users.component';
import {RolesEnum} from "./enums/roles.enum";
import {ProfileComponent} from './pages/user/profile/profile.component';
import {ChangePasswordComponent} from './pages/auth/change-password/change-password.component';
import {SignUpComponent} from './pages/auth/sign-up/sign-up.component';
import {AuthCallbackComponent} from './pages/auth/auth-callback/auth-callback.component';
import {MediaListComponent} from './pages/media/media-list/media-list.component';
import {MediaFormComponent} from './pages/media/media-form/media-form.component';
import {MediaDetailComponent} from './pages/media/media-detail/media-detail.component';
import {MediaTypesComponent} from './pages/media-types/media-types.component';
import {StatusesComponent} from './pages/statuses/statuses.component';
import {NotificationsComponent} from './pages/notifications/notifications.component';
import {PublicProfileComponent} from './pages/public-profile/public-profile.component';
import {AdminPanelComponent} from './pages/admin/admin-panel.component';
import {ContentComponent} from './pages/content/content.component';
import {Top10Component} from './pages/top10/top10.component';
import {PeopleComponent} from './pages/people/people.component';

const routes: Routes = [
  {
    path: 'login',
    component: SignInComponent
  },
  {
    path: 'auth/sign-up',
    component: SignUpComponent
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  {
    path: 'esqueceu-senha',
    component: SignInComponent
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'media',
    component: MediaListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'media/new',
    component: MediaFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'media/:id',
    component: MediaDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'media/:id/edit',
    component: MediaFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'top10',
    component: Top10Component,
    canActivate: [authGuard],
  },
  {
    path: 'people',
    component: PeopleComponent,
    canActivate: [authGuard],
  },
  {
    path: 'content',
    component: ContentComponent,
    canActivate: [authGuard],
  },
  {
    path: 'media-types',
    component: MediaTypesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'statuses',
    component: StatusesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'usuarios',
    component: UsersComponent,
    canActivate: [authGuard],
    data: {roles: [RolesEnum.ADMIN]}
  },
  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'alterar-senha',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: 'u/:username',
    component: PublicProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [authGuard],
    data: {roles: [RolesEnum.ADMIN]}
  },
  {
    path: '**', pathMatch: "full", component: HomeComponent,
    canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
