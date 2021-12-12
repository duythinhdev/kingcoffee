import { Component, OnInit } from '@angular/core';
import { ComplainService } from './service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {ComplaintListTitle, ComplaintListTitleModel } from '../model/complaint.listing.title.model';
import { ErrorTitle, ErrorTitleModel } from '../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './views/list.html'
})
export class ComplaintListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public items = [];
  public page = 1;
  public total = 0;
  complaintListTitleModel: ComplaintListTitleModel;
  constructor(private router: Router, private service: ComplainService, private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.complaintListTitleModel = ComplaintListTitle[0];
    this.query();
  }

  query() {
    this.service.search({
      page: this.page
    })
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  remove(item: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.service.remove(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }
}
