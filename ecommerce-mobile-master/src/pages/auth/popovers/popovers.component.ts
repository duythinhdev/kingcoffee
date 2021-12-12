import { Component } from '@angular/core';
import { SystemService, ToastyService } from '../../../services';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AccountComponent } from '../account/account.component';
import { AccountService } from '../../../services/account.service';
import { ConfirmOTPComponent } from '../confirmOTP/confirmOTP.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'page-popovers',
  templateUrl: 'popovers.component.html',
})
export class PopoversComponent {
  credentials = {
    username: '',
    password: '',
    twoFaCode: '',
  };
  submitted = false;
  logoUrl = '';
  password_type = 'password';
  eye_type = 'eye-off';
  term : SafeHtml;
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
    ReferralCode: '',
    CustomerNumberSponsor: '',
  };
  constructor(
    private nav: NavController,
    private account: AccountService,
    private translate: TranslateService,
    private navParams: NavParams,
    private toasty: ToastyService,
    private systemService: SystemService,
    private sanitizer: DomSanitizer
  ) {
    this.input = this.navParams.data;
    this.systemService
      .configs()
      .then((res) => (this.logoUrl = res.siteLogo))
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
    this.getTerm().catch((err) => {
      return this.toasty.error(
        this.translate.instant(err.message || 'Something went wrong!')
      );
    });
  }

  async getTerm() {
    const res = await this.account.getTermAndCondition();
    if (res) {
      
      this.term = this.sanitizer.bypassSecurityTrustHtml(res);
    }
  }

  goTo(state) {
    if (state === 'signup') {
      return this.nav.setRoot(SignupComponent);
    }
    if (state === 'confirmOTP') {
      return this.nav.setRoot(ConfirmOTPComponent, this.input);
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
}
