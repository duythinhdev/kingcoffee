import { Component, OnInit, Input } from '@angular/core';
import { ProductVariantService } from '../services/variant.service';
import { OptionService } from '../services/option.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductVariantTitle, ProductVariantTitleModel } from '../../model/product.variant.title.model';
import { UpdateVariantTitle, UpdateVariantTitleModel } from '../../model/update.variant.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'variant-update-modal',
  templateUrl: './update-modal.html'
})
export class VariantUpdateModalComponent implements OnInit {
  updateVariantTitleModel: UpdateVariantTitleModel;
  @Input() product: any;
  @Input() variant: any;
  public item: any;


  constructor(public activeModal: NgbActiveModal, private variantService: ProductVariantService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.updateVariantTitleModel = UpdateVariantTitle[0];
    this.item = Object.assign({}, this.variant);
  }

  update(frm: any) {
    // TODO  - validate
    if (frm.$invalid) {
      return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại.');
    }
    if (this.item.price < this.item.salePrice || !this.item.price || !this.item.salePrice) {
      return this.toasty.error(this.translate.instant('Invalid price!'));
    }
    if (this.item.stockQuantity < 0) {
      return this.toasty.error(this.translate.instant('Invalid stock quantity!'));
    }
    const data = _.pick(this.item, ['price', 'salePrice', 'stockQuantity', 'digitalFileId', 'options']);
    this.variantService.update(this.product._id, this.variant._id, data)
      .then((resp) => {
        // TODO - close me
        this.toasty.success(this.translate.instant('Updated successfully.'));
        this.activeModal.close(data);
      });
  }

  selectMedia(media: any) {
    this.item.digitalFileId = media._id;
  }
}

@Component({
  selector: 'product-variants',
  templateUrl: './variants.html'
})
export class ProductVariantsComponent implements OnInit {
  productVariantTitleModel: ProductVariantTitleModel;
  @Input()

  public product: any = {};
  public page: any = 1;
  public items: any = [];
  public total: any = 0;
  public newVariant: any = {
    options: [
      {
        optionKey: '',
        key: '',
        value: '',
        displayText: ''
      }
    ],
    price: 0,
    salePrice: 0,
    stockQuantity: 1000
  };
  public optionKey: any = '';
  public detailOption: any = {};
  public options: any = [];
  public option: any = {};
  public menuOptions: any = [];
  public newOption: any = {
    // optionKey: '',
    // key: '',
    // value: '',
    // displayText: ''
  };

  constructor(private variantService: ProductVariantService, private toasty: ToastrService,
    private modalService: NgbModal, private optionService: OptionService, private translate: TranslateService) {
  }

  ngOnInit() {
   this.productVariantTitleModel = ProductVariantTitle[0];
    this.query();


  }

  query() {
    this.variantService.search(this.product._id, {
      page: this.page
    })
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
      });
  }

  addNewOption(item) {
    if (!this.newOption.key && !this.newOption.displayText && !this.newOption.value) {
      return this.toasty.error(this.translate.instant('Please enter option'));
    }
    this.newOption.optionKey = item.options[0].optionKey;
    delete item.options[0].isNew;
    delete this.newOption.isNew;
    item.options.push(this.newOption);
    this.variantService.update(this.product._id, item._id, item)
      .then(resp => {
        this.newOption = {};
        this.toasty.success(this.translate.instant('Added new option successfully.'));
      })
      .catch(err => this.toasty.error(this.translate.instant(err.data.message || 'Có vấn đề hệ thống, Vui lòng thử lại.')));
  }

  removeOption(item, i) {
    if (item.options.length === 1) {
      return this.toasty.error(this.translate.instant('Options length must be at least 1.'));
    }
    if (window.confirm(this.translate.instant('Are you you to remove this option?'))) {
      item.options.splice(i, 1);
      this.variantService.update(this.product._id, item._id, item).then((resp) => {
        this.toasty.success(this.translate.instant('Removed option successfully.'));
      })
        .catch(err => this.toasty.error(this.translate.instant(err.data.data.message || 'Có vấn đề hệ thống, Vui lòng thử lại.')));
    }
  }

  openOption(opt) {
    opt.isNew = true;
  }

  closeOption(opt) {
    opt.isNew = false;
  }

  loadOptions() {
    this.optionService.search({ optionKey: this.optionKey }).then((resp) => {
      this.options = resp.data.items;
    });
  }

  selectOptionKey(item) {
    this.menuOptions = item.options;
    this.newVariant.options[0].optionKey = item.key;
  }

  selectOption(item) {
    this.newVariant.options[0].key = item.key;
    this.newVariant.options[0].displayText = item.displayText;
  }

  create() {
    if (this.newVariant.price < 0) {
      return this.toasty.error(this.translate.instant('Price value is invalid.'));
    }

    if (this.newVariant.salePrice < 0) {
      return this.toasty.error(this.translate.instant('Sale price value is invalid.'));
    }

    if (this.newVariant.stockQuantity < 0) {
      return this.toasty.error(this.translate.instant('Stock quantity value is invalid.'));
    }

    if (!this.newVariant.options[0].key || !this.newVariant.options[0].displayText || !this.newVariant.options[0].value) {
      return this.toasty.error(this.translate.instant('Please fill out all fields.'));
    }
    this.newVariant.options[0].optionKey = this.newVariant.options[0].key;
    this.variantService.create(this.product._id, this.newVariant)
      .then(resp => {
        // TODO - push media item?
        this.items.unshift(resp.data);
        this.newVariant.options[0] = {};
        this.toasty.success(this.translate.instant('Added new variant successfully.'));
      })
      .catch(err => this.toasty.error(this.translate.instant(err.data.message)));
  }

  remove(variantId: string, index) {
    if (window.confirm(this.translate.instant('Are you you to remove this variant?'))) {
      this.variantService.remove(this.product._id, variantId).then((resp) => {
        this.items.splice(index, 1);
        this.toasty.success(this.translate.instant('Removed item successfully.'));
      })
        .catch(err => this.toasty.error(this.translate.instant(err.data.data.message)));
    }
  }

  update(item: any, index: any) {
    const modalRef = this.modalService.open(VariantUpdateModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.variant = item;
    modalRef.componentInstance.product = this.product;
    modalRef.result.then(result => (this.items[index] = result), () => (null));
  }

  selectMedia(media: any) {
    this.newVariant.digitalFileId = media._id;
  }
}
