import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ShopService } from '../../../services/shop.service';
import { LocationService } from '../../../../shared/services';
import { ShopShippingInfoTitle, ShopShippingInfoTitleModel } from '../../../../model/shop.shippinginfo.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shop-shipping-info',
  templateUrl: './shop-shipping-info.html'
})
export class ShopShippingInfoComponent implements OnInit {
  @Input() shop: any;
  shopShippingInfoTitleModel: ShopShippingInfoTitleModel;
  public isSubmitted = false;
  public countries: any = [];
  // TODO - add option to query user from server by user id
  constructor(private toasty: ToastrService, private shopService: ShopService, private location: LocationService, private translate: TranslateService) { }

  ngOnInit() {
    this.shopShippingInfoTitleModel = ShopShippingInfoTitle[0];
    this.location.countries().then(resp => this.countries = resp.data);
  }
  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error(this.translate.instant('Invalid form, please check and try again!'));
    }
    const data = _.pick(this.shop, ['shippingSettings']);

    this.shopService.update(this.shop.id, data).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
    }).catch((err) => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }

}
