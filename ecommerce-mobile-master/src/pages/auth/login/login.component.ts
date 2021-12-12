import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AuthService,
  CartService,
  SystemService,
  ToastyService,
} from '../../../services';
import { NavController, AlertController, Platform, Content, App } from 'ionic-angular';
import { HomePage } from '../../home/home';
import { ForgotComponent } from '../forgot/forgot.component';
import { TranslateService } from '@ngx-translate/core';
import { RegisterComponent } from '../register/register.component';
import { LocalStorgeService } from '../../../services/local-storge.service';
import { FCM } from '@ionic-native/fcm';
import { isEmpty } from 'lodash';
import { Keyboard } from '@ionic-native/keyboard';
import { SettingsPage } from '../../settings/settings';
import { Device } from '@ionic-native/device';
import { SpinLuckyPage } from '../../spin-lucky/spin-lucky';
import { isNil } from 'lodash';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { LoadingController } from 'ionic-angular';
import { ConfirmOtpSocialComponent } from '../confirm-otp-social/confirm-otp-social.component';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html',
})
export class LoginComponent {
  credentials = {
    username: '',
    password: '',
    twoFaCode: '',
    deviceId: '',
  };
  checkMobile = '';
  infor_update = {
    phone_number: '',
    email: '',
  }

  emailUpdate = '';
  phoneUpdate = '';
  checkFirstLetterMobile = '';
  loginSocial = false;
  isEmail = false;
  isPhoneNumber = false;
  currentVersion = 0;
  appVersion = parseInt(window.appConfig.version, 10);
  submitted = false;
  logoUrl = '';
  password_type = 'password';
  eye_type = 'eye-off';
  @ViewChild(Content) content: Content;

  constructor(
    private alertCtrl: AlertController,
    private platform: Platform,
    private localStorage: LocalStorgeService,
    private nav: NavController,
    private localStorgeService: LocalStorgeService,
    private auth: AuthService,
    private translate: TranslateService,
    private toasty: ToastyService,
    private systemService: SystemService,
    private alter: AlertController,
    private cartService: CartService,
    private fcm: FCM,
    private keyboard: Keyboard,
    private app: App,
    private device: Device,
    private safariViewController: SafariViewController,
    public loadingCtrl: LoadingController,
    private account: AccountService,
  ) {
    // this.app.getActiveNav().parent.select(4);
    this.keyboard.disableScroll(true);
    this.systemService.configs().then((res) => {
      this.logoUrl = res.siteLogo;
      this.currentVersion = res.appVersion | 0;
    });
    if (!this.device.uuid) {
      this.credentials.deviceId = 'd8da544894e56aea';
    }
    else {
      this.credentials.deviceId = this.device.uuid
    }
  }
  loader = this.loadingCtrl.create({});

  async getTokenDeviceFCM() {
    try {
      const tokenDevice = this.fcm.getToken();
      return tokenDevice;
    } catch (error) {
      await this.toasty.error(this.translate.instant(error));
      return "";
    }
  }

  async checkUpdateAppVersion() {
    return new Promise((resolve, reject) => {
      if (this.appVersion && this.appVersion >= this.currentVersion) {
        resolve(true);
      } else {
        if (this.platform.is('ios')) {
          const alert = this.alertCtrl.create({
            title: 'Cập nhật phiên bản',
            subTitle:
              'WE4.0 đã có phiên bản mới nhất trên chợ ứng dụng. Vui lòng cập nhật phiên bản để được trải nghiệm tốt nhất.',
            buttons: [
              {
                text: 'Đồng ý',
                handler: () => {
                  // window.open(
                  //   'https://apps.apple.com/us/app/we4-0/id1534256364',
                  //   '_system',
                  //   'location=yes'
                  // );
                  this.safariViewController.isAvailable()
                    .then((available: boolean) => {
                      if (available) {
                        this.safariViewController.show({
                          url: 'https://apps.apple.com/us/app/we4-0/id1534256364',
                          hidden: false,
                          animated: false,
                          transition: 'curl',
                          enterReaderModeIfAvailable: true,
                          tintColor: '#000000'
                        })
                          .subscribe((result: any) => {
                            // if(result.event === 'opened') console.log('Opened');
                            // else if(result.event === 'loaded') console.log('Loaded');
                            // else if(result.event === 'closed') console.log('Closed');
                          },
                            (error: any) => {
                              // console.error(error)
                            }
                          );

                      } else {
                        // use fallback browser, example InAppBrowser
                      }
                    }
                    );
                },
              },
            ],
          });
          return alert.present();
        }

        if (this.platform.is('android')) {
          const alert = this.alertCtrl.create({
            title: 'Cập nhật phiên bản',
            subTitle:
              'WE4.0 đã có phiên bản mới nhất trên chợ ứng dụng. Vui lòng cập nhật phiên bản để được trải nghiệm tốt nhất.',
            buttons: [
              {
                text: 'Đồng ý',
                handler: () => {
                  window.open(
                    'https://play.google.com/store/apps/details?id=com.tniecommerce',
                    '_system',
                    'location=yes'
                  );
                },
              },
            ],
          });
          return alert.present();
        }
      }
    });
  }

