import {
  Component,
  OnInit
} from '@angular/core';
import _ from 'lodash';
import {
  PromotionService,
  ToastyService
} from '../../services';
import {
  TranslateService
} from '@ngx-translate/core';
import {
  NavController,
  NavParams
} from 'ionic-angular';

@Component({
  selector: 'promotion-detail-list',
  templateUrl: 'promotion-detail-list.html',
})
export class PromotionDetailsPage implements OnInit {
  titleHeader = 'Promotion detail';
  isLoading = false;
  checkLoading;
  promotionDetails: any;
  promotionTypeId: any;

  constructor(
    private promotionService: PromotionService,
    private toasty: ToastyService,
    private translate: TranslateService,
    public nav: NavController,
    public navParams: NavParams
  ) {
    this.promotionTypeId = this.navParams.data.promotionTypeId;
  }

  async ngOnInit(){
    await this.query();
  }

  async query() {
    this.isLoading = true;
    this.promotionService
      .productsOrderByPromotionType({promotionTypeId: this.promotionTypeId})
      .then((res) => {
        this.isLoading = false;
        let promotionDetailsByType = res.data.map((item) => {
          item = {
            ...item,
            promotionProducts: item.promotionProducts.sort((e1, e2) => {
              return (e2.discountPercent ? e2.discountPercent : 0) - (e1.discountPercent ? e1.discountPercent : 0);
            })
          };
          return item;
        });
        this.promotionDetails = promotionDetailsByType[0];
        this.countDown();        
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  countDown() {
    if (this.promotionDetails) {
      const timer = setInterval(() => {
        this.promotionDetails.promotionType.isShowCountdown = false;
        const countTime =
          new Date(this.promotionDetails.promotionType.endDate.toString()).getTime() /
          1000 -
          new Date().getTime() / 1000;
        if (countTime > 0) {
          this.promotionDetails.promotionType.countDownTimer = {
            hour: 0,
            minute: 0,
            second: 0,
          };
          this.promotionDetails.promotionType.countDownTimer.hour = Math.floor(countTime / 60 / 60);
          this.promotionDetails.promotionType.countDownTimer.minute = Math.floor(
            (countTime - this.promotionDetails.promotionType.countDownTimer.hour * 60 * 60) / 60
          );
          this.promotionDetails.promotionType.countDownTimer.second = Math.floor(
            countTime -
            this.promotionDetails.promotionType.countDownTimer.hour * 60 * 60 -
            this.promotionDetails.promotionType.countDownTimer.minute * 60
          );
          if (this.promotionDetails.promotionType.countDownTimer.hour <= 10) {
            this.promotionDetails.promotionType.isShowCountdown = true;
          }
        } else {
          clearInterval(timer);
        }
      });
    }
  }
}
