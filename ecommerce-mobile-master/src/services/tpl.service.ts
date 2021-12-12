import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MsgService } from './msg-message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../app/environments/environment';

@Injectable()
export class TPLService extends GeneralService {
  constructor(protected http: HttpClient, protected alertService: MsgService) {
    super(http, alertService, environment.tniDSCUrl, 'tpl');
  }

  async getAllTPL(params: {
    fromDistrictCode: string;
    fromWardCode: string;
    toDistrictCode: string;
    toWardCode: string;
    weight: number;
    orderName: string;
    orderPhone: string;
    orderAddress: string;
  }) {
    const res = await this.post('ListTPLs', params);
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
