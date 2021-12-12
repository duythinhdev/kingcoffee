import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PromotionService {
  constructor(private restangular: Restangular) {}

  promotionForUser() {
    return this.restangular
      .one('/promotions/list/promotionForUser')
      .get()
      .toPromise();
  }
  productsOrderByPromotionType(params: any) {
    return this.restangular
      .one('/promotions/list/productsOrderByPromotionType')
      .get(params)
      .toPromise();
  }
}
