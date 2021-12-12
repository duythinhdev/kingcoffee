import { Component, ViewChild, NgZone } from '@angular/core';
import { AuthService, CartService } from '../../../../services';
import { Content, NavController, NavParams } from 'ionic-angular';
import { InsertUpdateAddressComponent } from '../../../profile/components/insert-update-address/insert-update-address.component';
import { CheckoutComponent } from '../../../cart/components';
import { ShippingAdressModel } from '../../../../models/shippingAdress.model';
import { HomePage } from '../../../home/home';
import { TabsService } from '../../../../services/tabs.service';
import { isNil } from 'lodash';
import { CreateOrderComponent } from '../create_order/create_order.component';
@Component({
  selector: 'result_order',
  templateUrl: 'result_order.html',
})
export class ResultOrderComponent {
  @ViewChild('top') top: Content;
  items: ShippingAdressModel[] = [];
  text: string;
  scrollHeight = 0;
  selected_tpl;
  Change;
  list_tpl;
  list_data = [];

  address = {
    tplId: 0,
    fromDistrictCode: '',
    fromWardCode: '',
    toDistrictCode: '',
    toWardCode: '',
    weight: '',
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
  };
  role_discount = {
    we: 4,
    hubs: 7,
  };
  cart;
  Selected_tpl;
  deliverydate;
  check;
  messagePayment = '';
  isLoading = false;

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private zone: NgZone,
    private nav: NavController,
    private navParams: NavParams,
    private tabsService: TabsService
  ) {
    this.check = this.navParams.data.message
      ? JSON.parse(localStorage.getItem('isCheck'))
      : this.navParams.data;
  }

  async ngOnInit() {
    const paymentMethod = localStorage.getItem("paymentMethod");
    if(this.check.toString() == "true"){
      const orderCode = localStorage.getItem("orderCode");
      if(orderCode){
        switch(paymentMethod){
          case "zalopay":{
            this.cartService.callBackPayment({ requestId: orderCode }, paymentMethod);
            break;
          }
          case "momo":{
            const orderId = localStorage.getItem("orderId");
            this.cartService.callBackPayment({ orderId: orderId, requestId: orderCode }, paymentMethod);
            break;
          }
        }
      }
    }
    if(this.navParams.data.paymentMethod !== '' && !isNil(this.navParams.data.paymentMethod)) {
      this.check = this.navParams.data.paymentMethod;
      this.messagePayment = this.navParams.data.messagePayment
    }
    this.tabsService.show();

    if (this.check.toString() != "false" && !isNil(this.check) && this.check !== 'vnpay') {
      await this.cartService.clean();
    }
  }

  goto(page) {
    if (page === 'product') {
      return this.nav.setRoot(HomePage);
    }
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

  getDataAddress(itemId) {
    return this.nav.push(InsertUpdateAddressComponent, { itemId });
  }

  shipToThisAddress(shipToThisAddressId) {
    return this.nav.push(CheckoutComponent, { shipToThisAddressId });
  }
}