  async checkMember() {
    const resp = await this.auth.me_social();

    this.localStorgeService.set('social_token', resp.data.accessToken);
    this.localStorgeService.set(
      'isMember',
      resp.data.socialInfo.IsMember
    );

    if (resp) {
      // let find = resp.data.socialInfo.UserRoles.find(x => x.Role == 3 || x.Role == 2 || x.Role == 1);
      if (resp.data.socialInfo.UserRoles.length > 0) {
        this.localStorgeService.set(
          'role',
          resp.data.socialInfo.UserRoles[0].Role
        );
        this.localStorgeService.set(
          'roleName',
          resp.data.socialInfo.UserRoles[0].RoleName
        );
      }
    }
  }
  async updateInforsocial() {
    await this.auth.me().then(async (res) => {
      if (!isNil(res.data)) {
        let email = res.data.email;
        let phone = res.data.phoneNumber;
        if (!email && !phone) {
          this.loginSocial = true;
        }
        else if (!email && phone) {
          this.loginSocial = true;
          this.isEmail = true;
          this.phoneUpdate = phone;
        }
        else if (email && !phone) {
          this.loginSocial = true;
          this.isPhoneNumber = true;
          this.emailUpdate = email;
        }
        else {
          this.loginSuccessHandle();
        }
      }
      else {
        return this.toasty.error(this.translate.instant(res.data.message));
      }
    })

  }

  async updateProfile(json) {
    return this.nav.push(ConfirmOtpSocialComponent, json)
  }

  async loginSuccessHandle() {
    const sendData = {
      popup: true
    }

    await this.cartService.clean();

    if (this.platform.is('ios')) {
      this.getTokenDeviceFCM().then(async (deviceToken) => {
        if (!isEmpty(deviceToken)) {
          await this.auth.addDevice({ os: 'ios', tokenDevice: deviceToken });
        }
      }).catch((error) => {
        return this.toasty.error(this.translate.instant(error));
      })
    }

    if (this.platform.is('android')) {
      this.getTokenDeviceFCM().then(async (deviceToken) => {
        if (!isEmpty(deviceToken)) {
          await this.auth.addDevice({ os: 'android', tokenDevice: deviceToken });
        }
      }).catch((error) => {
        return this.toasty.error(this.translate.instant(error));
      })
    }

    await this.auth.me().then(async (meResponse) => {
      if (!isNil(meResponse.data)) {
        const createdAt = meResponse.data.createdAt;
        const createdDate = new Date(createdAt);
        const wheelSpinned = meResponse.data.wheelSpinned;
        const startDayResponse = await this.auth.getStartDay();
        const startDate = new Date(startDayResponse.data.startDate);
        if (createdDate > startDate) {
          if (wheelSpinned) {
            this.nav.setRoot(HomePage, sendData);
            this.nav.setRoot(SettingsPage);
          }
          else {
            this.nav.setRoot(SpinLuckyPage);
          }
        }
        else {
          this.nav.setRoot(HomePage, sendData);
          this.nav.setRoot(SettingsPage);
        }
      }
      else {
        this.nav.setRoot(HomePage, sendData);
        this.nav.setRoot(SettingsPage);
      }
    })

  }


