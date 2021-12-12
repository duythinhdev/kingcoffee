import { Component, OnInit } from '@angular/core';
import { AuthService, ToastyService } from '../../../services';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { SignupComponent } from '../signup/signup.component';
import { AccountService } from '../../../services/account.service';
import { SettingsPage } from '../../settings/settings';
import { isNil } from 'lodash';
import { SignupWeFreeComponent } from '../signup_wefree/signup_wefree.component';

@Component({
  selector: 'page-register',
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit {
  account = {
    email: '',
    password: '',
    phoneNumber: '',
    name: '',
  };
  info = {
    isWECF: false,
    isCompany: 1,
    ref:''
  };
  input = {
    ischeck_WE: false,
    ischeck_WECF: false,
    ischeck_WEConsumer: false,
    companyType: 0,
  };

  submitted = false;
  loginPage = LoginComponent;
  authService;
  dialCodes = [];
  dialCode = '+84';
  selectOptions = {
    mode: 'md',
  };
  isNew = true;

  constructor(
    private auth: AuthService,
    private nav: NavController,
    private navParams: NavParams,
    private toasty: ToastyService,
    private translate: TranslateService,
    public alertCtr: AlertController,
    private accountService: AccountService
  ) {
    this.isNew = this.navParams.data;
  }

  async ngOnInit() {
    this.dialCodes = this.auth.getDialCodes();
    let ref = this.navParams.get('ref');
    if(ref){
      this.info.ref = ref;
    }
  }

  goTo(state) {
    localStorage.removeItem('step1');
    if (state === 'login') {
      return this.nav.setRoot(LoginComponent, this.input);
    }
  }

  selectDial(event) {
    this.dialCode = event;
  }

  nextStep() {
    if(this.input.ischeck_WEConsumer){
      this.info.isCompany = 2;
      localStorage.setItem('step1', JSON.stringify(this.info));
      return this.nav.setRoot(SignupWeFreeComponent, this.info);
    }
    else{
      if (!this.input.ischeck_WE && !this.input.ischeck_WECF) {
        return this.toasty.error('Vui lòng bấm chọn hình thức kinh doanh!');
      } else {
        if (this.input.ischeck_WECF && !this.input.ischeck_WE) {
          return this.toasty.error(
            'Vui lòng bấm chọn cả hai WE và WE HOME nếu bạn chọn WE HOME!'
          );
        }
      }
      this.info.isWECF = this.input.ischeck_WECF;
      this.info.isCompany = this.input.companyType;
      localStorage.setItem('step1', JSON.stringify(this.info));
      return this.nav.setRoot(SignupComponent, this.info);
    }
   
  }

  selectWEHOME() {
    if (this.input.ischeck_WECF) {
      this.input.ischeck_WE = true;
      this.input.ischeck_WEConsumer = false;
    }
  }

  selectWE() {
    if (!this.input.ischeck_WE) {
      this.input.ischeck_WECF = false;
    }
    else{
      this.input.ischeck_WEConsumer = false;
    }
    
    
  }
  selectWEconsumer() {
    if (this.input.ischeck_WEConsumer) {
      this.input.ischeck_WE = false;
      this.input.ischeck_WECF = false;
    }
  }

  async changeRole() {
    if (isNil(this.input.ischeck_WECF)) {
      return this.toasty.error('Vui lòng chọn WE HOME!');
    } else {
      const res = (await this.auth.changeRoleToWeHome()) as { StatusCode: number, Message: string };
      if (res.StatusCode === 200) {
        const alert = this.alertCtr.create({
          title: '',
          subTitle:
            'Xin chúc mừng! Yêu cầu đăng ký trở thành Đại lý của bạn đã được chấp nhận',
          buttons: ['Đóng'],
        });
        await alert.present();
        return this.nav.setRoot(SettingsPage, true);
      } else {
        return this.toasty.error(res.Message);
      }
    }
  }
}
