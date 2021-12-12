import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProductVariantService {

  constructor(private restangular: Restangular) { }

  search(productId: string, params) {
    return this.restangular.one('products', productId).one('variants').get(params).toPromise();
  }
}