  async login(frm) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }
    const validVersion = await this.checkUpdateAppVersion();
    if (validVersion) {
      this.auth
        .login(this.credentials)
        .then(async (res) => {
          if (
            res.code === 4003 ||
            res.data.message === 'Mã xác thực không đúng!'
          ) {
            await this.presentAlert();
          } else if (res.message === 'OK') {
            await this.checkMember();
            await this.loginSuccessHandle();
          } else {
            if (res.data.data.message) {
              return this.toasty.error(this.translate.instant(res.data.data.message));
            } else {
              return this.toasty.error(this.translate.instant(res.data.message));
            }
          }
        })
        .catch((err) => {
          return this.toasty.error(
            this.translate.instant(
              err.data.data.message ||
              'Your account is not activated or register. Please recheck again or contact to our admin to resolve it.'
            )
          );
        });
    }
  }

  async update_infor(frm) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }
    await this.checkDuplicateMobile(this.infor_update.phone_number);
    if (this.checkMobile === '' && this.checkFirstLetterMobile === '') {
      if (!this.phoneUpdate && !this.emailUpdate) {
        this.updateProfile(this.infor_update)
      }
      else if (!this.phoneUpdate) {
        let json = {
          "phone_number": this.infor_update.phone_number,
        }
        this.updateProfile(json)
      }
      else if (!this.emailUpdate) {
        let json = {
          "email": this.infor_update.email
        }
        this.updateProfile(json)
      }
    }
  }

  async backbtn() {
    this.loginSocial = false
  }

  async facebookLogin() {
    const validVersion = await this.checkUpdateAppVersion();
    if (validVersion) {
      try {
        const res = await this.auth.onFacebookLogin();
        const { accessToken } = res.authResponse;
        const deviceId = this.device.uuid;
        this.loader.present();
        let json = {
          "accessToken": res.authResponse.accessToken,
          "deviceId": deviceId
        }
        let loginSuccess = await this.auth.socialLoginFacebook(json);
        if(loginSuccess.code == 200){
          await this.updateInforsocial();
        }
        else{
          this.toasty.error(this.translate.instant(loginSuccess.data.message));
        }
      } catch (e) {
        if ((JSON.stringify(e).indexOf('cancelled') !== -1)) {
          return;
        }
        this.toasty.error(this.translate.instant('Something went wrong, please try again'));
      }
    }
    this.loader.dismissAll();
    // return this.nav.push(ConfirmOtpSocialComponent)
  }

  async googleLogin() {
    const validVersion = await this.checkUpdateAppVersion();
    if (validVersion) {
      try {
        const res = await this.auth.onGoogleLogin();
        const { accessToken } = res;
        const deviceId = this.device.uuid;
        this.loader.present();
        let json = {
          "accessToken": res.accessToken,
          "deviceId": deviceId
        }
        
        let loginSuccess = await this.auth.socialLoginGoogle(json);
        if(loginSuccess.code == 200){
          await this.updateInforsocial();
        }
        else{
          this.toasty.error(this.translate.instant(loginSuccess.data.message));
        }

      } catch (e) {
        if ((JSON.stringify(e).indexOf('canceled') !== -1) || e === 12501) {
          return;
        }
        this.toasty.error(this.translate.instant('Something went wrong, please try again'));
      }
    }
    this.loader.dismissAll();
  }

  async appleLogin() {
    const validVersion = await this.checkUpdateAppVersion();
    if (validVersion) {
      try {
        let params = await this.auth.onAppleLogin();
        params = {
          ...params,
          "deviceId": this.device.uuid
        }
        this.loader.present();
        let loginSuccess = await this.auth.socialLoginApple(params);
        if(loginSuccess.code == 200){
          await this.updateInforsocial();
        }
        else{
          this.toasty.error(this.translate.instant(loginSuccess.data.message));
        }
      } catch (e) {
        if (e.code && e.code === '1001' || e.code === '1000') {
          return
        }
        this.toasty.error(this.translate.instant('Something went wrong, please try again'));
      }
    }
    this.loader.dismissAll();
  }

  onChangeInput(event) {
    if (event._value == "") {
      this.submitted = false;
    }
  }

  goTo(state) {
    if (state === 'register') {
      return this.nav.push(RegisterComponent, true);
    } else if (state === 'forgot') {
      return this.nav.push(ForgotComponent);
    }
  }

  togglePasswordMode() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_type === 'password'
      ? (this.eye_type = 'eye-off')
      : (this.eye_type = 'eye');
  }

  async presentAlert() {
    const alert = this.alter.create({
      title: 'Nhập mã xác thực !',
      inputs: [
        {
          name: 'input',
          type: 'text',
          placeholder: 'Nhập 6 ký tự',
        },
      ],
      buttons: [
        {
          text: 'Thoát',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Ok',
          handler: (data) => {
            this.credentials.twoFaCode = data.input;
            this.auth
              .login(this.credentials)
              .then(async (resp) => {
                if (
                  resp.code === 4003 ||
                  resp.data.message === 'Mã xác thực không đúng!'
                ) {
                  await this.toasty.error(
                    this.translate.instant('Không đúng mã xác thực !')
                  );
                  return this.presentAlert();
                } else {
                  this.nav.setRoot(HomePage);
                  this.nav.setRoot(SettingsPage);
                }
              })
              .catch(() => {
                this.nav.setRoot(HomePage);
                this.nav.setRoot(SettingsPage);
              });
          },
        },
      ],
    });
    await alert.present();
  }

  scroll(el, isPass) {
    this.content.scrollTo(0, isPass ? el._elementRef.nativeElement.offsetTop + 100 : el._elementRef.nativeElement.offsetTop, 500);
  }

  async checkDuplicateMobile(phoneNumber) {
    if (phoneNumber !== '') {
      const hasNumber = /^[0][0-9]{9}$/.test(phoneNumber);
      const valid = hasNumber;
      if (!valid) {
        this.checkFirstLetterMobile = 'Số điện thoại bắt đầu là số 0';
      } else {
        this.checkFirstLetterMobile = '';
      }
    }
    const res = await this.account.checkDuplicateRegister(
      '',
      '',
      phoneNumber,
      'this.input.Email',
      ''
    );
    if (res.StatusCode != 200) {
      this.checkMobile = res.Message;
      this.submitted = false;
      if (this.translate.instant(res.Message) === 'Điện thoại đã tồn tại') {
        this.checkMobile = this.translate.instant(res.Message);
      }

      const alert = this.alertCtrl.create({
        cssClass: 'validate_checkDuplicate',
        title: '',
        subTitle: res.Message,
        buttons: ['Đóng'],
      });
      return alert.present();
    } else {
      this.checkMobile = '';
    }
  }

}
