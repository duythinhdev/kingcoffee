import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BannerService, ToastyService } from '../../../../../../services';

@Component({
  selector: 'referral-banner',
  templateUrl: './referral-banner.html',
})
export class ReferralBannerComponent implements OnInit {
  @Input() position = 'default';
  banners = [];

  constructor(
    private service: BannerService,
    private toasty: ToastyService,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.service
      .random({
        take: 5,
        isActive: true,
        position: 'banner-referral',
      })
      .then((resp) => {
        if (resp.data.length) {
          this.banners = resp.data.map((item) => {
            return {
              imageUrl: item.media
                ? item.media.fileUrl
                : '../../assets/img/banner.jpg',
              link: item.link ? item.link : '#',
            };
          });
        } else {
          this.banners = [
            {
              imageUrl: '../../assets/img/banner.jpg',
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
}
