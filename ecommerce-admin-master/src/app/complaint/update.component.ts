import { Component, OnInit } from '@angular/core';
import { ComplainService } from './service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './views/form.html'
})
export class ComplaintUpdateComponent implements OnInit {
  public item: any = {};

  constructor(private router: Router, private route: ActivatedRoute, private service: ComplainService,
    private toasty: ToastrService, private translate: TranslateService) {
    const id = this.route.snapshot.params.id;
    this.service.findOne(id).then(resp => this.item = resp.data)
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại.'));
  }

  ngOnInit() {
  }

  submit(frm: any) {
    if (!frm.valid) {
      return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại.');
    }
    const data = _.pick(this.item, ['status', 'note']);
    this.service.update(this.item._id, data)
      .then(resp => {
        this.toasty.success(this.translate.instant('Updated successfully!'));
        this.router.navigate(['/complaints']);
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
}
