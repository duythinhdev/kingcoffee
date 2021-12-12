import { Component } from '@angular/core';
import { RequestPayoutService } from '../request-payout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'view-request-payout',
  templateUrl: './view.html'
})
export class ViewComponent {
  public item: any = {};
  public info: any = {
    note: '',
    reason: ''
  };
  public status: any;
  constructor(private router: Router, private route: ActivatedRoute, private payoutService: RequestPayoutService,
    private toasty: ToastrService, private translate: TranslateService) {
    const id = this.route.snapshot.params.id;
    this.payoutService.findOne(id).then(res => {
      this.item = res.data;
      this.status = res.data.status;
    });
  }

  reject(item) {
    if (this.status === 'rejected') {
      return this.toasty.error(this.translate.instant('This request has been rejected, can not be changed status'));
    }
    if (this.status === 'approved') {
      return this.toasty.error(this.translate.instant('This request has been approved, can not be changed status'));
    }
    if (!this.info.note) {
      return this.toasty.error(this.translate.instant('Please leave a message'));
    }
    this.payoutService.reject(item._id, { rejectReason: this.info.rejectReason, note: this.info.note }).then(res => {
      this.toasty.success(this.translate.instant('Success'));
      this.router.navigate(['/requestPayout']);
    })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  approve(item) {
    if (this.status === 'approved') {
      return this.toasty.error(this.translate.instant('This request has been approved, can not be changed status'));
    }
    if (this.status === 'rejected') {
      return this.toasty.error(this.translate.instant('This request has been rejected, can not be changed status'));
    }
    this.payoutService.approve(item._id, { note: this.info.note }).then(res => {
      this.toasty.success(this.translate.instant('Success'));
      this.router.navigate(['/requestPayout']);
    })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'))
  }
}
