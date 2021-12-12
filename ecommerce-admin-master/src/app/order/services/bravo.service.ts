import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';

@Injectable()
export class BravoService {

  constructor(private restangular: Restangular, private httpClient: HttpClient) { }

  sendOrderDataToBravo(data: any): Promise<any> {
    return this.restangular.one('bravo/SendOrderDataToBravo').customPOST(data).toPromise();
  }

  getAuth(): Promise <any> {
    return this.restangular.one('bravo/WCDAuthen').post().toPromise();
  }

  clearSession(): Promise <any> {
    return this.restangular.one('bravo/WCDClearSession').get().toPromise();
  }

  getDataFromBravo(params): Promise <any> {
    return this.restangular.one('bravo/WCDLoadPOInfo').get(params).toPromise();
  }

  getDetailDataFromBravo(params): Promise <any> {
    return this.restangular.one('bravo/WCDLoadPOInfoDetail').get(params).toPromise();
  }
}
