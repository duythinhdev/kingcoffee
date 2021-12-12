import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProductService {
  private alias;
  private product;
  private getProduct;
  constructor(private restangular: Restangular) {}

  search(params) {
    return this.restangular.one('products', 'search').get(params).toPromise();
  }

  find(alias: string) {
    if (alias !== this.alias) {
      this.getProduct = this.restangular
        .one('products', alias)
        .get()
        .toPromise()
        .then(
          (resp) => {
            this.product = resp.data;
            this.alias = resp.data.alias;
            return this.product;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
      return this.getProduct;
    } else {
      return Promise.resolve(this.product);
    }
  }

  related(productId: string,params) {
    return this.restangular
      .one(`products/${productId}`, 'related')
      .get(params)
      .toPromise();
  }
}
