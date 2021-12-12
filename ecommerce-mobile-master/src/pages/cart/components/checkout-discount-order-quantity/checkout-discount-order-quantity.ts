import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import _ from 'lodash';
import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { GiftNewMemberComponent } from '../gift-newmember/gift-newmember.component';
import { GiftForOrderComponent } from '../give-for-order/gift-for-order';
import { PreferentialProducts } from '../preferential-products/preferential-products.component';

@Component({
  selector: 'checkout-discount-order-quantity',
  templateUrl: './checkout-discount-order-quantity.html',
})
export class CheckoutDiscountOrderQuantityComponent implements OnInit {
  numberForNewMember: number;
  number = 0;
  listProduct = [];
  goodPercent;
  dataInfo;
  item;
  prevComponent = CheckoutComponent;
  isCreateOrder = false;
  selectItem;
  selectItemId;
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
    this.listProduct = this.navParams.data.giftOrderQuantity_CheckoutDiscount;
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
    const gifts = [];
    let isCreateOrder = false;
    if (this.item) {
        this.dataInfo.products.push({
          productId: this.item._id,
          quantity: this.item.quantity,
          promotions: [],
          name: this.item.name,
        });
        gifts.push(this.selectItem);
      }
    if (this.navParams.data.isCreateOrder) {
      isCreateOrder = this.navParams.data.isCreateOrder;
    }

    // Luu lai thong tin qua tang de xu ly o man hinh thu 2 tro di
    localStorage.setItem('giftOrderQuantity', JSON.stringify(gifts));

    // Kiem tra order con thoa dieu kien promotion nao khac khong
    this.sendData.dataInfo = this.dataInfo;
    
    if(!_.isEmpty(this.sendData.giftOrderQuantity)){
      return this.nav.push(GiftForOrderComponent, this.sendData);
    }

    if (!_.isEmpty(this.sendData.giftNewMember)) {
      return this.nav.push(GiftNewMemberComponent, this.sendData);
    }

    if (!_.isEmpty(this.sendData.goodPrice)) {
      return this.nav.push(PreferentialProducts, this.sendData);
    }

    // Neu khong thoa cac promotion tang qua khac thi chuyen den man hinh thanh toan thu 2
    const dataInfo: { dataInfo: {}, giftOrderQuantity: {}[], isCreateOrder: boolean } = {
      dataInfo: this.dataInfo,
      giftOrderQuantity: gifts,
      isCreateOrder
    };
    
    return this.nav.push(CreateOrderComponent, dataInfo);
  }
}
