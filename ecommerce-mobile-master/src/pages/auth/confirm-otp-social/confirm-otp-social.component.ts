import { Component, OnInit } from '@angular/core';
import { ToastyService, AuthService } from '../../../services';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../../services/account.service';
import { AccountComponent } from '../account/account.component';
import { SurveyComponent } from '../survey/survey.component';
import { isNil } from 'lodash';
import { SignupComponent } from '../signup/signup.component';
import { InfomationService } from '../../../services/information.service';
import { LoginComponent } from '../login/login.component';
import { Device } from '@ionic-native/device';
import { SignupWeFreeComponent } from '../signup_wefree/signup_wefree.component';
import { FCM } from '@ionic-native/fcm';
import { isEmpty } from 'lodash';
import { HomePage } from '../../home/home';
import { SettingsPage } from '../../settings/settings';
import { SpinLuckyPage } from '../../spin-lucky/spin-lucky';
/**
 * Generated class for the ConfirmOtpSocialComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'confirm-otp-social',
  templateUrl: 'confirm-otp-social.component.html'
})
export class ConfirmOtpSocialComponent implements OnInit {
  deviceId;
  inputUpdatePhone;
  inputUpdateEmail;
  input = {
    BusinessForm: [
      {
        Name: 1,
        Value: 1,
      },
      {
        Name: 2,
        Value: 1,
      },
    ],
    CompanyType: '',
    CompanyName: '',
    Name: '',
    Birthday: Date.now(),
    CMND: '',
    Job: '',
    Acedimiclevel: 1,
    TaxCode: '',
    ProvinceId: 1,
    DistrictId: 1,
    WardId: 1,
    Address: '',
    Landline: '',
    Sex: 1,
    isMarriage: 1,
    Mobile: '',
    PassWord: '',
    ConfirmPassword: '',
    Email: '',
    BankId: 0,
    BankBranchName: '',
    BankNumber: '',
    BankHoldername: '',
    Sponsor: '',
    KnowFrom: 1,
    CustomerNumberSponsor: '',
  };
  submitted = false;
  hour_input = Date.now();
  intervalOTP;
  timeDown = 5 * 60;
  info = {
    otpCode1: '',
    otpCode2: '',
    otpCode3: '',
    otpCode4: '',
  };
  miniDown = 5;
  secondDown = 0;
  endTime = true;
  countCallOTP: number;
  timeCallOTP: number;
  isReturn = false;
  isSuccess = false;
  bankinfo = {
    BankName: "Viettel",
    BankBranchName: "TP.HCM",
    BankNumber: "1234 1234 1234 1234",
    AccountHolder: "Tran van a",
    Description: "Chỉ với 500,000đ bạn đã sở hữu những chính sách\r\n\r\nưu đãi đặc biệt từ KING COFFEE"
  }

  constructor(
    private account: AccountService,
    private nav: NavController,
    private navParams: NavParams,
    private toasty: ToastyService,
    private translate: TranslateService,
    private infoService: InfomationService,
    private device: Device,
    private platform: Platform,
    private fcm: FCM,
    private auth: AuthService,
  ) {

    if (this.navParams.data.phone_number) {
      this.input.Mobile = this.navParams.data.phone_number;
      this.inputUpdatePhone = this.navParams.data.phone_number;
    }
    if (this.navParams.data.email) {
      this.inputUpdateEmail = this.navParams.data.email;
    }

    if (!this.device.uuid) {
      this.deviceId = 'd8da544894e56aea';
    }
    else {
      this.deviceId = this.device.uuid
    }

  }
  async ngOnInit() {
    this.countCallOTP = 0;
    this.timeCallOTP = Date.now();
    if (!this.input.Mobile) {
      await this.auth.me().then(async (res) => {
        if (!isNil(res.data)) {
          this.input.Mobile = res.data.phoneNumber;
        }
      })
    }
    await this.getOTP();
  }
  async getOTP() {
    const day = (Date.now() - this.timeCallOTP) / 60000;
    if (this.countCallOTP >= 5 && day < 2) {
      return this.toasty.error('Vui lòng thử lại sau 2 phút!');
    } else {
      if (day > 2) {
        this.countCallOTP = 0;
        this.timeCallOTP = Date.now();
      }
      const res = (await this.account.getOTP(this.input.Mobile));
      if (res.StatusCode === 200) {
        clearInterval(this.intervalOTP);
        this.timeDown = 300;
        this.countCallOTP++;
        this.intervalOTP = setInterval(() => this.scountdownTime(), 1000);
      }
    }
  }
  scountdownTime() {
    this.miniDown = Math.floor(this.timeDown / 60);
    this.secondDown = this.timeDown % 60;
    this.timeDown = this.timeDown - 1;
    if (this.timeDown === 0) {
      this.endTime = false;
      clearInterval(this.intervalOTP);
    } else {
      this.endTime = true;
    }
  }

  goTo(state) {
    if (state === 'signup') {
      this.submitted = true;
      state === 'login' ? this.nav.setRoot(LoginComponent) : this.nav.setRoot(LoginComponent);
    }
    if (state === 'login') {
      this.submitted = true;
      state === 'login' ? this.nav.setRoot(LoginComponent) : this.nav.setRoot(LoginComponent);
    }
    if (state === 'survey') {
      return this.nav.setRoot(SurveyComponent, this.input);
    }
    if (state === 'signup_wefree') {
      return this.nav.setRoot(SignupWeFreeComponent, this.input);
    }
  }

  async confirmOTP(code) {
    this.submitted = true;
    const otpCode = `${code.otpCode1}${code.otpCode2}${code.otpCode3}${code.otpCode4}`;
    if (isNil(this.timeDown)) {
      this.submitted = false;
      return this.toasty.error(
        'Mã OTP đã hết hiệu lực. Vui lòng nhấn gửi lại mã OTP!'
      );
    } else {
      const res = (await this.account.confirmOTPRegister(
        otpCode,
        this.input.Mobile
      ));
      if (res.StatusCode !== 200) {
        this.submitted = false;
        return this.toasty.error(
          this.translate.instant(res.Message || 'Something went wrong.')
        );
      } else {
        let json = {};
        if (this.inputUpdateEmail && this.inputUpdatePhone) {
          json = {
            "email": this.inputUpdateEmail,
            "phone_number": this.inputUpdatePhone,
          }
        }
        else if (this.inputUpdateEmail) {
          json = {
            "email": this.inputUpdateEmail,
          }
        }
        else if (this.inputUpdatePhone) {
          json = {
            "phone_number": this.inputUpdatePhone,
          }
        }
        await this.toasty.success('Xác thực OTP thành công');
        await this.auth.updateProfile(json);
        this.loginSuccessHandle();
      }
    }
  }
  async getBankInfo() {
    const res = await this.infoService.getBankInfo();
    if (res) {
      this.bankinfo = res;
    }
  }
  ionViewWillEnter() {
    setTimeout(() => {
      const tabs = document.querySelectorAll('.tabbar.show-tabbar');
      const fixedContent = document.querySelectorAll('.fixed-content');
      const scrollContent = document.querySelectorAll('.scroll-content');
      const footer = document.querySelectorAll('.footer_logo');
      if (tabs !== null) {
        Object.keys(tabs).map((key) => {
          tabs[key].style.transform = 'translate3d(0, 200px, 0)';
        });
      }
      if (fixedContent !== null) {
        Object.keys(fixedContent).map((key) => {
          fixedContent[key].style.marginBottom = '0px';
        });
      }
      if (scrollContent !== null) {
        Object.keys(scrollContent).map((key) => {
          scrollContent[key].style.marginBottom = '0px';
        });
      }
      if (footer !== null) {
        Object.keys(footer).map((key) => {
          footer[key].style.transform = 'translate3d(0, 200px, 0)';
        });
      }
    }, 0);
  }

  ionViewWillLeave() {
    setTimeout(() => {
      const tabs = document.querySelectorAll('.tabbar.show-tabbar');
      const fixedContent = document.querySelectorAll('.fixed-content');
      const scrollContent = document.querySelectorAll('.scroll-content');
      const footer = document.querySelectorAll('.footer_logo');
      if (tabs !== null) {
        Object.keys(tabs).map((key) => {
          tabs[key].style.transform = 'translate3d(0, 0, 0)';
        });
      }
      if (fixedContent !== null) {
        Object.keys(fixedContent).map((key) => {
          fixedContent[key].style.marginBottom = '56px';
        });
      }
      if (scrollContent !== null) {
        Object.keys(scrollContent).map((key) => {
          scrollContent[key].style.marginBottom = '56px';
        });
      }
      if (footer !== null) {
        Object.keys(footer).map((key) => {
          footer[key].style.transform = 'translate3d(0, 0, 0)';
        });
      }
    }, 0);
  }

  changeOTP(event, pre, next) {
    if (event.which === 8) {
      if (pre) {
        const element = pre._elementRef.nativeElement.querySelector('input');
        setTimeout(() => {
          element.focus();
        }, 0);
      }
    } else if (event.which !== 13 && event.which >= 48 && event.which <= 57 && next) {
      const element = next._elementRef.nativeElement.querySelector('input');
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  }

  kd_ChangeOTP(event, value) {
    if ((!(event.which >= 48 && event.which <= 57) || value.length >= 1) && event.which !== 13 && event.which !== 8) {
      event.preventDefault();
    }
  }
  async loginSuccessHandle() {
    const sendData = {
      popup: true
    }


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
  async getTokenDeviceFCM() {
    try {
      const tokenDevice = this.fcm.getToken();
      return tokenDevice;
    } catch (error) {
      await this.toasty.error(this.translate.instant(error));
      return "";
    }
  }
}
