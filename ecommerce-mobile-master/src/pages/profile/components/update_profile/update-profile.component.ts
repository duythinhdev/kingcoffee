import { Component, ViewChild } from '@angular/core';
import {
  ToastyService,
  ComplainService,
  LocationService,
  AuthService,
} from '../../../../services';
import { TabsService } from '../../../../services/tabs.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Province } from '../../../../models/province.model';
import { District } from '../../../../models/district.model';
import { Ward } from '../../../../models/ward.model';
import { SelectModel } from '../../../../models/selectModel.model';
import { isNil, isNull } from 'lodash';
import { AccountService } from '../../../../services/account.service';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { UpdateComponent } from '../update/update.component';

@Component({
  selector: 'update-profile',
  templateUrl: './update-profile.html',
})
export class UpdateProfileComponent {
  CompanyType;
  data_info = {
    socialInfo: {
      FullName: '',
      PhoneNumber: '',
      BirthDay: '',
      IdCard: '',
      Email: '',
      Sex: '',
      Married: '',
      Job: '',
      AcademiclevelEnum: '',
      ComingFromEnum: '',
      CityId: '',
      DistrictId: '',
      WardId: '',
      AddressDefault: '',
      CustomerNameSponsor: '',
      CompanyName: '',
      TaxCode: '',
      ReferralCode: '',
    },
  };
  updateProfilefileForm: FormGroup;
  checkT = true;
  checkCMND = true;
  selected_DistrictId: SelectModel;
  selected_fromProvinceId: SelectModel;
  selected_wardId: SelectModel;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
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
  @ViewChild('dateTime') sTime;
  constructor(
    private toasty: ToastyService,
    private tabsService: TabsService,
    private navParams: NavParams,
    public locationService: LocationService,
    private account: AccountService,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private auth: AuthService,
    private nav: NavController
  ) {
    this.data_info = this.navParams.data;
    if (
      this.data_info.socialInfo.CompanyName === '' ||
      this.data_info.socialInfo.TaxCode === '' || isNil(this.data_info.socialInfo.CompanyName) || isNil(this.data_info.socialInfo.TaxCode)
    ) {
      this.CompanyType = 2;
    } else {
      this.CompanyType = 1;
    }
    this.updateProfilefileForm = new FormGroup({
      CompanyName: new FormControl('', Validators.required),
      TaxCode: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]+-*'),
      ]),
      Name: new FormControl('', Validators.required),
      PhoneNumber: new FormControl(''),
      BirthDay: new FormControl('', Validators.required),
      BirthDayInput: new FormControl(''),
      CMND: new FormControl(''),
      Email: new FormControl('', Validators.email),
      Sex: new FormControl('', Validators.required),
      Married: new FormControl('', Validators.required),
      Job: new FormControl(''),
      AcademicLevel: new FormControl(''),
      KnowFrom: new FormControl(''),
      ReferralCode: new FormControl('', Validators.required),
      ProvinceId: new FormControl('', Validators.required),
      DistrictId: new FormControl('', Validators.required),
      WardId: new FormControl('', Validators.required),
      Address: new FormControl('', Validators.required),
      CustomerNameSponsor: new FormControl(''),
    });
  }
  async ngOnInit() {
    await this.load_Province();
    if (this.data_info.socialInfo) {
      if (!isNil(this.data_info.socialInfo.CityId)) {
        await this.loadDistrict(this.data_info.socialInfo.CityId);
        if (!isNil(this.data_info.socialInfo.DistrictId)) {
          await this.loadWard(this.data_info.socialInfo.DistrictId);
          if (!isNil(this.data_info.socialInfo.WardId)) {
            await this.selectedWard(this.data_info.socialInfo.WardId);
          }
        }
      }
      this.updateProfilefileForm
        .get('CompanyName')
        .setValue(this.data_info.socialInfo.CompanyName);
      this.updateProfilefileForm
        .get('TaxCode')
        .setValue(this.data_info.socialInfo.TaxCode);
      this.updateProfilefileForm
        .get('Name')
        .setValue(this.data_info.socialInfo.FullName);
      this.updateProfilefileForm
        .get('PhoneNumber')
        .setValue(this.data_info.socialInfo.PhoneNumber);
      this.updateProfilefileForm
        .get('BirthDay')
        .setValue(
         new Date(this.data_info.socialInfo.BirthDay).toJSON()
        );
      this.updateProfilefileForm
        .get('BirthDayInput')
        .setValue(
          moment(this.data_info.socialInfo.BirthDay)
            .local()
            .format('DD-MM-YYYY')
        );
      this.updateProfilefileForm
        .get('CMND')
        .setValue(this.data_info.socialInfo.IdCard);
      this.updateProfilefileForm
        .get('Email')
        .setValue(this.data_info.socialInfo.Email);
      this.updateProfilefileForm
        .get('Sex')
        .setValue(this.data_info.socialInfo.Sex);
      this.updateProfilefileForm
        .get('Married')
        .setValue(this.data_info.socialInfo.Married);
      this.updateProfilefileForm
        .get('Job')
        .setValue(this.data_info.socialInfo.Job);
      this.updateProfilefileForm
        .get('AcademicLevel')
        .setValue(this.data_info.socialInfo.AcademiclevelEnum);
      this.updateProfilefileForm
        .get('KnowFrom')
        .setValue(this.data_info.socialInfo.ComingFromEnum);
      this.updateProfilefileForm
        .get('ReferralCode')
        .setValue(this.data_info.socialInfo.ReferralCode);
      this.updateProfilefileForm
        .get('ProvinceId')
        .setValue(this.data_info.socialInfo.CityId);
      this.updateProfilefileForm
        .get('DistrictId')
        .setValue(this.data_info.socialInfo.DistrictId);
      this.updateProfilefileForm
        .get('WardId')
        .setValue(this.data_info.socialInfo.WardId);
      this.updateProfilefileForm
        .get('Address')
        .setValue(this.data_info.socialInfo.AddressDefault);
      this.updateProfilefileForm
        .get('CustomerNameSponsor')
        .setValue(this.data_info.socialInfo.CustomerNameSponsor);
    }
  }
  async updateProfile() {
    const formData = new FormData();
    formData.append(
      'CompanyName',
      this.updateProfilefileForm.value.CompanyName
        ? this.updateProfilefileForm.value.CompanyName
        : ''
    );
    formData.append(
      'TaxCode',
      this.updateProfilefileForm.value.TaxCode
        ? this.updateProfilefileForm.value.TaxCode
        : ''
    );
    formData.append('Name', this.updateProfilefileForm.value.Name);
    formData.append(
      'BirthDay', this.updateProfilefileForm.value.BirthDayInput
    );
    formData.append('CMND', this.updateProfilefileForm.value.CMND);
    formData.append('Email', this.updateProfilefileForm.value.Email);
    formData.append('Sex', this.updateProfilefileForm.value.Sex);
    formData.append(
      'isMarriage',
      this.updateProfilefileForm.value.Married
        ? this.updateProfilefileForm.value.Married
        : ''
    );
    formData.append('Job', this.updateProfilefileForm.value.Job);
    formData.append(
      'AcademicLevel',
      this.updateProfilefileForm.value.AcademicLevel
        ? this.updateProfilefileForm.value.AcademicLevel
        : ''
    );
    formData.append(
      'KnowFrom',
      this.updateProfilefileForm.value.KnowFrom
        ? this.updateProfilefileForm.value.KnowFrom
        : ''
    );
    formData.append(
      'ReferralCode',
      this.updateProfilefileForm.value.ReferralCode
    );
    formData.append('ProvinceId', this.updateProfilefileForm.value.ProvinceId);
    formData.append('DistrictId', this.updateProfilefileForm.value.DistrictId);
    formData.append('WardId', this.updateProfilefileForm.value.WardId);
    formData.append('CompanyType', this.CompanyType);
    formData.append('Address', this.updateProfilefileForm.value.Address);
    if (!this.checkT) {
      return this.toasty.error(
        this.translate.instant(
          'Thông tin nhập không chính xác, vui lòng kiểm tra lại'
        )
      );
    } else {
      if (
        this.updateProfilefileForm.value.CMND !==
        this.data_info.socialInfo.IdCard
      ) {
        await this.checkDuplicateCMND();
        if(this.checkCMND) {
          await this.auth
          .UpdateProfile(formData)
          .then((res: { StatusCode: number; Message: string }) => {
            if (res) {
              if (res.StatusCode === 200) {
                this.toasty.success('Cập nhật thông tin tài khoản thành công!');
                return this.nav.push(UpdateComponent);
              }
              if (res.StatusCode === 400) {
                if (
                  res.Message ===
                  'Full name must have a minimum length of 5 characters'
                ) {
                  return this.toasty.error(
                    this.translate.instant(
                      'Họ và tên phải có ít nhất 5 ký tự !'
                    )
                  );
                }
                if (res.Message === 'Referrals TNI Code is required!') {
                  return this.toasty.error(
                    this.translate.instant('Vui lòng nhập mã nhân viên TNI')
                  );
                }
              }
            }
          });
        }
      } else {
        await this.auth
          .UpdateProfile(formData)
          .then((res: { StatusCode: number; Message: string }) => {
            if (res) {
              if (res.StatusCode === 200) {
                this.toasty.success('Cập nhật thông tin tài khoản thành công!');
                return this.nav.push(UpdateComponent);
              }
              if (res.StatusCode === 400) {
                if (
                  res.Message ===
                  'Full name must have a minimum length of 5 characters'
                ) {
                  return this.toasty.error(
                    this.translate.instant(
                      'Họ và tên phải có ít nhất 5 ký tự !'
                    )
                  );
                }
                if (res.Message === 'Referrals TNI Code is required!') {
                  return this.toasty.error(
                    this.translate.instant('Vui lòng nhập mã nhân viên TNI')
                  );
                }
              }
            }
          });
      }
    }
  }
  async load_Province() {
    const res = await this.locationService.getListProvince();
    !isNil(res) ? (this.provinces = res.data) : (this.provinces = []);
  }
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
  async selectedWard(wardId) {
    const find = this.wards.find((x) => (x.id = wardId));
    if (find) {
      this.selected_wardId = { id: find.id, name: find.Name };
    }
  }
  openBirthday() {
    return this.sTime.open();
  }
  checkOld() {
    const today = new Date();
    const birthDateString = this.updateProfilefileForm.get('BirthDay').value;
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.updateProfilefileForm
      .get('BirthDayInput')
      .setValue(moment(new Date(this.updateProfilefileForm.value.BirthDay)).format(
        'DD-MM-YYYY'
      ));
    return age >= 18 ? (this.checkT = true) : (this.checkT = false);
  }

  async checkDuplicateCMND() {
    const res = await this.account.checkDuplicateRegister(
      '',
      this.updateProfilefileForm.get('CMND').value,
      ''
    );
    if (res.StatusCode !== 200) {
      this.checkCMND = false;
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
  ionViewWillEnter() {
    setTimeout(() => {
      this.tabsService.hide();
    }, 0);
  }
}
