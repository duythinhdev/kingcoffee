import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
import {
  AuthService,
  SystemService,
  ToastyService,
} from '../../../../services';
import { AccountService } from '../../../../services/account.service';
import { UpdateComponent } from '../update/update.component';

@Component({
  selector: 'change-password',
  templateUrl: './changePassword.html',
})
export class ChangePasswordComponent implements OnInit {
  info = {
    Id: '',
    oldPassword: '',
  };
  input = {
    Id: '',
    oldPassword: '',
    password: '',
    rePassword: '',
  };
  submitted = false;
  logoUrl = '';
  inputOTP = false;
  isChange = false;
  password_type_1 = 'password';
  password_type_2 = 'password';
  password_type_3 = 'password';
  eye_type_1 = 'eye-off';
  eye_type_2 = 'eye-off';
  eye_type_3 = 'eye-off';
  timeDown = 300;
  miniDown = 5;
  secondDown = 0;
  endTime = true;
  checkValid = true;
  user_social;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private toasty: ToastyService,
    private nav: NavController,
    private systemService: SystemService,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    await this.systemService
      .configs()
      .then((res) => (this.logoUrl = res.siteLogo));
    await this.load_User_Social();
  }

  goTo(type) {
    type === 'update'
      ? this.nav.setRoot(UpdateComponent)
      : this.nav.setRoot(UpdateComponent);
  }

  async load_User_Social() {
    await this.authService.me_social().then((resp) => {
      this.user_social = resp.data;
    });
    if (this.user_social !== undefined) {
      this.input.Id = this.user_social.socialInfo.UserId;
    }
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

  togglePasswordMode_3() {
    this.password_type_3 =
      this.password_type_3 === 'text' ? 'password' : 'text';
    this.password_type_3 === 'password'
      ? (this.eye_type_3 = 'eye-off')
      : (this.eye_type_3 = 'eye');
  }

  async changePassword() {
    const res = (await this.accountService.updatePassword(
      this.input.Id,
      this.input.oldPassword,
      this.input.password,
      this.input.rePassword
    ));
    if (res.StatusCode !== 200) {
      return this.toasty.error(this.translate.instant(res.Message || 'Cập nhật không thành công!'));
    } else {
      await this.toasty.success('Cập nhật mật khẩu thành công.');
      return this.goTo('update');
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
}
