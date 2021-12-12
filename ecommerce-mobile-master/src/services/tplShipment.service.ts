import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MsgService } from './msg-message.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SelectModel } from '../models/select.model';
import { environment } from '../app/environments/environment';

@Injectable()
export class TPLShipmentService extends GeneralService {
  constructor(protected http: HttpClient, protected alertService: MsgService) {
    super(http, alertService, environment.tniDSCUrl, 'Shipment');
  }

  async getLadingScheduleApi(shipmentNumber) {
    let httpParam = new HttpParams();
    httpParam = httpParam.append('shipmentNumber', shipmentNumber);
    const res = await this.getWithParams('GetLadingScheduleApi', httpParam);
    if (!res) {
      return;
    }
    return res.data;
  }

  async calculateTPL(model) {
    const res = await this.post('CalculateFeeTPL', model);
    if (!res) {
      return;
    }

    return res.data;
  }

  labelAttribute = 'label';
}
