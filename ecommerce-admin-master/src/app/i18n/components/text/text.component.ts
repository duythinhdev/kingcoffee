import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TextService } from '../../services/text.service';
import { ConfigTextTitle, ConfigTextTitleModel } from '../../../model/config.text.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'text.html'
})
export class TextComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  configTextTitleModel: ConfigTextTitleModel;
  public items = [];
  public page = 1;
  public total = 0;
  public newText = { text: '' };
  public search = { text: '' };
  public lang='';
  constructor(private router: Router, private service: TextService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.configTextTitleModel =  ConfigTextTitle[0];
    // this.lang = this.route.snapshot.params.lang;
    this.query();
  }

  query() {
    this.service.search({
      page: this.page,
      text: this.search.text
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
          // reset listlang
          localStorage.removeItem('listlang');
          this.service.search(Object.assign(this.search, {
            lang: this.lang
          }))
            .then(resp => {
              localStorage.setItem('listlang', JSON.stringify(resp.data.items));
              this.items = resp.data.items;
              this.total = resp.data.count;
            })
            .catch(() => alert(this.translate.instant(this.errorTitleModel.deleteunsucess)));

        })
        .catch((e) => this.toasty.error(this.translate.instant(e.data.data && e.data.data.message ? e.data.data.message : this.errorTitleModel.deleteunsucess)));

    }
  }

  add() {
    if (!this.newText.text) {
      return this.toasty.error(this.translate.instant('Please enter text'));
    }

    this.service.create(this.newText)
      .then(resp => this.items.push(resp.data))
      .catch(e => this.toasty.error(this.translate.instant(e.data.data && e.data.data.message ? e.data.data.message : 'Có vấn đề hệ thống, Vui lòng thử lại!')))
  }
}
