import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ShopService } from '../../../services/shop.service';
import { ShopBasicInfoTitle, ShopBasicInfoTitleModel } from '../../../../../app/model/shop.basicinfo.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../../utils/services/common.service';

@Component({
  selector: 'shop-basic-info',
  templateUrl: './shop-basic-info.html'
})
export class ShopBasicInfoComponent implements OnInit {
  @Input() shop: any;
  public isSubmitted = false;
  shopBasicInfoTitleModel: ShopBasicInfoTitleModel;
  // TODO - add option to query user from server by user id
  constructor(private toasty: ToastrService, private shopService: ShopService, private translate: TranslateService, private commonService: CommonService) { }

  ngOnInit() {
    this.shopBasicInfoTitleModel = ShopBasicInfoTitle[0];
    // TODO - add event emitter listen the change
  }
  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error(this.translate.instant('Invalid form, please check and try again!'));
    }
    const data = _.pick(this.shop, ['name', 'alias', 'address', 'city', 'state', 'district', 'ward', 'country', 'zipCode', 'email', 'featured',
      'phoneNumber', 'logoId', 'verificationIssueId', 'bannerId', 'headerText', 'gaCode', 'announcement', 'activated', 'verified', 'shippingSettings']);
    // const data = _.pick(this.shop, ['shippingSettings']);
    this.shopService.update(this.shop.id, data).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
    }).catch((err) => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }
  selectLogo(data: any) {
    this.shop.logoId = data._id;
    this.shop.logo = data;
  }
  selectVerificationIssue(data: any) {
    this.shop.verificationIssueId = data._id;
    this.shop.verificationIssue = data;
  }
  selectBanner(data: any) {
    this.shop.bannerId = data._id;
    this.shop.banner = data;
  }
  changeAlias() {
    this.shop.alias = this.commonService.generateAlias(this.shop.name.toLowerCase());
  }
}
