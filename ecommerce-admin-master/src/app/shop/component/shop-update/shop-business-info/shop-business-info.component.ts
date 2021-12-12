import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ShopService } from '../../../services/shop.service';
import { ShopBusinessInfoTitle, ShopBusinessInfoTitleModel } from '../../../../model/shop.businessinfo.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shop-business-info',
  templateUrl: './shop-business-info.html'
})
export class ShopBusinessInfoComponent implements OnInit {
  @Input() shop: any;
  public isSubmitted = false;
  shopBusinessInfoTitleModel:ShopBusinessInfoTitleModel;
  // TODO - add option to query user from server by user id
  constructor(private toasty: ToastrService, private shopService: ShopService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.shopBusinessInfoTitleModel = ShopBusinessInfoTitle[0];
    // TODO - add event emitter listen the change
  }
  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error(this.translate.instant('Invalid form, please check and try again!'));
    }
    const data = _.pick(this.shop, ['businessInfo']);

    this.shopService.update(this.shop.id, data).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
    }).catch((err) => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }
}
