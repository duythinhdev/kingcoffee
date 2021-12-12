import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import _ from 'lodash';
import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { PreferentialProducts } from '../preferential-products/preferential-products.component';

@Component({
  selector: 'gift-newmember',
  templateUrl: './gift-newmember.html',
})
export class GiftNewMemberComponent implements OnInit {
  numberForNewMember: number;
  number = 0;
  listProduct = [];
  goodPercent;
  dataInfo;
  item;
  prevComponent: any = CheckoutComponent;
  isCreateOrder = false;
  selectItem;
  public sendData = {
    dataInfo: {},
    goodPrice: [],
    giftNewMember: [],
    giftOrderQuantity_CheckoutDiscount: [],
    giftOrderQuantity: []
  };

  constructor(private nav: NavController, public navParams: NavParams) { }

  ngOnInit() {
    this.dataInfo = this.navParams.data.dataInfo;
    this.listProduct = this.navParams.data.giftNewMember[0];
    this.numberForNewMember = this.navParams.data.giftNewMember.length;
    this.sendData = {
      dataInfo: this.dataInfo,
      goodPrice: this.navParams.data.goodPrice,
      giftNewMember: this.navParams.data.giftNewMember,
      giftOrderQuantity_CheckoutDiscount: this.navParams.data.giftOrderQuantity_CheckoutDiscount,
      giftOrderQuantity: this.navParams.data.giftOrderQuantity
    };
  }

  active(e) {
    this.item = e;
    this.selectItem = e._id;
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
    const gifts = [];
    let isCreateOrder = false;
    if (this.numberForNewMember > this.number) {
      this.listProduct = this.navParams.data.giftNewMember[this.number + 1];
      this.number += 1;
      if (this.item) {
        this.dataInfo.products.push({
          productId: this.item._id,
          quantity: this.item.quantity,
          promotions: [],
          name: this.item.name,
        });
        gifts.push(this.item);
      }
    }
    if (this.navParams.data.isCreateOrder) {
      isCreateOrder = this.navParams.data.isCreateOrder;
    }
    const dataInfo: { dataInfo: {}, gifts: {}[], isCreateOrder: boolean } = {
      dataInfo: this.dataInfo,
      gifts,
      isCreateOrder
    };
    localStorage.setItem('gifts', JSON.stringify(gifts));

    // Kiem tra order con thoa dieu kien promotion nao khac khong
    this.sendData.dataInfo = this.dataInfo;

    if (!_.isEmpty(this.sendData.goodPrice)) {
      return this.nav.push(PreferentialProducts, this.sendData);
    }

    return this.nav.push(CreateOrderComponent, dataInfo);
  }
}
