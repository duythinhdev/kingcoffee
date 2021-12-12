import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild, NgModule } from '@angular/core';
import { PromotionService, ToastyService, SpinService } from '../../services';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AuthService } from '../../services';
import { isNil } from 'lodash';
import { Device } from '@ionic-native/device';
// import { TranslateService } from '@ngx-translate/core';
// import { NavController } from 'ionic-angular';
import { PromotionDetailsPage } from '../promotion-detail-list/promotion-detail-list.component';
/**
 * Generated class for the SpinLuckyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../auth';
import { Modalluckyspinner } from "../modalluckyspinner/modalluckyspinner";

@Component({
  selector: 'page-spin-lucky',
  templateUrl: 'spin-lucky.html'
})
@ViewChild(Modalluckyspinner)
export class SpinLuckyPage {
  titleHeader = 'Vòng xoay may mắn';
  isLoading = false;
  load = true;
  listShow;
  listProduct = [];
  checkLoading;
  PromotionType = [];
  currentPromotionType = '';
  isPopupp = false;
  ShowResult;
  status_gift;
  isUpDown = false;
  isLoggedIn = false;
  spinId: any = [];
  wheelSpinned = false;
  memberId;
  resultSpin;
  res: any;
  createdAt: any;
  param_result = {
    "deviceId": "",
    "spinId": "",
    "code": "",
    "status": ""
  }
  url_spin = 'https://crm.kingcoffee.com/tcoqcode_api/get_spin';

  constructor(
    private promotionService: PromotionService,
    private toasty: ToastyService,
    private translate: TranslateService,
    public nav: NavController,
    public platform: Platform,
    private inAppBrowser: InAppBrowser,
    private auth: AuthService,
    private spinService: SpinService,
    private device: Device,
  ) {
    const token = this.auth.getAccessToken();
    if (!isNil(token)) {
      this.isLoggedIn = true;
    }
  }
  async ionViewWillEnter() {
    if (this.isLoggedIn) {
      await this.auth.me().then(async (resp) => {
        if (!isNil(resp.data)) {
          this.memberId = resp.data.memberId;
          this.createdAt = resp.data.createdAt;
          let res = await this.auth.getStartDay();
          let startDate = res.data.startDate;
          var date_create = new Date(this.createdAt);
          var date_start = new Date(startDate);
          if (date_create > date_start) {
            this.res = await this.spinService.getUserInfo(this.memberId, this.device.uuid);
            console.log('this.res '+this.res)
            if (this.res.length != 0) {
              try {
                this.param_result.deviceId = this.device.uuid;
                this.param_result.spinId = this.res.code_data[0].spin_id;
                for (const spin of this.res.spin_data) {
                  if (spin.spin_id === this.param_result.spinId) {
                    this.param_result.status = spin.status;
                  }
                }
                this.param_result.code = this.res.code_data[0].code;
              } catch (error) {
                console.log(error)
              }
              this.wheelSpinned = resp.data.wheelSpinned;
              if (this.wheelSpinned) {
                if (resp.data.wheelSpinned == 'QT10') {
                  this.isLoading = true;
                  this.wheelSpinned = true;
                  this.ShowResult = 4;
                }
                else {
                  this.isLoading = true;
                  this.wheelSpinned = true;
                  this.isPopupp = true;
                  this.ShowResult = 3;
                  this.status_gift = await this.convertResult(resp.data.wheelSpinned);
                }
              }
              else {
                this.isLoading = true;
                this.wheelSpinned = true;
              }
            }
            else {
              this.isLoading = true;
              this.wheelSpinned = true;
              this.ShowResult = 4;
            }
          }
          else {
            this.isLoading = true;
            this.wheelSpinned = true;
            this.ShowResult = 4;
          }
        }
        else {
          return this.nav.push(LoginComponent)
        }
      });
    }
    else {
      return this.nav.push(LoginComponent)
    }


  }

  async clickSpinner() {
    this.isUpDown = true;
    if (this.ShowResult == 4) {
      this.isPopupp = true;
      this.ShowResult = 4;
    }
    else {
      let result = await this.auth.getWheelResult(this.param_result);
      if (result.data) {
        this.resultSpin = result.data.result.code;
      }
      else {
        this.resultSpin = 'QT10';
      }
      let z = 360 * 5;
      let y;
      let a = await this.convertResult(this.resultSpin);
      // console.log('a ' + a);
      // let a = Math.floor(Math.random() * 9)+1;  
      // let a = 9; // chuc ban may man1
      // let a = 8; // voucher 100k
      // let a = 7; // tui xach
      // let a = 6; // chuc ban may man2
      // let a = 5; // voucher 500k
      // let a = 4;  // balo
      // let a = 3; // chuc ban may man 3
      // let a = 2; // quat
      // let a = 1; // xe may vinfast
      switch (a) {
        case 1:
          y = 360;
          break;
        case 2:
          y = 320;
          break;
        case 3:
          y = 280;
          break;
        case 4:
          y = 240;
          break;
        case 5:
          y = 200;
          break;
        case 6:
          y = 160;
          break;
        case 7:
          y = 120;
          break;
        case 8:
          y = 80;
          break;
        case 9:
          y = 40;
          break;
      }
      let box = document.getElementById('item-spinner-reward');
      box.style.transform = `rotate(${y + z}deg)`;
      setTimeout(() => {
        this.isPopupp = true;
        if (a == 9 || a == 6 || a == 3) {
          this.ShowResult = 2
        }
        else {
          this.ShowResult = 1;
          this.status_gift = a;
        }

      }, 6500)
    }

  }
  async convertResult(rs) {
    let id;
    // let a = 9; // chuc ban may man1
    // let a = 8; // voucher 100k
    // let a = 7; // tui xach
    // let a = 6; // chuc ban may man2
    // let a = 5; // voucher 500k
    // let a = 9;  // balo
    // let a = 3; // chuc ban may man 3
    // let a = 2; // quat
    // let a = 1; // xe may vinfast
    switch (rs) {
      case 'QT1':
      case 'QT2':
      case 'QT3':
        //xe may vinfast
        id = 1
        break;
      case 'QT5':
        // balo
        id = 4
        break;
      case 'QT4':
        // quat
        id = 2
        break;
      case "QT6":
        // tui xach
        id = 7
        break;
      case "QT7":
        // voucher 500k
        id = 5
        break;
      case 'QT8':
        // voucher 100k
        id = 8
        break;
      case 'QT10':
        // chuc ban may man
        id = 6
        break;
    }
    return id
  }

  // async getUserInfo(member_id, device_id) {
  //   if(!device_id){
  //     device_id = 'd8da544894e56aea';
  //   }
  //   let formData = new FormData();
  //   formData.append('user_id', member_id);
  //   formData.append('device_id', device_id);
  //   const url = `https://crm.kingcoffee.com/tcoqcode_api/app_check_customer/`;
  //   await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'x-api-key': 'MpCXXNwc3CcZ'
  //     },
  //     body: formData,
  //   })
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then(data => {
  //       console.log(data);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // }
}
