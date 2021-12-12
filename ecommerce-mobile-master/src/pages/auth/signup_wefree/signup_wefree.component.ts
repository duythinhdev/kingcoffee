import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, LocationService, ToastyService } from '../../../services';
import { AlertController, Content, NavController, NavParams } from 'ionic-angular';
import { LoginComponent } from '../login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { RegisterComponent } from '../register/register.component';
import { SelectModel } from '../../../models/selectModel.model';
import { Province } from '../../../models/province.model';
import { District } from '../../../models/district.model';
import { Ward } from '../../../models/ward.model';
import { AccountComponent } from '../account/account.component';
import { AccountService } from '../../../services/account.service';
import { TabsService } from '../../../services/tabs.service';
import { isNil, isEmpty } from 'lodash';
import { PopoversComponent } from '../popovers/popovers.component';
import { Keyboard } from '@ionic-native/keyboard';
import { ConfirmOTPComponent } from '../confirmOTP/confirmOTP.component';
@Component({
  selector: 'page-signup',
  templateUrl: 'signup_wefree.component.html',
})
export class SignupWeFreeComponent implements OnInit {
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
    CompanyType: 0,
    CompanyName: '',
    Name: '',
    Birthday: '',
    CMND: '',
    Job: '',
    Acedimiclevel: '',
    TaxCode: '',
    ProvinceId: '',
    DistrictId: '',
    WardId: '',
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
    KnowFrom: 0,
    ReferralCode: '',
    CustomerNumberSponsor: '',
    sex: 0,
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
  dataInfo = {
    isWECF: false,
    isCompany: 0,
  };
  submitted = false;
  checkMobile = '';
  checkFirstLetterMobile = '';
  password_type = 'password';
  eye_type = 'eye-off';
  referralCodeResponse;
  loginPage = LoginComponent;
  dialCodes = [];
  dialCode = '+84';
  selectOptions = {
    title: 'Chọn mã vùng',
    mode: 'md',
  };
  fromWardId = 0;
  fromDistrictId = 0;
  fromProvinceId = 0;
  selected_DistrictId: SelectModel;
  selected_fromProvinceId: SelectModel;
  selected_wardId: SelectModel;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  isMarry = '1';
  isMarrie = true;
  isNotMarrie = false;
  isSex = '1';
  isMan = true;
  isGirl = false;
  checkT = true;
  checkCMND = true;
  checkTaxCode = true;
  checkFormTaxcode = true;
  checkValid = true;
  checkValidPass = true;
  @ViewChild(Content) content: Content;

  constructor(
    private auth: AuthService,
    private account: AccountService,
    private nav: NavController,
    private navParams: NavParams,
    private toasty: ToastyService,
    private translate: TranslateService,
    private tabsService: TabsService,
    public locationService: LocationService,
    private alertCtrl: AlertController,
    private keyboard: Keyboard
  ) {
    this.keyboard.disableScroll(true);
    this.dataInfo = this.navParams.data;
  }

  async ngOnInit() {
    // if (this.navParams.data.ref) {
    //   this.input.CustomerNumberSponsor = this.navParams.data.ref
    // }
    // this.dialCodes = this.auth.getDialCodes();
    const step1 = localStorage.getItem('step1');
    if (!isNil(step1)) {
      this.dataInfo.isCompany = JSON.parse(step1).isCompany;
    }
    const step2 = localStorage.getItem('step2');
    if (!isNil(step2)) {
      this.input = JSON.parse(step2);
      this.isSex = `${this.input.sex}`;
    }

    // await this.load_Province();
    // if (this.input.ProvinceId) {
    //   await this.loadDistrict(this.input.ProvinceId);
    // }

    // if (this.input.DistrictId) {
    //   await this.loadWard(this.input.DistrictId)
    // }

    await this.getReferralUser();

    this.loadBussinesForm();
  }

  loadBussinesForm() {
    this.dataInfo.isWECF
      ? (this.input.BusinessForm = [
        { Name: 1, Value: 1 },
        { Name: 2, Value: 1 },
      ])
      : (this.input.BusinessForm = [
        { Name: 1, Value: 1 },
        { Name: 2, Value: 0 },
      ]);

    this.input.CompanyType = this.dataInfo.isCompany;
    if (!this.input.CompanyType) {
      this.input.CompanyName = '';
    }
  }

  selectDial(event) {
    this.dialCode = event;
  }

  goTo(state) {
    localStorage.setItem('step2', JSON.stringify(this.input));

    if (state === 'register') {
      return this.nav.setRoot(RegisterComponent);
    }

    if (state === 'popovers') {
      return this.nav.setRoot(PopoversComponent, this.input);
    }
  }

