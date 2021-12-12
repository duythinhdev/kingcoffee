import { Component, OnInit } from '@angular/core';
import { ProductCategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { LocationService, UploadImageFroalaEditorService } from '../../shared/services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { ProductCreateTitle, ProductCreateTitleModel } from '../../model/product.create.title.model';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import * as ClassicEditor from '../../../assets/ckeditor/ckeditor';
import { MediaService } from '../../media/service';
import { ShopService } from '../../shop/services/shop.service';
import { ComonService } from '../../utils/services/comon.service';

@Component({
  selector: 'product-create',
  templateUrl: './form.html',
  styles: [`.form-control-custom { width: 300px; }`]
})
export class ProductCreateComponent implements OnInit {
  productCreateTitleModel: ProductCreateTitleModel;
  public product: any = {
    name: '',
    description: '',
    specifications: [],
    mainImage: null,
    metaSeo: {
      keywords: '',
      description: ''
    },
    // type: 'physical',
    categoryId: '',
    freeShip: false,
    dailyDeal: false,
    featured: false,
    price: null,
    unitPrice: '',
    salePrice: null,
    unitSalePrice: '',
    vat: 0,
    restrictFreeShipAreas: [],
    restrictCODAreas: [],
    shop: {
      name: ''
    },
    weight: null,
    isTradeDiscount: false,
    taxPercentage: 0,
    fiveElement: false,
    // configs: {
    //   tradeDiscountGoldtime: 50,
    //   isTradeDiscountSeller: false
    // },
    goldTimeDiscount: 50,
    isActive: false,
    note: '',
    country: 'VN',
    lang: '',
    sap: '',
    expiryDate: null,
    producer: '',
    packingSpecifications: null,
    isPromotion: false
  };
  public tree: any = [];
  public countries: any = [];
  public states: any = [];
  public cities: any = [];
  public zipCode: any = '';
  public freeCountry: any;
  public freeState: any;
  public freeCity: any;
  public newSpecification: any = {
    key: '',
    value: ''
  };
  public imageUrl: any = '';
  public images: any = [];
  public mainImage: any = '';
  public tab = 'info';
  public freeShipAreas: any = [];
  public restrictCODAreas: any = '';
  public dealDate: any;
  public imagesOptions: any = {
    multiple: true
  };
  public seller: any;
  public searching: any = false;
  public searchFailed: any = false;
  public fileOptions: any = {};
  public deny: boolean = false;
  public allCountry: any = [];
  public isUpdate = false;
  // search seller
  // formatter = (x: { name: string, email: string }) => x.name + ' (' + x.email + ' )';
  formatter = (x: { name: string, email: string }) => x.name;
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.productService.findSeller({ name: term }).then((res) => {
          if (res) {
            this.searchFailed = false;
            this.searching = false;
            return res.data.items;
          }
          this.searchFailed = true;
          this.searching = false;
          return of([]);
        })
      )
    )

  public Editor = ClassicEditor;
  public ckEditorConfig : any;
    

  constructor(private router: Router, private categoryService: ProductCategoryService,
    private productService: ProductService, private toasty: ToastrService, private location: LocationService,
    private translate: TranslateService, private mediaService: MediaService, private shopService: ShopService,
    private commonService: ComonService) {
    this.ckEditorConfig = this.mediaService.config;
  }

  ngOnInit() {
    this.productCreateTitleModel = ProductCreateTitle[0];
    this.fileOptions = {
      url: window.appConfig.apiBaseUrl + '/media/files',
      onFinish: (resp) => {
        this.product.digitalFileId = resp.data._id;
      }
    };
    this.location.countries().then((resp) => {
      this.countries = resp.data;
    });
    this.shopService.findKingCoffe().then(resp => {
      this.product.shopId = resp.data.items[0].id;
    })

    if (this.productService.allCountry.length > 0) {
      this.allCountry = this.productService.allCountry;
    } else {
      this.productService.getAllCountry()
      .then(resp => {
        this.allCountry = resp.data.country;
        this.productService.allCountry = resp.data.country;
      })
    }

    this.categoryService.tree()
      .then(resp => (this.tree = this.categoryService.prettyPrint(resp.data)));

  }

  submit(frm: any) {
    // if(this.product.isActive && this.deny) {
    //   return this.toasty.error('Không thể chọn đồng thời trạng thái "Kích hoạt" và "Từ chối"')
    // }
    if (!this.product.sap) {
      return this.toasty.error(this.translate.instant('Please enter SAP'));
    }

    // if (this.seller) {
    //   this.product.shopId = this.seller._id;
    // } else if (!this.seller) {
    //   return this.toasty.error(this.translate.instant('Please select Seller'));
    // }

    if (!this.product.name) {
      return this.toasty.error(this.translate.instant('Please enter product name'));
    }

    if (!this.product.alias) {
      return this.toasty.error(this.translate.instant('Alias cannot be empty'));
    }

    if (this.product.price == null) {
        return this.toasty.error(this.translate.instant('Please enter NTD Price'));
    }

    if (this.product.price < 0) {
        return this.toasty.error(this.translate.instant('NTD Price must be bigger than 0'));
    }

    if(!this.product.isPromotion && this.product.price == 0){
      return this.toasty.error(this.translate.instant('NTD Price must be bigger than 0')); 
    }

    if (!this.product.unitPrice) {
      return this.toasty.error(this.translate.instant('Please enter unit for NTD Price'));
    }

    if (this.product.salePrice == null) {
        return this.toasty.error(this.translate.instant('Please enter Sale Price'));
    }

    if (this.product.salePrice < 0) {
        return this.toasty.error(this.translate.instant('Sale Price must be bigger than 0'));
    } 

    if(!this.product.isPromotion && this.product.salePrice == 0){
      return this.toasty.error(this.translate.instant('Sale Price must be bigger than 0'));
    }

    if (!this.product.unitSalePrice) {
      return this.toasty.error(this.translate.instant('Please enter unit for Sale Price'));
    }

    if (!this.product.lang) {
      return this.toasty.error(this.translate.instant('Please enter your language'));
    }

    if (!this.product.sku) {
      return this.toasty.error(this.translate.instant('Please enter sku!'));
    }

    if (this.product.weight <= 0) {
      return this.toasty.error(this.translate.instant('Weight must be bigger than 0'));
    }

    if (!this.product.weight) {
      return this.toasty.error(this.translate.instant('Please enter product weight'));
    }

    if (!this.product.packingSpecifications) {
      return this.toasty.error(this.translate.instant('Please enter package method'));
    }

    if (!this.product.producer) {
      return this.toasty.error(this.translate.instant('Please enter producer'));
    }

    if (!this.product.expiryDate) {
      return this.toasty.error(this.translate.instant('Please enter expiry date'));
    }

    if (!this.product.country) {
      return this.toasty.error(this.translate.instant('Please select country'));
    }

    if (this.product.isActive) {
      this.product.status = 1;
    } else if (this.deny) {
      this.product.status = 3;
    } else {
      this.product.status = 2;
    }

    // if (this.product.configs.tradeDiscountGoldtime === "") {
    //   return this.toasty.error('Vui lòng nhập chiết khấu cho GoldTime');
    // }

    // if (this.product.configs.tradeDiscountGoldtime < 0 || this.product.configs.tradeDiscountGoldtime > 50) {
    //   return this.toasty.error("Vui lòng nhập Chiết khấu cho Gold Time từ 0-50%");
    // }

    if (frm.invalid) {
      return this.toasty.error(this.translate.instant('Invalid form, please check again.'));
    }

    // if (this.product.dailyDeal && this.dealDate) {
    //   this.product.dealTo = new Date(this.dealDate.year, this.dealDate.month - 1, this.dealDate.day).toUTCString();
    // }
    this.freeShipAreas.forEach((item) => {
      const data = _.pick(item, ['areaType', 'value', 'name']);
      this.product.restrictFreeShipAreas.push(data);
    });
    this.product.images = this.images.map(i => i._id);
    this.product.mainImage = this.mainImage || null;

    // if (this.product.type === 'digital' && !this.product.digitalFileId) {
    //   return this.toasty.error(this.translate.instant('Please select Digital file path!'));
    // }
    if (this.product.categoryId === '') {
      return this.toasty.error(this.translate.instant('Please enter category name'));
    }

    var powerby = this.product.description.toLowerCase().lastIndexOf(`powered by`);
    var name = this.product.description.toLowerCase().lastIndexOf(`title="froala editor"`);
    if (powerby > 0 && name > 0) {
      var begin = this.product.description.lastIndexOf("<p");
      this.product.description = this.product.description.slice(0, begin);
    }

    // this.product.isTradeDiscount = false;

    this.productService.create(this.product)
      .then(resp => {
        this.toasty.success(this.translate.instant('Product has been created'));
        this.router.navigate(['/products', { queryParams: { tab: 'spec' } }]);
      })
      .catch(e => this.toasty.error(this.translate.instant(e.data.message || 'Lỗi hệ thống'))); // TODO - implement me
  }

  changeAlias() {
    this.product.alias = this.commonService.generateAlias(this.product.name.toLowerCase());
  }

  addSpecification() {
    if (!this.newSpecification.value.trim()) {
      return this.toasty.error(this.translate.instant('Please enter specification value'));
    }
    this.product.specifications.push(this.newSpecification);
    this.newSpecification = { key: '', value: '' };
  }

  selectImage(media: any) {
    // this.product.mainImage = media._id;
    // this.imageUrl = media.fileUrl;
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image!'));
    }

    this.images.push(media);
  }

  // selectDigital(media: any) {
  //   this.product.digitalFileId = media._id;
  // }

  setMain(media: any) {
    this.mainImage = media._id;
  }

  removeImage(media: any, index: any) {
    if (media._id === this.mainImage) {
      this.mainImage = null;
    }
    this.images.splice(index, 1);
  }

  changeTab(tab: string) {
    this.tab = tab;
  }

  loadStates(COD: any) {
    this.location.states({ country: COD }).then((res) => {
      this.states = res.data;
    });
  }

  loadCities(id: any) {
    this.location.cities({ state: id }).then((res) => {
      this.cities = res.data;
    });
  }

  addFreeShipAreas() {
    if (this.zipCode) {
      const data = {
        areaType: 'zipcode',
        value: this.zipCode
      };
      this.freeShipAreas.push(data);
      this.zipCode = '';
    } else if (!this.zipCode && this.freeCountry && !this.freeState) {
      const data = {
        areaType: 'country',
        value: this.freeCountry.isoCode,
        name: this.freeCountry.name
      };
      this.freeShipAreas.push(data);
      this.freeCountry = {};
    } else if (!this.zipCode && this.freeCountry && this.freeState && !this.freeCity) {
      const data = {
        areaType: 'state',
        value: this.freeState._id,
        name: this.freeState.name
      };
      this.freeShipAreas.push(data);
      this.freeState = {};
    } else if (!this.zipCode && this.freeCountry && this.freeState && this.freeCity) {
      const data = {
        areaType: 'city',
        value: this.freeCity._id,
        name: this.freeCity.name
      };
      this.freeShipAreas.push(data);
      this.freeCity = {};
    }
  }

  addRestrictCODAreas() {
    if (this.restrictCODAreas) {
      this.product.restrictCODAreas.push(this.restrictCODAreas);
      this.restrictCODAreas = '';
    }
  }

  removeArea(index: number) {
    this.freeShipAreas.splice(index, 1);
  }

  removeCodeArea(index: number) {
    this.product.restrictCODAreas.splice(index, 1);
  }

  removeSpec(i: number) {
    this.product.specifications.splice(i, 1);
  }
  changeWeight() {
    if (this.product.weight < 100) {
      return this.toasty.error('Vui lòng nhập khối lượng 100g trở lên');
    }
  }

  updateDealTime() {
    this.product.dealTo = new Date(this.dealDate.year, this.dealDate.month - 1, this.dealDate.day);
  }

  isEventChecked() {
    if (this.product.fiveElement) {
      this.product.weight = 100;
      this.searching = true;
      this.productService.findMyShop().then((res) => {
        this.searchFailed = true;
        if (res.data) {
          this.searchFailed = false;
          this.seller = res.data;
        }

        this.searching = false;
        if (this.searchFailed == true)
          this.toasty.error(this.translate.instant('Cant find shop for current admin'));
      })
        .catch(err => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
    }
  }

  onValidateDiscount(value: any) {
    this.product.goldTimeDiscount = value.toFixed(1);
  }

  checkDecimalNumber(event:any){
    const pattern = new RegExp(/^\d{0,2}\.{0,1}(\d{1})?$/);
    if(!this.product.configs.tradeDiscountGoldtime)
    this.product.configs.tradeDiscountGoldtime="";

    if(parseFloat(this.product.configs.tradeDiscountGoldtime + event.key) > 50){
      return event.preventDefault();
    }

    if (!pattern.test(this.product.configs.tradeDiscountGoldtime + event.key)) {
      if(event.keyCode == 8) {
        this.product.configs.tradeDiscountGoldtime="";
      }
      if(!((event.keyCode == 8) || (37<= event.keyCode && event.keyCode <= 40) || (event.keyCode == 46) || (16 <= event.keyCode && event.keyCode <= 17) || (event.keyCode == 67) || (event.keyCode == 86))) {
        event.preventDefault();
      }
    }
  }
}
