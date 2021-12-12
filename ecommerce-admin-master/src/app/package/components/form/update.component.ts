import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../service/package.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'package-update',
  templateUrl: './form.html'
})

export class PackageUpdateComponent implements OnInit {
  public package: any;

  public isSubmitted: any = false;

  constructor(private router: Router, private route: ActivatedRoute,
    private packageService: PackageService, private toasty: ToastrService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.packageService.findOne(id)
      .then(resp => {
        this.package = resp.data;
      });
  }

  submit(frm) {
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

    if (this.package.duration <= 0) {
      return this.toasty.error(this.translate.instant('Invalid duration time.'));
    }
    const data = _.pick(this.package, ['price', 'name', 'numDays', 'description']);
    this.packageService.update(this.package._id, data).then(() => {
      this.toasty.success(this.translate.instant('Updated successfully.'));
      this.router.navigate(['/packages']);
    }).catch(err => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
}
