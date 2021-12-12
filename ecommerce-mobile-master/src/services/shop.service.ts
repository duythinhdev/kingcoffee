import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ShopService {
  private alias;
  private shop;
  private getShop;

  constructor(private restangular: Restangular) {}

  find(alias: string) {
    if (alias !== this.alias) {
      this.getShop = this.restangular
        .one('shops', alias)
        .get()
        .toPromise()
        .then((resp) => {
          this.shop = resp.data;
          this.alias = resp.data.alias;
          return this.shop;
        });
      return this.getShop;
    } else {
      return Promise.resolve(this.shop);
    }
  }

  search(params) {
    return this.restangular.one('shops', 'search').get(params).toPromise();
  }
}
