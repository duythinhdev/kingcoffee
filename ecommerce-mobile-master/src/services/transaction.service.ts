import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TransactionService {
  constructor(private restangular: Restangular) {}

  request(params) {
    return this.restangular
      .one('payment/transactions/request')
      .customPOST({
        ...params,
        redirectSuccessUrl: window.appConfig.paymentRedirectSuccessUrl,
        redirectCancelUrl: window.appConfig.paymentRedirectCancelUrl,
      })
      .toPromise();
  }
}
