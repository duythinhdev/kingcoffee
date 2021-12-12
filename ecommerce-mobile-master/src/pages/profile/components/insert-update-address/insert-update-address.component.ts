import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import {
  ToastyService,
  ContactService,
  AuthService,
  LocationService,
} from '../../../../services';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { AddressComponent } from '../../../../pages/profile/components/address/address.component';
import {
  NavController,
  ViewController,
  NavParams,
  Loading,
} from 'ionic-angular';
import { Province } from '../../../../models/province.model';
import { District } from '../../../../models/district.model';
import { Ward } from '../../../../models/ward.model';
import { SelectModel } from '../../../../models/selectModel.model';
import { LocalStorgeService } from '../../../../services/local-storge.service';
import { TabsService } from '../../../../services/tabs.service';
import { isNil } from 'lodash';
@Component({
  selector: 'insert-update-address',
  templateUrl: 'insert-update-address.html',
})
export class InsertUpdateAddressComponent implements OnInit {
  @Output() selectCode = new EventEmitter();
  loading: Loading;
  dialCodes = [];
  stripeTest: FormGroup;
  text: string;
  isSubmitted = false;
  isLoading = true;
  phoneNumber = {
    number: '',
  };
  dialCode = '+84';
  firstNameText;
  lastNameText;
  phoneNumberText;
  cityText;
  stateText;
  districtText;
  zipCodeText;
  shippingAddressText;
  isdefaultchk;
  addressId;
  dataAddress;
  Title;
  getDialPhoneNumber: string;
  getPhoneNumber;
  getDial;
  getstring2;
  splitDialPhoneNumber;
  splitDial;
  dialCodeText;
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  selected_Zipcode: string;
  fromWardId = 0;
  fromDistrictId = 0;
  fromProvinceId = 0;
  selected_DistrictId: SelectModel;
  selected_fromProvinceId: SelectModel;
  selected_wardId: SelectModel;
  flagchange = '';
  dataInfo = {
    products: [],
    shipmentTypeId: 1,
    toHubId: 3,
    shippingPrice: 0,
    percentDiscount: 0.07,
    transportation: {
      id: 6,
      name: 'Giao Hàng Nhanh',
    },
    paymentMethod: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    streetAddress: '',
    city: {
      id: '',
      name: '',
    },
    district: {
      id: '',
      name: '',
    },
    ward: {
      id: '',
      name: '',
    },
    zipCode: '70000',
    returnUrl: '',
  };

  constructor(
    private toasty: ToastyService,
    private translate: TranslateService,
    private localStore: LocalStorgeService,
    private contactService: ContactService,
    private nav: NavController,
    public locationService: LocationService,
    private tabsService: TabsService,
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private authService: AuthService
  ) {
    this.dialCodes = this.authService.getDialCodes();
    this.flagchange = localStorage.getItem('flagchange');
    this.dataInfo = this.navParams.data;
  }

  async ngOnInit() {
    await this.load_Province();
    this.isLoading = false;
    this.addressId = this.navParams.get('itemId');
    if (!isNil(this.addressId)) {
      await this.contactService.findOneAddress(this.addressId).then((res) => {
        this.firstNameText = res.data.firstName;
        this.lastNameText = res.data.lastName;
        this.phoneNumberText = res.data.phoneNumber;
        this.shippingAddressText = res.data.address;
        this.fromProvinceId = res.data.city.id;
        this.fromDistrictId = res.data.district.id;
        this.fromWardId = res.data.ward.id;
        this.zipCodeText = res.data.zipCode;
        this.isdefaultchk = res.data.default;
      });
      await this.loadDistrict(this.fromProvinceId);
      await this.loadWard(this.fromDistrictId);
      await this.selectedWard(this.fromWardId);
    } else {
      this.dialCodeText = '+84';
    }

    !isNil(this.addressId)
      ? (this.Title = this.translate.instant('Update address'))
      : (this.Title = this.translate.instant('Add new address'));
  }

  async load_Province() {
    const res = await this.locationService.getListProvince();
    res ? (this.provinces = res.data) : (this.provinces = []);
  }

  async loadWard(districtId) {
    this.wards = [];
    this.selected_wardId = undefined;
    const res = await this.locationService.getListWard(districtId);
    if (res.data !== undefined) {
      this.wards = res.data;
      const find = this.districts.find((x) => x.Id === districtId);
      if (find) {
        this.selected_DistrictId = { id: find.Id, name: find.Name };
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
      const find = this.provinces.find((x) => x.Id === provinceId);
      if (find) {
        this.selected_fromProvinceId = { id: find.Id, name: find.Name };
        this.selected_Zipcode = find.ZipCode;
      }
    }
  }

  async selectedWard(wardId) {
    const find = this.wards.find((x) => x.Id === wardId);
    if (find) {
      this.selected_wardId = { id: find.Id, name: find.Name };
    }
  }

  submit(frm) {
    this.isSubmitted = true;
    if (frm.invalid) {
      return this.toasty.error(
        this.translate.instant('Please submit valid form')
      );
    } else {
      if (this.addressId) {
        this.update();
      } else {
        this.create();
      }
    }
  }

  changePhone(event) {
    if (!event) {
      return;
    }
    this.phoneNumber.number = event.value;
  }

  selectDial(event) {
    this.dialCode = event;
  }
  create() {
    this.contactService
      .createAddress({
        firstName: this.firstNameText,
        lastName: this.lastNameText,
        phoneNumber: this.phoneNumberText,
        address: this.shippingAddressText,
        city: this.selected_fromProvinceId,
        district: this.selected_DistrictId,
        ward: this.selected_wardId,
        zipCode: this.selected_Zipcode,
        default: this.isdefaultchk,
      })
      .then(async () => {
        await this.toasty.success(
          this.translate.instant('Create address successfull.')
        );
        await this.nav.pop();
        await this.nav.popTo(AddressComponent);
        return this.nav.push(AddressComponent, this.dataInfo, {
          animate: false,
        });
      })
      .catch(() =>
        this.toasty.error(
          this.translate.instant('Something went wrong, please try again')
        )
      );
  }

  update() {
    this.contactService
      .updateAddress({
        id: this.addressId,
        firstName: this.firstNameText,
        lastName: this.lastNameText,
        phoneNumber: this.phoneNumberText,
        address: this.shippingAddressText,
        city: this.selected_fromProvinceId,
        district: this.selected_DistrictId,
        ward: this.selected_wardId,
        zipCode: this.selected_Zipcode,
        default: this.isdefaultchk,
      })
      .then(async () => {
        await this.toasty.success(
          this.translate.instant('Update address successfull.')
        );
        if (this.flagchange === 'false') {
          await this.nav.pop();
          await this.nav.popTo(AddressComponent);
          return this.nav.push(
            AddressComponent,
            { dataInfo: this.dataInfo, flagchange: false },
            { animate: false }
          );
        } else {
          await this.nav.pop();
          await this.nav.popTo(AddressComponent);
          return this.nav.push(
            AddressComponent,
            { dataInfo: this.dataInfo, flagchange: true },
            { animate: false }
          );
        }
      })
      .catch((err) => {
        return this.toasty.error(this.translate.instant(err.data.message));
      });
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
}
