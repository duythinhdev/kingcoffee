import { Component, OnInit } from '@angular/core';
import { AuthService, LocationService } from '../../../services';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { SelectModel } from '../../../models/selectModel.model';
import { Province } from '../../../models/province.model';
import { District } from '../../../models/district.model';
import { Ward } from '../../../models/ward.model';
import { SignupComponent } from '../signup/signup.component';
import { InfomationService } from '../../../services/information.service';
import { AccountService } from '../../../services/account.service';
import { PopoversComponent } from '../popovers/popovers.component';
import { isNil, isEmpty } from 'lodash';

@Component({
  selector: 'page-account',
  templateUrl: 'account.component.html',
})
export class AccountComponent implements OnInit {
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
  knows = [
    {
      id: 1,
      name: 'Nhân viên TNI',
    },
    {
      id: 2,
      name: 'Hội phụ nữ',
    },
    {
      id: 3,
      name: 'Mạng xã hội',
    },
    {
      id: 4,
      name: 'Truyền thông',
    },
    {
      id: 5,
      name: 'Nguồn khác',
    },
  ];
  acedimiclevels = [
    {
      id: 1,
      name: '12/12',
    },
    {
      id: 2,
      name: 'Cao đẳng',
    },
    {
      id: 3,
      name: 'Cử nhân',
    },
    {
      id: 4,
      name: 'Kỹ sư',
    },
    {
      id: 5,
      name: 'Thạc sỹ',
    },
    {
      id: 6,
      name: 'Tiến sỹ',
    },
  ];
  temandConditional = '';
  dataInfo = {
    isWECF: false,
    isCompany: false,
  };
  submitted = false;
  loginPage = LoginComponent;
  authService;
  dialCodes = [];
  dialCode = '+84';
  selectOptions = {
    title: 'Chọn mã vùng',
    mode: 'md',
  };
  fromWardId = 0;
  fromDistrictId = 0;
  fromProvinceId = 0;
  banks;
  selected_DistrictId: SelectModel;
  selected_fromProvinceId: SelectModel;
  selected_wardId: SelectModel;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  isMarrie = true;
  isNotMarrie = false;
  isMan = true;
  isGirl = false;
  checkValid = true;
  checkMobile = true;
  checkEmail = true;
  password_type = 'password';
  eye_type = 'eye-off';
  referralCodeResponse;

  constructor(
    private auth: AuthService,
    private nav: NavController,
    public infoService: InfomationService,
    private navParams: NavParams,
    private translate: TranslateService,
    public locationService: LocationService,
    private accountService: AccountService,
    public alertCtrl: AlertController
  ) {
    this.input = this.navParams.data;
  }

  async ngOnInit() {
    this.dialCodes = this.auth.getDialCodes();
    await this.load_Province();
    await this.loadBanks();
  }

  async loadBanks() {
    this.banks = [];
    const res = await this.infoService.getListBank();
    if (res) {
      this.banks = res;
    }
    const default_bank = { Id: 0, Name: '----Chọn----' };
    this.banks.unshift(default_bank);
  }

  selectDial(event) {
    this.dialCode = event;
  }
  goTo(state) {
    localStorage.setItem('step3', JSON.stringify(this.input));
    if (state === 'signup') {
      return this.nav.setRoot(SignupComponent, this.input);
    }
    if (state === 'popovers') {
      return this.nav.setRoot(PopoversComponent, this.input);
    }
  }
  async submit() {
    this.submitted = true;
    await this.checkDuplicateMobile();
    if (
      this.input.Mobile === '' ||
      this.input.PassWord === '' ||
      this.input.ConfirmPassword !== this.input.PassWord ||
      this.checkValid === false ||
      this.checkMobile === false
    ) {
      this.submitted = false;
      return;
    } else {
      return this.goTo('popovers');
    }
  }
  async load_Province() {
    const res = await this.locationService.getListProvince();
    if (!isNil(res)) {
      this.provinces = res.data;
    }
  }

  async loadWard(districtId) {
    this.wards = [];
    this.selected_wardId = undefined;
    const res = await this.locationService.getListWard(districtId);
    if (res.data !== undefined) {
      this.wards = res.data;
      const find = this.districts.find((x) => (x.id = districtId));
      if (find) {
        this.selected_DistrictId = { id: find.id, name: find.Name };
      }
    }
  }

  // Receive
  async loadDistrict(provinceId) {
    this.districts = [];
    this.wards = [];
    this.selected_DistrictId = undefined;
    this.selected_wardId = undefined;
    const res = await this.locationService.getListDistrict(provinceId);
    if (res.data !== undefined) {
      this.districts = res.data;
      const find = this.provinces.find((x) => (x.id = provinceId));
      if (find) {
        this.selected_fromProvinceId = { id: find.id, name: find.Name };
      }
    }
  }

  async selectedWard(wardId) {
    const find = this.wards.find((x) => (x.id = wardId));
    if (find) {
      this.selected_wardId = { id: find.id, name: find.Name };
    }
  }

  checkvalidPass() {
    if (this.input.PassWord !== '') {
      const hasNumber = /\d/.test(this.input.PassWord);
      const hasUpper = /[A-Z]/.test(this.input.PassWord);
      const hasLower = /[a-z]/.test(this.input.PassWord);
      const valid = hasNumber && hasUpper && hasLower;
      if (!valid || this.input.PassWord.length < 8) {
        return (this.checkValid = false);
      } else {
        return (this.checkValid = true);
      }
    }
  }

  async checkDuplicateMobile() {
    const res = await this.accountService.checkDuplicateRegister(
      '',
      '',
      this.input.Mobile,
      this.input.Email,
      this.input.BankNumber
    );
    if (res.StatusCode !== 200) {
      this.submitted = false;
      if (this.translate.instant(res.Message) === 'Điện thoại đã tồn tại') {
        this.checkMobile = false;
      }
      if (this.translate.instant(res.Message) === 'Địa chỉ email đã tồn tại') {
        this.checkEmail = false;
      }

      const alert = this.alertCtrl.create({
        cssClass: 'validate_checkDuplicate',
        title: '',
        subTitle: res.Message,
        buttons: ['Đóng'],
      });
      return alert.present();
    } else {
      this.checkMobile = true;
      this.checkEmail = true;
    }
  }

  togglePasswordMode() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_type === 'password'
      ? (this.eye_type = 'eye-off')
      : (this.eye_type = 'eye');
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

      const step3 = localStorage.getItem('step3');
      if (!isNil(step3)) {
        this.input = JSON.parse(step3);
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
          fixedContent[key].style.marginBottom = '58px';
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

  async getReferralUser() {
    if (!isEmpty(this.input.CustomerNumberSponsor)) {
      this.referralCodeResponse = await this.auth.checkReferralUser(
        this.input.CustomerNumberSponsor
      );
      this.referralCodeResponse.StatusCode !== 200
        ? (this.submitted = true)
        : (this.submitted = false);
    }
  }

  changeEmail() {
    this.checkEmail = true;
  }

  changeMobile() {
    this.checkMobile = true;
  }
}
