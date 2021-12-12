import { Component } from '@angular/core';
import { AuthService, ToastyService } from '../../../services';
import { AuthService as SocialLoginService } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { HomePage } from '../../home/home';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'google-login',
  template: ` <button ion-button full color="secondary" (click)="signInWithGoogle()">
              <ion-icon name="logo-google" class="custom-icon google-white-icon"></ion-icon>
              <span>Goole</span>
            </button>`
})
export class GoogleLoginButtonComponent {

  constructor(private nav: NavController, private toasty: ToastyService, private auth: AuthService,
    private socialAuthService: SocialLoginService, private translate: TranslateService) {
  }

  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((resp) => {
        this.auth.socialLogin('google', resp.authToken);
        this.nav.setRoot(HomePage);
      }).catch(() => { return this.toasty.error(this.translate.instant('Something went wrong, please try again')) });
  }
}
