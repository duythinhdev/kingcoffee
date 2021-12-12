import { Component, OnInit, Input } from '@angular/core';
import { PackageService } from '../../service/package.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PackageListingTitle, PackageListingTitleModel } from '../../../model/package.listing.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'packages-listing',
  templateUrl: './listing.html'
})
export class PackageListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  packageListingTitleModel:PackageListingTitleModel;
  public packages = [];
  public page: Number = 1;
  public take: Number = 10;
  public total: Number = 0;
  public searchText: any = '';
  public sortOption: any = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };

  constructor(private router: Router, private packageService: PackageService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.packageListingTitleModel = PackageListingTitle[0];
    this.query();
  }

  query() {
    let params = {
      page: this.page,
      take: this.take,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`,
      q: this.searchText,
    };

    this.packageService.search(params).then(resp => {
      this.packages = resp.data.items;
      this.total = resp.data.count;
    }).catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  remove(itemId: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.packageService.remove(itemId)
        .then(() => {
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.packages.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }
}
