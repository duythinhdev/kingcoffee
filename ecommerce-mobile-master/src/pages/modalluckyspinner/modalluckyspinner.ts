import { Component, Input } from '@angular/core';
import { HomePage } from '../home/home';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../services';
import * as moment from 'moment';
/**
 * Generated class for the ModalluckyspinnerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modalluckyspinner',
  templateUrl: 'modalluckyspinner.html'
})
export class Modalluckyspinner {
  text: string;
  isPopupSuccess: boolean = false;
  isPopuplose: boolean = false;
  isPopupover: boolean = false;
  isNotification:boolean = false;
  isNotificationSpin:boolean = false;
  startdate;
  gift_name;
  @Input() isPopupp;
  @Input() isStt;

  constructor(
    private navController: NavController,
    private auth: AuthService,
  ) {

  }
  async ngOnInit() {
    var now_day = new Date();
    let res = await this.auth.getStartDay();
    let date = res.data.startDate;
    this.startdate = moment(date).format("DD/MM/YYYY")  
    var date_start = new Date(date);
    switch (this.isPopupp) {
      case 1:
        this.isPopupSuccess = true;
        this.gift_name = await this.getGiftName(this.isStt);
        break;
      case 2:
        this.isPopuplose = true;
        break;
      case 3:
        this.isPopupover = true;
        this.gift_name = await this.getGiftName(this.isStt);
        break;
      case 4:
        if(now_day > date_start){
          this.isNotificationSpin = true;
        }
        else{
          this.isNotification = true;
        }
        break;
      default:
        break;
    }
    if (this.isPopupp === true) {
      this.isPopupover = true
    }
    else {
      //this.isPopuplose = true
      // this.isPopupSuccess = true;
    }
    // this.isPopupSuccess = true;
  }
  clickClosePopup() {
    return this.navController.setRoot(HomePage);
  }
  async getGiftName(stt) {
    switch (stt) {
      case 1:
        this.gift_name = "Xe máy điện Vinfast Impes";
        break;
      case 2:
        this.gift_name = "Nón bảo hiểm";
        break;
      case 4:
        this.gift_name = "Balo";
        break;
      case 7:
        this.gift_name = "Túi xách";
        break;
      case 5:
        this.gift_name = "Voucher WE4.0 500k";
        break;
      case 8:
        this.gift_name = "Voucher WE4.0 100k";
        break;

      default:
        this.gift_name = false;
        break;
    }
    return this.gift_name;
  }
}
