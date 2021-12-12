import { Component, OnInit } from '@angular/core';
import { ProductCategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { LocationService } from '../../shared/services';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductCreateTitle, ProductCreateTitleModel } from '../../model/product.create.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import * as ClassicEditor from '../../../assets/ckeditor/ckeditor';
import { MediaService } from '../../media/service';
import { ComonService } from '../../utils/services/comon.service';

@Component({
  selector: 'product-update',
  templateUrl: './form.html'
})
export class ProductUpdateComponent implements OnInit {
  productCreateTitleModel: ProductCreateTitleModel;
  public product: any;
  public tree: any = [];
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
  public countries: any = [];
  public states: any = [];
  public cities: any = [];
  public zipCode: any = '';
  public freeCountry: any;
  public freeState: any;
  public freeCity: any;
  public dealDate: any;
  public imagesOptions: any = {
    multiple: true
  };
  public isUpdate: any = true;
  public fileOptions: any = {};
  public deny:boolean = false;
  public allCountry: any = [];

  public Editor = ClassicEditor;
  public ckEditorConfig : any;

  constructor(private router: Router, private route: ActivatedRoute, private categoryService: ProductCategoryService,
    private productService: ProductService, private toasty: ToastrService, private location: LocationService,
    private translate: TranslateService, private mediaService: MediaService, private commonService: ComonService) {
    if (route.snapshot.queryParams.tab) {
      this.tab = route.snapshot.queryParams.tab;
    }

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
    const id = this.route.snapshot.paramMap.get('id');
    this.productService.findOne(id)
      .then(resp => {
        this.product = resp.data;
        if(this.product.status === 3) {
          this.deny = true;
        }
        this.freeShipAreas = resp.data.restrictFreeShipAreas;
        this.mainImage = resp.data.mainImage ? resp.data.mainImage._id : null;
        this.images = this.product.images;
        if (this.product.dealTo) {
          const date = new Date(this.product.dealTo);
          this.dealDate = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
          };
        }
      });
    this.categoryService.tree()
      .then(resp => (this.tree = this.categoryService.prettyPrint(resp.data)));

    this.location.countries().then((resp) => {
      this.countries = resp.data;
    });

    if (this.productService.allCountry.length > 0) {
      this.allCountry = this.productService.allCountry;
    } else {
      this.productService.getAllCountry()
      .then(resp => {
        this.allCountry = resp.data.country;
        this.productService.allCountry = resp.data.country;
      })
    }
  }

  submit(frm: any) {

    if (!this.product.sap) {
      return this.toasty.error(this.translate.instant('Please enter SAP'));
    }

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

    if (frm.$invalid) {
      this.toasty.error(this.translate.instant('Invalid form, please check again.'));
    }

    // if (this.product.dailyDeal && this.dealDate) {
    //   this.product.dealTo = new Date(this.dealDate.year, this.dealDate.month - 1, this.dealDate.day).toUTCString();
    // }

    // if (this.product.type === 'digital' && !this.product.digitalFileId) {
    //   return this.toasty.error(this.translate.instant('Please select Digital file path!'))
    // }

    if (this.product.categoryId === '') {
      return this.toasty.error(this.translate.instant('Please enter category name'));
    }
    
    // if (this.product.configs.tradeDiscountGoldtime === "") {
    //   return this.toasty.error('Vui lòng nhập chiết khấu cho GoldTime');
    // }

    // if (this.product.configs.tradeDiscountGoldtime < 0 || this.product.configs.tradeDiscountGoldtime > 50) {
    //   return this.toasty.error("Vui lòng nhập Chiết khấu cho Gold Time từ 0-50%");
    // }

    this.product.restrictFreeShipAreas = [];
    this.freeShipAreas.forEach((item) => {
      const data = _.pick(item, ['areaType', 'value', 'name']);
      this.product.restrictFreeShipAreas.push(data);
    });
    this.product.images = this.images.map(i => i._id);
    this.product.mainImage = this.mainImage || null;

    var powerby = this.product.description.toLowerCase().lastIndexOf(`powered by`);
    var name = this.product.description.toLowerCase().lastIndexOf(`title="froala editor"`);
    if (powerby > 0 && name > 0) {
      var begin = this.product.description.lastIndexOf("<p");
      this.product.description = this.product.description.slice(0, begin);
    }

    // this.product.isTradeDiscount = false;

    this.productService.update(this.product._id, this.product).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfully.'));
      this.router.navigate(['/products']);
    }).catch(e => this.toasty.error(this.translate.instant(e.data.message || 'Lỗi hệ thống'))); // TODO - implement me;
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
    if (media.type !== 'photo') {
      return this.toasty.error(this.translate.instant('Please select image!'));
    }

    this.images.push(media);
  }

  setMain(media: any) {
    this.mainImage = media._id;
  }

  // selectDigital(media: any) {
  //   this.product.digitalFileId = media._id;
  // }

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
