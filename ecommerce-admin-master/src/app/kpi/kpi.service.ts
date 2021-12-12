import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class KpiService {
  constructor(private restangular: Restangular) { }

  find(params: any): Promise<any> {
    return this.restangular.one('kpi').get(params).toPromise();
  }
}
