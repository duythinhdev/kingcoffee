import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import $ from "jquery";
@Injectable()
export class QrcodeService {
  constructor(private http: HttpClient) {
  }

  async getQRCodeInfo(settings) {
    return await $.ajax(settings).done(function (response) {
      return response
    });
  }
  async getQRCodeInfo_http({ uid, QRCode, total }) {
    const body = {
      user_id: uid,
      qr_code: QRCode,
      total,
      device_name: '',
      device_os: '',
      device_version: '',
      time: '',
    }
    return this.http
      .post(
        `https://crm.kingcoffee.com/tcoqcode_api/get_qrcode`,
        body,
        {
          headers:
          {
            'Api-key': "rL`CN>5]q^mcR*Bq",
            'Content-type': 'application/json'
          },
        })
      .toPromise();
  }
}
