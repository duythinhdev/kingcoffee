import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { MsgService } from './msg-message.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SelectModel } from '../models/select.model';
import { environment } from '../app/environments/environment';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import { CreateOrderForZaloPayResponse } from '../models/payment.model';
import { ToastyService } from './toasty.service';
import { TranslateService } from '@ngx-translate/core';

declare let cordova: any;
const STATUS_SUCCESS = "1";
const STATUS_FAILED = "-1";
const STATUS_CANCELED = "4";
@Injectable()
export class PaymentService extends GeneralService {
  constructor(protected http: HttpClient, protected alertService: MsgService, 
    protected toasty: ToastyService, protected translate: TranslateService) {
    super(http, alertService, environment.apiBaseUrl, 'payment');
  }

  async callbackMoMo(requestId, orderId) {
    const params = new HttpParams();
    params.append('requestId', requestId);
    params.append('orderId', orderId);
    const res = await this.getWithParams('momo/callback', params);
    if (!res) {
      return undefined;
    }
    return res;
  }
  labelAttribute = 'label';

  // ----- ZaloPay -----
  async zalopay_Pay(zalopay_token) {
    if (zalopay_token !== "") {
      cordova.plugins.ZaloPayPlugin.payOrder(zalopay_token, async function(response) {
        switch (response.code) {
          case 1:
            return {
              message: this.translate.instant("Payment Success"),
              errorCode: STATUS_SUCCESS
            };
          case STATUS_CANCELED:
            return {
              message: this.translate.instant("User Canceled"),
              errorCode: STATUS_CANCELED
            };
          case STATUS_FAILED:
            return {
              message: this.translate.instant("Payment failed"),
              errorCode: STATUS_FAILED
            };
          default:
            return {
              message: this.translate.instant("Unknown status"),
              errorCode: "1"
            };
        }
      }.bind(this), async function (error) {
        return {
          message: this.translate.instant("Error: " + error),
          errorCode: STATUS_FAILED
        }
      }.bind(this));
    } else {
      return {
        message: this.translate.instant("ZPTransToken is invalid"),
        errorCode: STATUS_FAILED
      }
    }
  }
}
