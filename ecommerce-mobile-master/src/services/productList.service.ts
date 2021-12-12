import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProductListService {
  productListChanged = new Subject();
  productListChanged$ = this.productListChanged.asObservable();

  async onProductListChanged(searchText: {
    q: string;
    categoryId: string;
    shopId: string;
    featured: string;
    hot: string;
    bestSell: string;
    dailyDeal: string;
    soldOut: string;
    discounted: string;
  }) {
    console.log(searchText)
    this.productListChanged.next(searchText);
  }
}
