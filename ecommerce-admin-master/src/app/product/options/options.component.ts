import { Component, OnInit } from '@angular/core';
import { OptionService } from '../services/option.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductOptionTitle, ProductOptionTitleModel } from '../../model/product.option.title.model';
import { ProductCreateOptionTitle, ProductCreateOptionTitleModel } from '../../model/product.create.option.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'options',
  templateUrl: './options.html'
})
export class OptionsComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public items = [];
  public page = 1;
  public total = 0;
  productOptionTitleModel: ProductOptionTitleModel;
  constructor(private router: Router, private optionService: OptionService, private toasty: ToastrService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.productOptionTitleModel = ProductOptionTitle[0];
    this.query();
  }

  query() {
    this.optionService.search({
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
      this.optionService.remove(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }
}

@Component({
  selector: 'option-create',
  templateUrl: './form.html'
})
export class OptionCreateComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public option: any = {
    name: '',
    key: '',
    description: '',
    options: []
  };
  public newOption: any = {};
  productCreateOptionTitleModel: ProductCreateOptionTitleModel;
  constructor(private router: Router, private optionService: OptionService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel =  ErrorTitle[0];
    this.productCreateOptionTitleModel  = ProductCreateOptionTitle[0];
  }

  addOption() {
    if (!this.newOption.key || !this.newOption.displayText) {
      return this.toasty.error(this.translate.instant('Please enter option value'));
    }
    this.option.options.push(this.newOption);
    this.newOption = {};
  }

  removeOption(index: any) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.option.options.splice(index, 1);
    }
  }

  submit(frm: any) {
    if (!this.option.name) {
      return this.toasty.error(this.translate.instant('Please enter option name'));
    }

    this.optionService.create(this.option)
      .then(() => {
        this.toasty.success('Cập nhật thành công');
        this.router.navigate(['/products/options']);
      }, err => this.toasty.error(this.translate.instant(err.data.data.details[0].message || err.data.message || 'Lỗi hệ thống!')));
  }
}

@Component({
  selector: 'option-update',
  templateUrl: './form.html'
})
export class OptionUpdateComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public option: any;
  public newOption: any = {};
  productCreateOptionTitleModel: ProductCreateOptionTitleModel;
  constructor(private router: Router, private route: ActivatedRoute, private optionService: OptionService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.productCreateOptionTitleModel  = ProductCreateOptionTitle[0];
    let optionId = this.route.snapshot.paramMap.get('id');
    this.optionService.findOne(optionId)
      .then(resp => this.option = resp.data);
  }

  addOption() {
    if (!this.newOption.key || !this.newOption.displayText) {
      return this.toasty.error(this.translate.instant('Please enter option value'));
    }
    this.option.options.push(this.newOption);
    this.newOption = {};
  }

  removeOption(index: any) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.option.options.splice(index, 1);
    }
  }

  submit(frm: any) {
    if (!this.option.name) {
      return this.toasty.error(this.translate.instant('Please enter option name'));
    }

    this.optionService.update(this.option._id, this.option)
      .then(() => {
        this.toasty.success('Cập nhật thành công');
        this.router.navigate(['/products/options']);
      }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!')));
  }
}
