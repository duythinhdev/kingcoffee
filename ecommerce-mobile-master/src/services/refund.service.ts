import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RefundService {

  constructor(private restangular: Restangular) { }

  list(params) {
    return this.restangular.one('refundRequests').get(params).toPromise();
  }

}
