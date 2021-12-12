import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ReportService {
  constructor(private restangular: Restangular) {}

  create(params) {
    return this.restangular.one('reports').customPOST(params).toPromise();
  }
}
