import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MsgService } from './msg-message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../app/environments/environment';

@Injectable()
export class InfomationService extends GeneralService {
  constructor(protected http: HttpClient, protected alertService: MsgService) {
    super(http, alertService, environment.investUrl, 'info');
  }

  async getListBank() {
    const res = (await this.get('GetBankLists'));
    if (res) {
      return res.Data;
    } else {
      return undefined;
    }
  }
  async getBankInfo() {
    const res = (await this.get('GetBankInfo'));
    if (res) {
      return res.Data;
    } else {
      return undefined;
    }
  }

  labelAttribute = 'label';
}
