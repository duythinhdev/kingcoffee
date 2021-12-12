import { Component, OnInit } from '@angular/core';
import { isNil, isEmpty } from 'lodash';
import { PromotionService, ToastyService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
import { PromotionDetailsPage } from '../promotion-detail-list/promotion-detail-list.component';

@Component({
  selector: 'promotion-tab',
  templateUrl: 'promotion-tab.html',
})
export class PromotionPage implements OnInit {
  titleHeader = 'Promotion';
  isLoading = false;
  load = true;
  listShow;
  listProduct = [];
  checkLoading;
  PromotionType = [];
  currentPromotionType = '';

  constructor(
    private promotionService: PromotionService,
    private toasty: ToastyService,
    private translate: TranslateService,
    public nav: NavController,
  ) {}
  async ngOnInit() {
    await this.query();
  }
  async query() {
    this.isLoading = true;
    this.promotionService
      .productsOrderByPromotionType({})
      .then((res) => {
        this.isLoading = false;
        this.PromotionType = res.data;
        this.listShow = res.data.map((item) => {
          item = {
            ...item,
            promotionProducts: item.promotionProducts.sort((e1, e2) => {
              return (e2.discountPercent ? e2.discountPercent : 0) - (e1.discountPercent ? e1.discountPercent : 0);
            })
          };
          return item;
        });
        this.countDown();        
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }
 
  async loadPromotionDetails(item: any) {
    return this.nav.push(PromotionDetailsPage, {promotionTypeId: item.promotionType._id});
  }

  countDown() {
    const timer = setInterval(() => {
      if (!isEmpty(this.listShow)) {
        for (const iterator of this.listShow) {
          iterator.promotionType.isShowCountdown = false;
          const countTime =
            new Date(iterator.promotionType.endDate.toString()).getTime() /
              1000 -
            new Date().getTime() / 1000;
          if (countTime > 0) {
            iterator.promotionType.countDownTimer = {
              hour: 0,
              minute: 0,
              second: 0,
            };
            iterator.promotionType.countDownTimer.hour = Math.floor(countTime / 60 / 60);
            iterator.promotionType.countDownTimer.minute = Math.floor(
              (countTime - iterator.promotionType.countDownTimer.hour * 60 * 60) / 60
            );
            iterator.promotionType.countDownTimer.second = Math.floor(
              countTime -
                iterator.promotionType.countDownTimer.hour * 60 * 60 -
                iterator.promotionType.countDownTimer.minute * 60
            );
            if (iterator.promotionType.countDownTimer.hour <= 10) {
              iterator.promotionType.isShowCountdown = true;
            }
          } else {
            clearInterval(timer);
          }
        }
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }
}
