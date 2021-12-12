import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class ReportSaleService {
  constructor(private restangular: Restangular,private http: HttpClient) { }

  saleStat(param: any): Promise<any> {
    return this.restangular.one('sales').get(param).toPromise();
  }
  getAllOrder(param: any): Promise<any> {
    return this.restangular.one('orders/getAllListScanned').get(param).toPromise();
  }
  getAllUser(param: any): Promise<any>
  {
    return this.restangular.one('users/searchAll').get(param).toPromise();
  }
  getAllUserExportExcel(): Promise<any>
  {
    return this.restangular.one('users/searchAll').get().toPromise();
  }
}
