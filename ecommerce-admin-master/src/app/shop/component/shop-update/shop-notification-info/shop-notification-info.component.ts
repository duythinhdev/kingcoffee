import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ShopService } from '../../../services/shop.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shop-notification-info',
  templateUrl: './shop-notification-info.html'
})
export class ShopNotificationInfoComponent implements OnInit {
  @Input() shop: any;
  public isSubmitted = false;

  // TODO - add option to query user from server by user id
  constructor(private toasty: ToastrService, private shopService: ShopService,
    private translate: TranslateService) { }

  ngOnInit() {
    // TODO - add event emitter listen the change
  }
  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error(this.translate.instant('Invalid form, please check and try again!'));
    }
    const data = _.pick(this.shop, ['notifications', 'announcement']);

    this.shopService.update(this.shop.id, data).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
    }).catch((err) => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }
}
