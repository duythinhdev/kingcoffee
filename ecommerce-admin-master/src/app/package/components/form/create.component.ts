import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../service/package.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PackageCreateTitle, PackageCreateTitleModel } from '../../../model/package.create.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'package-create',
  templateUrl: './form.html'
})
export class PackageCreateComponent implements OnInit {
  packageCreateTitleModel: PackageCreateTitleModel;
  public package: any = {
    name: '',
    description: '',
    price: '',
    numDays: ''
  };

  public isSubmitted: any = false;

  constructor(private router: Router, private packageService: PackageService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.packageCreateTitleModel = PackageCreateTitle[0];
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (frm.invalid) {
      return this.toasty.error(this.translate.instant('Form is invalid, please try again.'));
    }

    if (this.package.price < 0) {
      return this.toasty.error(this.translate.instant('Please enter price value must be greater than 0'));
    } else if (this.package.numDays < 0) {
      return this.toasty.error(this.translate.instant('Please enter duration value must be greater than 0'));
    } else if (this.package.ordering < 0) {
      return this.toasty.error(this.translate.instant('Please enter ordering value must be greater than 0'));
    }

    this.packageService.create(this.package)
      .then(() => {
        this.toasty.success(this.translate.instant('Package has been created'));
        this.router.navigate(['/packages']);
      }, err => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
}
