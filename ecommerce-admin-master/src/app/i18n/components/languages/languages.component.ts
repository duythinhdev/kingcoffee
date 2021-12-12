import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../services/language.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigLanguageTitle, ConfigLanguageTitleModel } from '../../../model/config.language.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'languages.html'
})
export class LanguagesComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  configLanguageTitleModel: ConfigLanguageTitleModel;
  public items = [];
  public page = 1;
  public total = 0;

  constructor(private router: Router, private service: LanguageService,
    private toasty: ToastrService, private modalService: NgbModal, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.configLanguageTitleModel = ConfigLanguageTitle[0];
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

  addNew() {
    const modalRef = this.modalService.open(NewLanguageModalComponent, {
      size: 'sm'
    });

    modalRef.result.then(result => {
      this.toasty.success(this.translate.instant('New language has been added'));
      this.items.push(result);
    }, () => (null));
  }

  update(item: any, field: any, status: boolean) {
    const update = {};
    update[field] = status;
    this.service.update(item._id, update)
      .then(resp => {
        item[field] = status;
        if (field === 'isDefault' && status) {
          this.items.forEach(i => {
            i.isDefault = i._id === item._id;
          });
        }
      })
      .catch(e => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại later!'));
  }
}

@Component({
  templateUrl: 'new-language-modal.html'
})
export class NewLanguageModalComponent implements OnInit {
  public newLang: any = {
    isDefault: false,
    isActive: false,
    name: '',
    key: ''
  };
  public langs: any = [];
  public isoLangs: any = {};
  public submitted: boolean = false;
  configLanguageTitleModel: ConfigLanguageTitleModel;

  constructor(private router: Router, private service: LanguageService,
    private toasty: ToastrService, public activeModal: NgbActiveModal, private translate: TranslateService) {
  }

  ngOnInit() {
    this.isoLangs = this.service.isoLangs;
    this.langs = Object.keys(this.service.isoLangs);
    this.configLanguageTitleModel = ConfigLanguageTitle[0];
  }

  create(frm: any) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.service.create(this.newLang)
      .then(resp => this.activeModal.close(resp.data))
      .catch(err => this.toasty.error(this.translate.instant(err.data.data && err.data.data.message ? err.data.data.message : 'Có vấn đề hệ thống, Vui lòng thử lại!')));
  }
}
