import { Injectable } from '@angular/core';

import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LocationService {
  constructor(private restangular: Restangular) {}
  countries() {
    return this.restangular.one('countries').get().toPromise();
  }

  states(params) {
    return this.restangular.one('states').get(params).toPromise();
  }

  cities(params) {
    return this.restangular.one('cities').get(params).toPromise();
  }

  getListProvince() {
    return this.restangular
      .one('address/administrative-devisions')
      .get()
      .toPromise();
  }

  getListDistrict(id) {
    return this.restangular
      .one('address/administrative-devisions')
      .get({
        type: 'district',
        id,
      })
      .toPromise();
  }
  getListWard(id) {
    return this.restangular
      .one('address/administrative-devisions')
      .get({
        type: 'ward',
        id,
      })
      .toPromise();
  }
}
