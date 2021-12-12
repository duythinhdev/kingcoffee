import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { isNil } from 'lodash';
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";

import { HomePage } from '../home/home';
import { RegisterComponent } from '../auth/register/register.component';
import { ScanQRCodeInfo } from '../scan-qrcode-info/scan-qrcode-info';

import { QrScan }  from '../../providers/qr-scan/qr-scan';
import { ToolBox } from '../../providers/qr-scan/ToolBox';

import { AuthService, QrcodeService } from '../../services';


@Component({
  selector: 'page-scan-qrcode',
  templateUrl: 'scan-qrcode.html',
})
export class ScanQrcodePage  {
  private  qrHeader = false;

  isLoggedIn = false;
  checkReferral;
  scanSubscription

  constructor(
    public navCtrl: NavController,
    private qrScan: QrScan,
    private inAppBrowser: InAppBrowser,
    public platform: Platform,
    private auth: AuthService,
    public navParams: NavParams,
    private qrService: QrcodeService,

  ){

  }

  onExitQRScan():void {
    this.qrHeader = false;
    ToolBox.hideCamera();
    this.qrScan.destroyCamera()
  }

  onChangeCamera():void {
    this.qrScan.toggleCamera();
  }

  async onLightToggle() {
    this.qrScan.toggleLight();
  }

  onclickBack() {
    this.onExitQRScan();
    this.navCtrl.setRoot(HomePage)
  }

  onNavToQRCodeInfo(code) {
    this.navCtrl.push(ScanQRCodeInfo, {code})
  }

  formatQRCodeRes(qrcode: string) {
    const response = qrcode.split("/");
    return response[response.length - 1];
  }

  onScanQR() {
    this.qrHeader = true;

    const token = this.auth.getAccessToken();
    if (!isNil(token)) {
      this.isLoggedIn = true;
    }

    Promise.resolve("proceed")
      .then((k) => {
        return this.qrScan.scan();
      }) .then(async (qrcode) => {
      if (qrcode === "" || qrcode === undefined) {
        return Promise.reject("invalid_qr_code");
      }
      if (this.isLoggedIn) {
        // TODO (@): handle QRCode result user already login.
        const productId = qrcode.toString().split('_')[0];
        let bu =  qrcode.toString().split('_')[2];
        this.navCtrl.push(ScanQRCodeInfo, {qrcode, productId, bu})
      } else{
        const ref = this.formatQRCodeRes(qrcode);
        const model = {
          ref,
        }
        this.checkReferral = await this.auth.checkReferralUser(ref);
        if (this.checkReferral.StatusCode === 200) {
          return this.navCtrl.push(RegisterComponent, model);
        }
        else {
          return this.navCtrl.push(RegisterComponent);
        }
      }

    }) .then((data) => {
      // SCAN SUCCESSFUL
    }).catch((error) => {
      // HANDLE DISPLAY ERROR
      alert(error)
    });
  }

  ionViewWillEnter() {
    this.onScanQR();
  }

  ionViewWillLeave() {
    this.onExitQRScan();
  }

}
