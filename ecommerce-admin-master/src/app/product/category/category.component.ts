import { Component, OnInit } from '@angular/core';
import { ProductCategoryService } from '../services/category.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductCategoryTitle, ProductCategoryTitleModel } from '../../model/product.category.title.model';
import { ProductCreateCategoryTitle, ProductCreateCategoryTitleModel} from '../../model/product.create.category.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { CommonService } from '../../utils/services/common.service';

interface CategoryNode {
  _id: string;
  name: string;
  level: number;
  isActive: boolean;
  createdAt: any;
  children?: CategoryNode[];
}

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: any;
  level: number;
}

@Component({
  selector: 'product-categories',
  templateUrl: './categories.html',
  styleUrls: ['./categories.component.scss']
})
export class ProductCategoriesComponent implements OnInit {
  productCategoryTitleModel: ProductCategoryTitleModel;
  errorTitleModel: ErrorTitleModel;
  
  /*Create categories tree*/
  private _transformer = (node: CategoryNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      _id: node._id,
      name: node.name,
      isActive: node.isActive,
      createdAt: node.createdAt,
      _level: node.level,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  public categories = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode) => node.expandable;


  constructor(private router: Router, private categoryService: ProductCategoryService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.productCategoryTitleModel = ProductCategoryTitle[0];
    this.query();
  }

  query() {
    this.categoryService.tree()
      .then(resp => this.categories.data = resp.data)
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  remove(item: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.categoryService.remove(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant("Delete product category is successful!"));
          this.categories.data.splice(index, 1);
          setTimeout(() => {
            window.location.reload();
          }, 800);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }
}

@Component({
  selector: 'product-category-create',
  templateUrl: './form.html'
})
export class ProductCategoryCreateComponent implements OnInit {
  public category: any = {
    name: '',
    description: '',
    isActive: true,
    isPromotion: false,
    mainImage: null
  };
  public tree: any = [];
  public imageUrl: string = '';
  productCreateCategoryTitleModel: ProductCreateCategoryTitleModel;
  constructor(private router: Router, private categoryService: ProductCategoryService,
    private toasty: ToastrService, private translate: TranslateService, private commonService: CommonService) {
  }

  ngOnInit() {
    this.productCreateCategoryTitleModel = ProductCreateCategoryTitle[0];
    this.categoryService.tree()
      .then(resp => (this.tree = this.categoryService.prettyPrint(resp.data)));
  }

  submit(frm: any) {
    if (!this.category.name) {
      return this.toasty.error('Vui lòng điền tên danh mục');
    }
    this.categoryService.create(this.category)
      .then(() => {
        this.toasty.success(this.translate.instant('Create product category is successful!'));
        this.router.navigate(['/products/categories']);
      }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!')));
  }

  remove(field: string, index: any) {
    this.category[field].splice(index, 1);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  selectImage(media: any) {
    this.category.mainImage = media._id;
    this.imageUrl = media.fileUrl;
  }
  changeAlias() {
    this.category.alias = this.commonService.generateAlias(this.category.name.toLowerCase());
  }
}

@Component({
  selector: 'product-category-update',
  templateUrl: './form.html'
})
export class ProductCategoryUpdateComponent implements OnInit {
  productCreateCategoryTitleModel: ProductCreateCategoryTitleModel;
  private groupId: string;
  public category: any = {};
  public tree: any = [];
  public imageUrl: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private categoryService: ProductCategoryService, private toasty: ToastrService,
    private translate: TranslateService, private commonService: CommonService) {
  }

  ngOnInit() {
    this.productCreateCategoryTitleModel = ProductCreateCategoryTitle[0];
    this.groupId = this.route.snapshot.paramMap.get('id');
    this.categoryService.findOne(this.groupId)
      .then(resp => {
        this.category = resp.data;
        if (typeof this.category.mainImage === 'string') {
          this.imageUrl = this.category.mainImage;
        } else if (this.category.mainImage) {
          this.imageUrl = this.category.mainImage.fileUrl;
          this.category.mainImage = this.category.mainImage._id;
        }
        return true;
      })
      .then(() => this.categoryService.tree())
      .then(resp => {
        this.categoryService.removeChild(resp.data, this.category._id);
        this.tree = this.categoryService.prettyPrint(resp.data)
      });
  }

  submit(frm: any) {
    if (!this.category.name) {
      return this.toasty.error(this.translate.instant('Please enter category name'));
    }

    this.categoryService.update(this.groupId, this.category)
      .then(() => {
        this.toasty.success(this.translate.instant('Update product category is successful!'));
        this.router.navigate(['/products/categories']);
      }, err => this.toasty.error(this.translate.instant(err.data.message || 'Lỗi hệ thống!')));
  }

  remove(field: string, index: any) {
    this.category[field].splice(index, 1);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  selectImage(media: any) {
    this.category.mainImage = media._id;
    this.imageUrl = media.fileUrl;
  }
  changeAlias() {
    this.category.alias = this.commonService.generateAlias(this.category.name.toLowerCase());
  }
}
