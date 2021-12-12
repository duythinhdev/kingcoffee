import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class WishlistService {

  constructor(private restangular: Restangular) { }

  create(data) {
    return this.restangular.all('wishlist').post(data).toPromise();
  }

  list(params) {
    return this.restangular.one('wishlist').get(params).toPromise();
  }

  remove(id) {
    return this.restangular.one('wishlist', id).customDELETE().toPromise();
  }
}
