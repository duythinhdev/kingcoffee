import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class OrderService {
  constructor(private restangular: Restangular) {}

  find(params) {
    return this.restangular.one('orders').get(params).toPromise();
  }
  getQRoder(params) {
    return this.restangular.one('qr-orders').get(params).toPromise();
  }

  findOne(id) {
    return this.restangular.one('orders', id).get().toPromise();
  }

  sendRefund(data) {
    return this.restangular.all('refundRequests').customPOST(data).toPromise();
  }

  checkPhone(phoneNumber: string) {
    return this.restangular
      .all('orders/phone/check')
      .customPOST({ phoneNumber })
      .toPromise();
  }

  async createOrder(model) {
    return this.restangular.one('orders').customPOST(model).toPromise();
  }
  async createOrderQR(model) {
    return this.restangular.one('qr-orders').customPOST(model).toPromise();
  }
  async qrordersamount() {
    return this.restangular.one('qr-orders-amount?orderStatus=scanned').get().toPromise();
  }
  // async createQROrder(model) {
  //   return this.restangular.one('qr-orders').customPOST(model).toPromise();
  // }

  getOrderLog(params) {
    return this.restangular.one('order/logs').get(params).toPromise();
  }

  async checkCodePromotionFreeShip(model: { code: string }) {
    return this.restangular
      .one('promotions/checkCodePromotionFreeShip')
      .customPOST(model)
      .toPromise();
  }
}
