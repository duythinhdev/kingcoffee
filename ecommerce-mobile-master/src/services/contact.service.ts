import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ContactService {
  constructor(private restangular: Restangular) {}

  create(params) {
    return this.restangular.one('contact').customPOST(params).toPromise();
  }
  createAddress(params) {
    return this.restangular
      .one('users', 'shippingAddress')
      .customPOST(params)
      .toPromise();
  }

  updateAddress(data) {
    return this.restangular
      .one('users/shippingAddress')
      .customPUT(data)
      .toPromise();
  }

  findOneAddress(id) {
    return this.restangular
      .one('users/shippingAddress', id)
      .get()
      .toPromise();
  }
  delete(id) {
    return this.restangular
      .one('users/shippingAddress', id)
      .customDELETE()
      .toPromise();
  }
}
