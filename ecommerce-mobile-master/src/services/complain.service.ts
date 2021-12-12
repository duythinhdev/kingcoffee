import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ComplainService {

  constructor(private restangular: Restangular) { }

  complain(params) {
    return this.restangular.one('complains').customPOST(params).toPromise();
  }
}
