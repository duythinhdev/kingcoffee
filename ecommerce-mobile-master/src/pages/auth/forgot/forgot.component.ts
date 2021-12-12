import { Component } from '@angular/core';
import { SystemService, ToastyService } from '../../../services';
import { NavController, NavParams } from 'ionic-angular';
import { SignupComponent } from '../signup/signup.component';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../../../services/account.service';
import { TabsService } from '../../../services/tabs.service';
import { isEmpty } from 'lodash';

@Component({
  selector: 'page-forgot',
  templateUrl: 'forgot.html',
})
export class ForgotComponent {
  info = {
    phone: '',
    otpCode1: '',
    otpCode2: '',
    otpCode3: '',
    otpCode4: '',
  };
  isButton = false;
  input = {
    password: '',
    rePassword: '',
  };
  submitted = false;
  signupPage = SignupComponent;
  loginPage = LoginComponent;
  logoUrl = '';
  inputOTP = false;
  isChange = false;
  password_type_1 = 'password';
  password_type_2 = 'password';
  eye_type_1 = 'eye-off';
  eye_type_2 = 'eye-off';
  intervalOTP;
  timeDown = 300;
  miniDown = 5;
  secondDown = 0;
  endTime = true;
  checkValid = true;

  constructor(
    private accountService: AccountService,
    private toasty: ToastyService,
    private tabsService: TabsService,
    private nav: NavController,
    private systemService: SystemService,
    private translate: TranslateService
  ) {
    this.systemService
      .configs()
      .then((res) => (this.logoUrl = res.siteLogo))
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  async forgot(frm) {
    this.submitted = true;
    this.isButton = true;
    if (isEmpty(this.info.phone)) {
      this.isButton = false;
      return this.toasty.error(
        this.translate.instant('Vui lòng nhập số điện thoại!')
      );
    }
    const res = (await this.accountService.forgot(this.info.phone));
    if (res.StatusCode !== 200) {
      this.isButton = false;
      this.inputOTP = false;
      return this.toasty.error(
        this.translate.instant(res.Message || 'Something went wrong!')
      );
    } else {
      this.isButton = false;
      this.inputOTP = true;
      clearInterval(this.intervalOTP);
      this.timeDown = 300;
      this.intervalOTP = setInterval(() => this.scountdownTime(), 1000);
      return this.toasty.success(
        this.translate.instant(
          `OTP đã được gửi, vui lòng kiểm tra điện thoại của bạn!`
        )
      );
    }
  }

  async confirmForgot() {
    this.isButton = true;
    if (this.endTime) {
      const otpCode = `${this.info.otpCode1}${this.info.otpCode2}${this.info.otpCode3}${this.info.otpCode4}`;
      const res = (await this.accountService.confirmOTPCode(
        otpCode,
        this.info.phone
      ));
      if (res.StatusCode !== 200) {
        this.isButton = false;
        return this.toasty.error(
          this.translate.instant(res.Message || 'Có lỗi xảy ra!')
        );
      } else {
        this.isButton = false;
        this.inputOTP = true;
        this.isChange = true;
      }
    } else {
      this.isButton = false;
      return this.toasty.error(
        'Mã OTP đã hêt hiệu lực, vui lòng nhấn gửi lại! '
      );
    }
  }

  backToPhone() {
    this.inputOTP = false;
  }

  goTo(type) {
    type === 'login'
      ? this.nav.setRoot(this.loginPage)
      : this.nav.setRoot(this.signupPage);
  }

  togglePasswordMode_1() {
    this.password_type_1 =
      this.password_type_1 === 'text' ? 'password' : 'text';
    this.password_type_1 === 'password'
      ? (this.eye_type_1 = 'eye-off')
      : (this.eye_type_1 = 'eye');
  }

  togglePasswordMode_2() {
    this.password_type_2 =
      this.password_type_2 === 'text' ? 'password' : 'text';
    this.password_type_2 === 'password'
      ? (this.eye_type_2 = 'eye-off')
      : (this.eye_type_2 = 'eye');
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

  async changePassword() {
    this.checkvalidPass();
    this.isButton = true;
    setTimeout(() => {
      this.isButton = false;
    }, 5000);
    if (this.checkValid) {
      const otpCode = `${this.info.otpCode1}${this.info.otpCode2}${this.info.otpCode3}${this.info.otpCode4}`;
      const res = (await this.accountService.changePassword(
        otpCode,
        this.info.phone,
        this.input.password,
        this.input.rePassword
      ));
      if (res.StatusCode !== 200) {
        this.isButton = false;
        await this.toasty.error('Cập nhật không thành công!');
        return this.nav.setRoot(this.loginPage);
      } else {
        await this.toasty.success('Cập nhật mật khẩu thành công!');
        this.isButton = false;
        return this.nav.setRoot(this.loginPage);
      }
    } else {
      return this.toasty.error(
        'Vui lòng nhập mật khẩu và xác nhận mật khẩu giống nhau!'
      );
    }
  }

  checkvalidPass() {
    if (this.input.password !== '') {
      const hasNumber = /\d/.test(this.input.password);
      const hasUpper = /[A-Z]/.test(this.input.password);
      const hasLower = /[a-z]/.test(this.input.password);
      const valid = hasNumber && hasUpper && hasLower;
      if (!valid || this.input.password.length < 8) {
        return (this.checkValid = false);
      } else {
        return (this.checkValid = true);
      }
    }
  }

  ionViewWillEnter() {
    setTimeout(() => {
      this.tabsService.hide();
    }, 0);
  }

  ionViewWillLeave() {
    setTimeout(() => {
      this.tabsService.show();
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

  kd_ChangeOTP(event, value){
    if((!(event.which >= 48 && event.which <= 57) || value.length >= 1) && event.which !== 13 && event.which !== 8){
      event.preventDefault();
    }
  }
}
