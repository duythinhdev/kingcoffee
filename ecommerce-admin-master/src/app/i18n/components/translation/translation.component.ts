import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '../../services/translation.service';
import { TranslatetionTitle, TranslatetionTitleModel } from '../../../model/translation.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'translation.html'
})
export class TranslationComponent implements OnInit {
  translatetionTitleModel: TranslatetionTitleModel;
  public items = [];
  public page = 1;
  public count = 0;
  public currentPage: Number = 1;
  public pageSize: Number = 10;
  public search: any = {
    text: '',
    translation: ''
  };
  private lang = '';

  constructor(private route: ActivatedRoute, private service: TranslationService,
    private toasty: ToastrService, private translationService: TranslationService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.translatetionTitleModel = TranslatetionTitle[0];
    this.lang = this.route.snapshot.params.lang;
    this.translationService.setLanguage();
    this.query();
  }

  query() {
    this.service.search(Object.assign(this.search, {
      take: this.pageSize,
      page: this.currentPage,
      lang: this.lang
    }))
      .then(resp => {
        this.items = resp.data.items;
        this.count = resp.data.count;
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  onSearch() {
    this.currentPage = 1;
    this.query();
  }

  update(item: any) {
    if (!item.translation) {
      return this.toasty.error(this.translate.instant('Please enter translation'));
    }

  this.service.update(item._id, { translation: item.translation })
      .then(resp =>{
        this.toasty.success(this.translate.instant('Updated'));
        //  window.location.reload();
      })
      .catch(e => this.toasty.error(this.translate.instant(e.data.data && e.data.data.message ? e.data.data.message : 'Có vấn đề hệ thống, Vui lòng thử lại!')));
  }
  pull() {
    this.service.pull(this.lang)
      .then(() => {
        window.location.reload();
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
}
