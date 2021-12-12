import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NewsletterService } from '../../services/newsletter.service';
import {ContactTitleModel, ContactTitle} from '../../../model/newletter.contacts.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'contacts.html'
})
export class ContactsComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public items = [];
  public page = 1;
  public total = 0;
  public search = { text: '' };
  contactTitleModel:ContactTitleModel;
  constructor(private router: Router, private service: NewsletterService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.contactTitleModel = ContactTitle[0];
    this.query();
  }

  query() {
    this.service.contacts({
      page: this.page,
      email: this.search.text
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
        .catch((e) => this.toasty.error(this.translate.instant(e.data.data && e.data.data.message ? e.data.data.message : this.errorTitleModel.deleteunsucess)));
    }
  }
}
