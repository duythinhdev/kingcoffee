import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
import { CheckoutComponent } from '../checkout/checkout.component';

@Component({
  selector: 'preferential-products',
  templateUrl: './preferential-products.html',
})
export class PreferentialProducts implements OnInit {
  listProduct = [];
  goodPercent;
  dataInfo;
  item;
  prevComponent = CheckoutComponent;
  isCreateOrder = false;
  selectItem;
  totalPriceCondition: 0;


  constructor(private nav: NavController, public navParams: NavParams) {}

  ngOnInit() {
    this.dataInfo = this.navParams.data.dataInfo;
    this.listProduct = this.navParams.data.goodPrice.buyGoodPriceProduct.goodPriceProducts;
    this.totalPriceCondition = this.navParams.data.goodPrice.buyGoodPriceProduct.totalOrderPriceCondition;
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
    let isCreateOrder;
    if (this.item) {
      this.dataInfo.goodPriceProduct = {};
      this.dataInfo.goodPriceProduct = {
        calculatedData: {
          product:
            this.item.product.salePrice -
            (this.item.product.salePrice * this.item.discountOnProductPercent) /
              100,
        },
        productId: this.item.product._id,
        quantity: 1,
        promotions: [this.navParams.data.goodPrice],
        name: this.item.product.name,
      };
    }
    if (this.navParams.data.isCreateOrder) {
      isCreateOrder = this.navParams.data.isCreateOrder;
    }
    const dataInfo = {
      dataInfo: this.dataInfo,
      goodPrice: this.navParams.data.goodPrice,
      isCreateOrder
    };

    return this.nav.push(CreateOrderComponent, dataInfo);
  }
}
