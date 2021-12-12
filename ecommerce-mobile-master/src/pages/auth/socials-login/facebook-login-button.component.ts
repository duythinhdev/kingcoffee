import { Component } from '@angular/core';
import { AuthService, ToastyService } from '../../../services';
import { AuthService as SocialLoginService } from 'angularx-social-login';
import { FacebookLoginProvider } from 'angularx-social-login';
import { NavController } from 'ionic-angular';
import { HomePage } from '../../home/home';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'facebook-login',
  template: `<button ion-button full color="danger" (click)="signInWithFacebook()">
                <ion-icon class="custom-icon facebook-white-icon" name="logo-facebook"></ion-icon>
                <span>Facebook</span>
            </button>`
})
export class FacebookLoginButtonComponent {

  constructor(private auth: AuthService, private socialAuthService: SocialLoginService, private nav: NavController,
    private toasty: ToastyService, private translate: TranslateService) {
  }

  signInWithFacebook(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)
      .then((resp) => {
        this.auth.socialLogin('facebook', resp.authToken);
        this.nav.setRoot(HomePage);
      })
      .catch(err => {
        return this.toasty.error(this.translate.instant('Something went wrong, please retry again.'));
      });
  }

}
