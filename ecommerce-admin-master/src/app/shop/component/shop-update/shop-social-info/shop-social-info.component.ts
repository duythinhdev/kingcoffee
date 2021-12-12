import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ShopService } from '../../../services/shop.service';
import { ShopSocialInfoTitle, ShopSocialInfoTitleModel } from '../../../../model/shop.socialinfo.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shop-social-info',
  templateUrl: './shop-social-info.html'
})
export class ShopSocialInfoComponent implements OnInit {
  @Input() shop: any;
  public isSubmitted = false;
  shopSocialInfoTitleModel: ShopSocialInfoTitleModel;
  // TODO - add option to query user from server by user id
  constructor(private toasty: ToastrService, private shopService: ShopService, private translate: TranslateService) { }

  ngOnInit() {
    this.shopSocialInfoTitleModel = ShopSocialInfoTitle[0];
    // TODO - add event emitter listen the change
  }
  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error('Lỗi hệ thống, vui lòng kiểm tra và thử lại!');
    }
    const data = _.pick(this.shop, ['socials', 'socialConnected']);

    this.shopService.update(this.shop.id, data).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
    }).catch((err) => this.toasty.error(this.translate.instant(err.data.data.message)));
  }
}
