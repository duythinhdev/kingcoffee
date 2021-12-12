import { Component, ViewChild, NgZone } from '@angular/core';
import { CartService, ToastyService } from '../../../../services';
import { Content, NavController, NavParams } from 'ionic-angular';
import { InsertUpdateAddressComponent } from '../../../profile/components/insert-update-address/insert-update-address.component';
import { CheckoutComponent } from '../../../cart/components';
import { TPLService } from '../../../../services/tpl.service';
import { CreateOrderComponent } from '../create_order/create_order.component';
import { LocalStorgeService } from '../../../../services/local-storge.service';
import moment from 'moment';
import { isNil } from 'lodash';
import { isEmpty } from 'rxjs/operator/isEmpty';

@Component({
  selector: 'tplType',
  templateUrl: 'tplType.html',
})
export class TPLTypeComponent {
  @ViewChild('top') top: Content;
  // public items : ShippingAdressModel[] = [];
  text: string;
  scrollHeight = 0;
  selected_tpl;
  Change;
  // public list_tpl;
  list_data = [];

  address = {
    tplId: 0,
    fromDistrictCode: '',
    fromWardCode: '',
    toDistrictCode: '',
    toWardCode: '',
    weight: 0,
  };
  dataInfo = {
    products: [
      // {
      //     "productId": "5f7313b17583580018e871e0",
      //     "quantity": 1
      // }
    ],
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
  Selected_tpl;
  deliverydate;
  constructor(
    private cartService: CartService,
    private localStore: LocalStorgeService,
    private zone: NgZone,
    private tplService: TPLService,
    private nav: NavController,
    private toasty: ToastyService,
    private navParams: NavParams
  ) {
    this.dataInfo = this.navParams.data;
    if (!isNil(this.dataInfo.transportation)) {
      this.Selected_tpl = this.dataInfo.transportation.id;
    }
  }

  async ngOnInit() {
    const total = await this.total_weight();
    this.address = {
      tplId: 0,
      fromDistrictCode: '',
      fromWardCode: '',
      toDistrictCode: '',
      toWardCode: '',
      weight: total,
    };
    if (!isNil(this.dataInfo.district)) {
      this.address.toDistrictCode = this.dataInfo.district.id + '';
    }
    if (!isNil(this.dataInfo.ward)) {
      this.address.toWardCode = this.dataInfo.ward.id + '';
    }
    await this.load_tpl();
  }

  async total_weight() {
    let total = 0;
    await this.cartService.calculate().then(async (res) => {
      this.cart = res.data ? res.data : {};
      this.cart.products.forEach((x) => {
        total = total + (x.quantity * x.product.weight);
      });
    });
    return total;
  }

  async load_tpl() {
    const params = {
      fromDistrictCode: undefined,
      fromWardCode: undefined,
      toDistrictCode: this.address.toDistrictCode,
      toWardCode: this.address.toWardCode,
      weight: this.address.weight,
      orderName: `${this.dataInfo.lastName} ${this.dataInfo.firstName}`,
      orderPhone: this.dataInfo.phoneNumber,
      orderAddress: this.dataInfo.streetAddress,
    };
    this.list_data = await this.tplService.getAllTPL(params);
    if(!this.list_data) {
      await this.toasty.error('Không lấy được thông tin nhà vận chuyển');
    }
  }

  async select_TPL(item) {
    this.Selected_tpl = item.id;
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
    this.address.tplId = this.Selected_tpl;
    if (this.Selected_tpl === undefined) {
      return this.toasty.error('Vui lòng chọn đơn vị giao hàng');
    } else {
      const find = this.list_data.find((x) => x.id === this.Selected_tpl);
      if (find) {
        this.dataInfo.transportation = {
          id: find.id,
          name: find.name,
        };        
      }

      const res = await this.tplService.calculateTPL(this.address);
      if (res) {
        this.deliverydate = res.leadTimeUnix;
        this.dataInfo.shippingPrice = res.total;
      }

      this.localStore.set('DeliveryDate', this.deliverydate + '');
      await this.nav.pop();
      await this.nav.popTo(CreateOrderComponent);  
      this.dataInfo.isChangeDelivery = true;    
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

  radioChecked(selected_tpl) {
    if (this.Selected_tpl === selected_tpl) {
      return true;
    }
    return false;
  }
}
