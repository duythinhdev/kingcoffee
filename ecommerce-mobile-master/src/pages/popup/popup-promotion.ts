import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewController, NavController } from 'ionic-angular';
import { BannerService } from '../../services/banner.service';
import { isEmpty, isNil } from 'lodash';
import { ToastyService } from '../../services/toasty.service';
import { Subject } from 'rxjs';
import { ProductListService } from '../../services/productList.service';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { PromotionPage } from '../promotion-tab/promotion-tab.component';

@Component({
  selector: 'popup-promotion',
  templateUrl: './popup-promotion.html',
})

export class PopupPromotionComponent implements OnInit {
  randomPromotion: any;
  isShowPopup: boolean;

  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams,
    public nav: NavController,
    ) {
      this.randomPromotion = this.navParams.data.randomPromotion;
      this.isShowPopup = this.navParams.data.isShowPopup;
      if(!this.isShowPopup){
        this.dismiss();
      }
    }
  async ngOnInit() {}

  async dismiss() {
    await this.viewCtrl.dismiss();
  }

  goTo() {
    return this.nav.push(PromotionPage);
  }
}
