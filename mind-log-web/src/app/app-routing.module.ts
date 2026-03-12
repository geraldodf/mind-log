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
