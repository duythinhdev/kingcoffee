import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CheckoutComponent } from '../checkout/checkout.component';
import { CheckoutService } from '../../../../services';
import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
import { LocalStorgeService } from '../../../../services/local-storge.service';
import _ from 'lodash';
import { GiftNewMemberComponent } from '../gift-newmember/gift-newmember.component';
import { PreferentialProducts } from '../preferential-products/preferential-products.component';

@Component({
  selector: 'gift-for-order',
  templateUrl: './gift-for-order.html',
})
export class GiftForOrderComponent implements OnInit {
  numberForNewMember: number;
  number = 0;
  listProduct = [];
  item;
  prevComponent = CheckoutComponent;
  isCreateOrder = false;
  selectItem;
  selectItemId;
  dataInfo;
  public sendData = {
    dataInfo: {},
    goodPrice: [],
    giftNewMember: [],
    giftOrderQuantity_CheckoutDiscount: [],
    giftOrderQuantity: []
  };

  constructor(
    private nav: NavController,
    public navParams: NavParams  ) {}

  ngOnInit() {
    this.dataInfo = this.navParams.data.dataInfo;
    this.listProduct = this.navParams.data.giftOrderQuantity;
    this.sendData = {
      dataInfo: this.dataInfo,
      goodPrice: this.navParams.data.goodPrice,
      giftNewMember: this.navParams.data.giftNewMember,
      giftOrderQuantity_CheckoutDiscount: this.navParams.data.giftOrderQuantity_CheckoutDiscount,
      giftOrderQuantity: this.navParams.data.giftOrderQuantity
    };
  }

  active(e) {
    this.item = e.gift;
    this.selectItemId = e.gift._id;
    this.selectItem = e;
  }

  onBack() {
    if (this.isCreateOrder) {
      this.isCreateOrder = false;
      this.ngOnInit();
    } else {
      if (this.prevComponent) {
        return this.nav.setRoot(this.prevComponent);
      }
    }
  }

  goTo() {
    let dataInfoObj: { dataInfo: {}, isCreateOrder: boolean } = {
      dataInfo: null,
      isCreateOrder: false
    }

    if (this.navParams.data.isCreateOrder) {
      dataInfoObj.isCreateOrder = this.navParams.data.isCreateOrder;
    }

    if (this.item) {
      dataInfoObj.dataInfo = this.dataInfo;
      localStorage.setItem('giftForOrderItem', JSON.stringify(this.selectItem));
    }

    // Kiem tra order con thoa dieu kien promotion nao khac khong
    this.sendData.dataInfo = this.dataInfo;

    if (!_.isEmpty(this.sendData.giftNewMember)) {
      return this.nav.push(GiftNewMemberComponent, this.sendData);
    }

    if (!_.isEmpty(this.sendData.goodPrice)) {
      return this.nav.push(PreferentialProducts, this.sendData);
    }

    return this.nav.push(CreateOrderComponent, dataInfoObj);
  }
}
