import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BannerService, ToastyService } from '../../services';
import { NavController } from 'ionic-angular';
import { PromotionPage } from '../promotion-tab/promotion-tab.component';

@Component({
  selector: 'promotion-banner',
  templateUrl: './promotion-banner.html',
})
export class PromotionBannerComponent implements OnInit {
  @Input() position = 'default';
  banners = [];

  constructor(
    private service: BannerService,
    private toasty: ToastyService,
    private translate: TranslateService,
    public nav: NavController,
  ) {}

  async ngOnInit() {
    this.service
      .random({
        take: 5,
        isActive: true,
        position: 'banner-homepage-promotion',
      })
      .then((resp) => {
        if (resp.data.length) {
          this.banners = resp.data.map((item) => {
            return {
              imageUrl: item.media
                ? item.media.fileUrl
                : '../../assets/img/wcd-default-banner.jpg',
              link: item.link ? item.link : '#',
            };
          });
        } else {
          this.banners = [
            {
              imageUrl: '../../assets/img/wcd-default-banner.jpg',
            },
          ];
        }
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  goTo() {
    return this.nav.setRoot(PromotionPage);
  }
}
