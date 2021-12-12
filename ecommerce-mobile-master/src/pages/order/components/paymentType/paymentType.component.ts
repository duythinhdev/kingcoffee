import { Component, ViewChild, NgZone } from '@angular/core';
import {
  AuthService,
  SystemService,
  ToastyService,
} from '../../../../services';
import { Content, NavController, NavParams } from 'ionic-angular';
import { InsertUpdateAddressComponent } from '../../../profile/components/insert-update-address/insert-update-address.component';
import { CheckoutComponent } from '../../../cart/components';
import { ShippingAdressModel } from '../../../../models/shippingAdress.model';
import { CreateOrderComponent } from '../create_order/create_order.component';

@Component({
  selector: 'paymentType',
  templateUrl: 'paymentType.html',
})
export class PaymentTypeComponent {
  @ViewChild('top') top: Content;
  items: ShippingAdressModel[] = [];
  text: string;
  scrollHeight = 0;
  selected_tpl;
  Change;
  list_tpl;
  list_data = [];
  paymentMethods = [];

  address = {
    tplId: 0,
    fromDistrictCode: '',
    fromWardCode: '',
    toDistrictCode: '',
    toWardCode: '',
    weight: '',
  };
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
    isChangeDelivery: false
  };
  role_discount = {
    we: 4,
    hubs: 7,
  };
  cart;
  selected_payment;

  constructor(
    private auth: AuthService,
    private zone: NgZone,
    private nav: NavController,
    private toasty: ToastyService,
    private navParams: NavParams,
    private systemService: SystemService
  ) {
    this.dataInfo = this.navParams.data;
  }

  async ngOnInit() {
    await this.systemService.configs().then(() => {
      this.paymentMethods = window.appData.paymentGatewayConfig.paymentMethods;
      if (this.paymentMethods) {
        this.paymentMethods = this.paymentMethods.filter(
          (x) => x.enable === true
        );        
      }
    });
    for (const iterator of this.paymentMethods) {
      iterator.icon = `../../../../assets/icon/${iterator.value}.png`
    }
  }

  select_TPL(value) {
    this.dataInfo.paymentMethod = value;
  }

  async query() {
    await this.auth.getShippingAdress().then((res) => {
      this.items = res;
    });
  }

  onScroll($event) {
    this.zone.run(() => {
      this.scrollHeight = $event.scrollTop;
    });
  }

  scrollTop() {
    return this.top.scrollToTop();
  }

  async insertUpdate() {
    if (
      !this.dataInfo.paymentMethod ||
      this.dataInfo.paymentMethod === undefined ||
      !this.paymentMethods.find((x) => x.value === this.dataInfo.paymentMethod)
    ) {
      return this.toasty.error('Vui lòng chọn hình thức thanh toán');
    } else {
      this.dataInfo.returnUrl = 'tniecommerce://';
      this.dataInfo.isChangeDelivery = true;    
      await this.nav.popTo(CreateOrderComponent);
      return this.nav.push(CreateOrderComponent, this.dataInfo, {
        animate: false,
      });
    }
  }

  getDataAddress(itemId) {
    return this.nav.push(
      InsertUpdateAddressComponent,
      { itemId },
      { animate: false }
    );
  }

  shipToThisAddress(shipToThisAddressId) {
    return this.nav.push(
      CheckoutComponent,
      { shipToThisAddressId },
      { animate: false }
    );
  }

  radioChecked(paymentMethod) {
    if (this.dataInfo.paymentMethod === paymentMethod) {
      return true;
    }
    return false;
  }
}
