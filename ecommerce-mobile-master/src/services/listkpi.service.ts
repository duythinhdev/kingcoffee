import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ListKpiService {
  constructor(private restangular: Restangular) {}

  find(params) {
    return this.restangular.one('/kpi').get(params).toPromise();
  }

  getCurrentKPI() {
    return this.restangular.one('/getCurrentKPI').get().toPromise();
  }
}
