import { Component, OnInit } from '@angular/core';
import { PackageService } from '../service/package.service';
import { ToastrService } from 'ngx-toastr';
import { PackagePaymentHistoryTitle, PackagePaymentHistoryTitleModel} from '../../model/package.paymenthistory.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'payment-package-history',
  templateUrl: './history.html'
})
export class PaymenPackageComponent implements OnInit {
  packagePaymentHistoryTitleModel: PackagePaymentHistoryTitleModel;
  public searchFields: any = {
  };
  public isLoading = false;
  public packages = [];
  public total: Number = 0;
  public take = 10;
  public page = 1;

  constructor(private packageService: PackageService, private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.packagePaymentHistoryTitleModel = PackagePaymentHistoryTitle[0];
    this.query();
  }

  query() {
    this.isLoading = true;
    const params = Object.assign({
      take: this.take,
      page: this.page,
      type: 'shop_featured'
    }, this.searchFields);
    this.packageService.history(params).then(resp => {
      this.packages = resp.data.items;
      this.total = resp.data.count;
      this.isLoading = false;
    }).catch((err) => {
      this.toasty.error(this.translate.instant(err.data.message || 'Có vấn đề hệ thống, Vui lòng thử lại!'));
      this.isLoading = false;
    });
  }

}
