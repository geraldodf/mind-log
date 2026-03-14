import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {RouterModule, RouterOutlet} from '@angular/router';
import {TopNavComponent} from './shared/topnav/topnav.component';
import {JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {httpErrorInterceptor} from './interceptors/http-error.interceptor';
import {authInterceptor} from './interceptors/auth.interceptor';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MatDialogModule} from '@angular/material/dialog';
import {NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxUiLoaderModule} from 'ngx-ui-loader';
import {CustomDateParserFormatterService} from './services/utils/custom-date-parser-formatter.service';
import { ChangePasswordComponent } from './pages/auth/change-password/change-password.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterOutlet,
    AppRoutingModule,
    RouterModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgbModule,
    TopNavComponent,
    MatDialogModule,
    NgbModule,
    NgxUiLoaderModule
  ],
  providers: [
    provideHttpClient(),
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatterService },
    JwtHelperService,
    provideHttpClient(withInterceptors([httpErrorInterceptor, authInterceptor])),
    provideAnimationsAsync(),
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
