import { Component, OnInit } from '@angular/core';
import { StatService } from '../shared/services';
import { RequestPayoutService } from '../request-payout/request-payout.service';
import { TranslationService } from '../i18n/services/translation.service';
import { StartTitleModel, StartTitle } from '../model/start.title.model';

@Component({
  templateUrl: './starter.component.html'
})
export class StarterComponent implements OnInit {

  public shopStat: any = {};
  public userStat: any = {};
  public productStat: any = {};
  public orderStat: any = {};
  public requestPayout = [];
  startTitleModel : StartTitleModel;
  constructor(private statService: StatService, private payoutService: RequestPayoutService, private  translationService: TranslationService) { }

  ngOnInit() {
    //Region set languages for page
    this.translationService.setLanguage();
    this.startTitleModel = StartTitle[0];
    //
    this.statService.shopStat().then(res => {
      this.shopStat = res.data;
    });
    this.statService.userStat().then(res => {
      this.userStat = res.data;
    });
    this.statService.prodStat().then(res => {
      this.productStat = res.data;
    });
    this.statService.orderStat().then(res => {
      this.orderStat = res.data;
    });

    this.payoutService.search({
      take: 5
    })
      .then(resp => {
        this.requestPayout = resp.data.items;
      });
  }
}