  async submit(frm) {
    this.submitted = true;
    if (
      (frm.invalid)
    ) {
      this.submitted = false;
      return this.toasty.error(
        this.translate.instant(
          'Thông tin nhập không chính xác, vui lòng kiểm tra lại'
        )
      );
    }
    else if (!this.checkValidSignup()) {
      this.submitted = false;
      return this.toasty.error(
        this.translate.instant(
          'Thông tin nhập không chính xác, vui lòng kiểm tra lại'
        )
      );
    } else {
      if (this.checkTaxCode) {
        await this.checkDuplicateMobile();
        if (this.checkMobile === '' && this.checkFirstLetterMobile === '') {
          return this.nav.setRoot(ConfirmOTPComponent, this.input);
        }

      }
    }
  }

  async load_Province() {
    const res = await this.locationService.getListProvince();
    !isNil(res) ? (this.provinces = res.data) : (this.provinces = []);
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

  changeSex() {
    if (this.isSex === '1') {
      this.input.sex = 1;
    } else if (this.isSex === '0') {
      this.input.sex = 0;
    }
  }

  changeMarry() {
    if (this.isMarry === '1') {
      this.input.isMarriage = 1;
    } else if (this.isMarry === '0') {
      this.input.isMarriage = 0;
    }
  }
  async checkDuplicateCMND() {
    const res = await this.account.checkDuplicateRegister(
      '',
      this.input.CMND,
      ''
    );
    if (res.StatusCode !== 200) {
      this.checkCMND = false;
      this.submitted = false;
      const alert = this.alertCtrl.create({
        title: '',
        subTitle: 'CMND/Hộ chiếu đã tồn tại.',
        buttons: ['Đóng'],
      });
      return alert.present();
    } else {
      this.checkCMND = true;
    }
  }
  async checkDuplicateMobile() {
    if (this.input.Mobile !== '') {
      const hasNumber = /^[0][0-9]{9}$/.test(this.input.Mobile);
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
      this.input.Mobile,
      this.input.Email,
      this.input.BankNumber
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
  togglePasswordMode() {
    this.password_type = this.password_type === 'text' ? 'password' : 'text';
    this.password_type === 'password'
      ? (this.eye_type = 'eye-off')
      : (this.eye_type = 'eye');
  }
  async checkDuplicateTaxcode() {
    const res = await this.account.checkDuplicateRegister(
      this.input.TaxCode,
      '',
      ''
    );
    if (res.StatusCode !== 200) {
      this.checkTaxCode = false;
      this.submitted = false;
      const alert = this.alertCtrl.create({
        title: '',
        subTitle: 'Mã số thuế đã tồn tại.',
        buttons: ['Đóng'],
      });
      return alert.present();
    } else {
      this.checkTaxCode = true;
    }
  }

  checkOld() {
    const today = new Date();
    const birthDate = new Date(this.input.Birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18 ? (this.checkT = true) : (this.checkT = false);
  }

  checkTaxcode() {
    const s = this.input.TaxCode;
    s.length - s.replace(/-/g, '').length !== 1
      ? (this.checkFormTaxcode = false)
      : (this.checkFormTaxcode = true);
  }

  checkValidSignup() {
    if (this.input.Name === '') {
      return false;
    }
    if (this.input.Mobile === '') {
      return false;
    }
    if (this.input.Email === '') {
      return false;
    }
    if (this.input.ConfirmPassword === '') {
      return false;
    }
    if (this.input.PassWord != this.input.ConfirmPassword) {
      return false;
    }
    if (!this.checkValidPass) {
      return false
    }
    return true;
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

  async getReferralUser() {
    if (this.input.CustomerNumberSponsor && this.input.CustomerNumberSponsor != "") {
      this.referralCodeResponse = await this.auth.checkReferralUser(
        this.input.CustomerNumberSponsor
      );
      this.referralCodeResponse.StatusCode !== 200
        ? (this.submitted = true)
        : (this.submitted = false);
    } else {
      this.referralCodeResponse = null;
      this.submitted = false
    }
  }

  checkvalidTax() {
    if (this.input.TaxCode !== '') {
      const hasNumber = /^([0-9])[0-9]*[\-]?[0-9]*[0-9]$/.test(
        this.input.TaxCode
      );
      const valid = hasNumber;
      if (!valid) {
        return (this.checkValid = false);
      } else {
        return (this.checkValid = true);
      }
    }
  }
  checkvalidPass() {
    if (this.input.PassWord !== '') {
      const hasNumber = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,32}$/.test(
        this.input.PassWord
      );
      const valid = hasNumber;
      if (!valid) {
        return (this.checkValidPass = false);
      } else {
        return (this.checkValidPass = true);
      }
    }
  }
  onchangeMobile() {
    this.checkMobile = '';
    this.checkFirstLetterMobile = '';
  }

  scroll(el) {
    this.content.scrollTo(0, el._elementRef.nativeElement.offsetTop, 500);
  }
}
