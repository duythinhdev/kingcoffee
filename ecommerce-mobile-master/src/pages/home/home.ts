import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProductListingComponent } from '../products';
import {
  AuthService,
  CartService,
  ProductService,
  ToastyService,
  PromotionService,
  BannerService,
  CategoryService
} from '../../services';
import { TabsService } from '../../services/tabs.service';
import { StatusBar } from '@ionic-native/status-bar';
import { ProductListService } from '../../services/productList.service';
import { TranslateService } from '@ngx-translate/core';
import { PopupPromotionComponent } from '../popup/popup-promotion';
import { ModalController, NavParams, NavController, 
  Modal, Content, Events, App, IonicModule } from 'ionic-angular';
import { isNil, isNull, isEmpty, uniqBy } from 'lodash';
import { PromotionForm } from '../../app/enums';
import { PromotionPage } from '../promotion-tab/promotion-tab.component';
import { Subject } from 'rxjs';

import _ from 'lodash';
// import { IonicModule } from '@ionic/angular';
import { PromotionDetailsPage } from '../promotion-detail-list/promotion-detail-list.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements  OnDestroy {
  @ViewChild('header') header;

  productsPage = ProductListingComponent;
  clearInterVal;
  listItem = [];
  listProductDiscount = [];
  listSlide = [];
  shops = [];
  appConfig = {};
  isLoading = false;
  items = [];
  itemsNews = [];
  page = 1;
  itemsPerPage = 12;
  itemPromotions = [];
  searchFields = {
    bestSell: '',
    categoryId: '',
    dailyDeal: '',
    discounted: '',
    featured: '',
    hot: '',
    q: '',
    shopId: '',
    soldOut: '',
    sort: 'createdAt',
    sortType: 'desc',
    page: 1,
    take: 15,
  };
  searchFieldsnew: {
    q: string;
    categoryId: string;
    shopId: string;
    featured: string;
    hot: string;
    bestSell: string;
    dailyDeal: string;
    soldOut: string;
    discounted: string;
    page?: number;
  };

  searchFieldsMore = {
    q: '',
    categoryId: '',
    shopId: '',
    featured: '',
    hot: '',
    bestSell: '',
    dailyDeal: '',
    soldOut: '',
    discounted: '',
  };
  sort = 'createdAt';
  sortType = 'desc';
  sortPriceType = '';
  sortTimeType = 'desc';
  slideOptss = {
    initialSlide: 1,
    speed: 400
  };
  searchFieldPromotions = {
    bestSell: '',
    categoryId: '',
    dailyDeal: '',
    discounted: '',
    featured: '',
    hot: '',
    q: '',
    shopId: '',
    soldOut: '',
    sort: 'createdAt',
    sortType: 'desc',
    page: 1,
    take: 3,
  };
  total = 0;
  totalShop = 0;
  loadingShop = false;
  collapsed = false;
  filterShops;
  scrollHeight = 0;
  show = false;
  slideOpts = {
    slidesPerView: 3,
  };
  popUpChanged = new Subject();
  popUpChanged$ = this.popUpChanged.asObservable();
  isShowPopup = false;
  randomPromotion: any;
  promotionName = '';
  isShowCountdown = false;
  countDownTimer = {
    hour: 11,
    minute: 0,
    second: 0
  }
  promotionTypeId: any;
  promotionHome: any;
  promotionDetails: any;
  promotionDetailsShow: any;
  tree = [];
  nameCatagory = [];
  nameCat:any;
  itemsNewsTotals = [];
  listTree = [];
  listItems = [];
  listShowItem = [];
  @ViewChild('content') content: Content;

  constructor(
    private productService: ProductService,
    private tabsService: TabsService,
    private authService: AuthService,
    private cartService: CartService,
    private statusBar: StatusBar,
    
    private productListService: ProductListService,
    private toasty: ToastyService,
    private translate: TranslateService,
    public modalCtrl: ModalController,
    private navParams: NavParams,
    private promotionService: PromotionService,
    public nav: NavController,
    private bannerService: BannerService,
    public events: Events,
    private app: App,
    public categoryService:CategoryService,
  
  ) {
    if(this.app.getActiveNav().parent.parent){
      this.app.getActiveNav().parent.select(0);
     
    }
    // this.uniqueDeviceID.get()
    // .then((uuid: any) => console.log(uuid))
    // .catch((error: any) => console.log(error));

    this.tabsService.show();
    // this.loadDataOfPopup();
    events.subscribe('home:scrollToTop', () => {
      if(this.content && this.content.scrollTop > 0){
        this.content.scrollTo(0, 0, 500);
      }
    });
  }
  async ionViewWillEnter() { 
    
    this.nameCatagory = [];
    this.listShowItem = [];
    this.productListService.productListChanged.subscribe(async () => {
      await this.query();
    });
    await this.query();
    await this.queryPromotion();
    let a = await this.load_categories();
    this.listTree = this.nameCatagory;
    this.listItems = this.listShowItem;
    // console.log( this.listItems[0].category.name);
    // this.listItems.forEach(element => {
    //   console.log(element)
    // });
    this.isLoading = false;
    // if (!this.authService.isLoggedin()) {
    //   await this.cartService.clean();
    // }
  }

  loadDataOfPopup(){
     if (!isNil(this.navParams.data.popup)) {
      this.bannerService.random({
        isActive: true,
        position: 'banner-popup-promotion'
      })
      .then(async res => {
        if(!isEmpty(res.data)) {
          this.isShowPopup = true;
          this.randomPromotion = res.data[Math.floor(Math.random() * res.data.length)];
          this.presentModal();
        }
      })
      .catch(err => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      })
      
    }
    
  }

  async presentModal() {
    const modal = this.modalCtrl.create(PopupPromotionComponent, {
      cssClass: 'select-modal',
      randomPromotion: this.randomPromotion,
      isShowPopup: this.isShowPopup
    });
    return modal.present();
  }



  async query() {
    this.isLoading = true;
    this.searchFields.page = 1;
    this.productService
      .search(this.searchFields)
      .then((res) => {
        this.isLoading = false;
        this.items = res.data.items;
        // console.log(this.items)
        this.total = res.data.count;
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
      this.checkPromotions();
  }
  
  async checkPromotions() {
    let getAllPromotions = await this.promotionService.promotionForUser();
    this.itemPromotions = getAllPromotions.data.items.filter(
      (item) => item.promotionForm === PromotionForm.ProductDiscount && item.promotionType.isDisplayHomePage
    );

    this.promotionHome = getAllPromotions.data.items.filter(
      (item) => item.promotionType.isDisplayHomePage
    );
    if(!isEmpty(this.promotionHome)) {
      this.promotionName = this.promotionHome[0].promotionType.name;
      this.countDown(this.promotionHome[0]);
    }
    if(!isEmpty(this.itemPromotions)) {
      this.itemPromotions.map((item) => {
        if (this.listProductDiscount.length <= 10) {
          item.productDiscount.forEach(x => x.product.promotions = [item]);
          this.listProductDiscount.push(...item.productDiscount);
        }
      });
    }

    if (!_.isEmpty(this.itemPromotions)) {
      this.listProductDiscount = this.listProductDiscount .sort((e1, e2) => {
        return e2.discountPercent - e1.discountPercent;
      });
    }

    if (!_.isEmpty(this.listProductDiscount)) {
      getAllPromotions.data.items = getAllPromotions.data.items.sort((e1, e2) => {
        return (
          new Date(e1.endDate).getTime() - new Date(e2.endDate).getTime()
        );
      });
    }

    if(this.listProductDiscount.length <= 10) {
      this.listItem = getAllPromotions.data.items.map((item) => {
        if(item.promotionType.isDisplayHomePage) {
          if (this.listProductDiscount.length <= 10) {
            if(item.promotionForm === PromotionForm.DiscountOrderForNewMember) {
              const products = item.discountOrderForNewMember.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.GiveSomeGiftForNewMember) {
              const products = item.giveSomeGiftForNewMember.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.CheckoutDiscount) {
              const products = item.checkoutDiscount.promotionProducts;
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.DiscountOrderFollowProductQuantity) {
              const products = item.discountOrderFollowProductQuantity.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.BuyGoodPriceProduct) {
              const products = item.buyGoodPriceProduct.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.OrderDiscount) {
              const products = item.orderDiscount.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.CheckoutPercentOrMoneyDiscount) {
              const products = item.checkoutPercentOrMoneyDiscount.promotionProducts.map(x => {
                return {product: x.product};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.GiveGiftForOrder) {
              const products = item.giveGiftForOrder.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.BonusProduct) {
              const products = item.bonusProducts.promotionProducts.map(x => {
                return {product: x.product};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
            if(item.promotionForm === PromotionForm.FreeShip) {
              const products = item.freeShip.promotionProducts.map(x => {
                return {product: x};
              });
              products.forEach(i => {
                i.product.promotions = [item];
              });
              this.listProductDiscount.push(...products);
            }
          }
        }
      });
      this.listProductDiscount = uniqBy(this.listProductDiscount, 'product._id');
    }
  }

  countDown(iterator) {
    const timer = setInterval(() => {
      this.isShowCountdown = false;
      const countTime =
        new Date(iterator.promotionType.endDate.toString()).getTime() /
          1000 -
        new Date().getTime() / 1000;
      if (countTime > 0) {
        this.countDownTimer = {
          hour: 0,
          minute: 0,
          second: 0,
        };
        this.countDownTimer.hour = Math.floor(countTime / 60 / 60);
        this.countDownTimer.minute = Math.floor(
          (countTime - this.countDownTimer.hour * 60 * 60) / 60
        );
        this.countDownTimer.second = Math.floor(
          countTime -
            this.countDownTimer.hour * 60 * 60 -
            this.countDownTimer.minute * 60
        );
        if (this.countDownTimer.hour <= 10) {
          this.isShowCountdown = true;
        }
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }
 
  async loadProductDiscount() {
    // return this.nav.push(PromotionDetailsPage, {promotionTypeId: this.promotionHome[0].promotionType._id});
    return this.nav.push(PromotionPage);
  }
  async doInfinite(event) {
    console.log('load more')
    this.searchFields.page += 1;
    this.productService
      .search(this.searchFields)
      .then((res) => {
        this.isLoading = false;
        this.items = this.items.concat(res.data.items);
        this.total = res.data.count;
        event.complete();
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  onScroll(event) {
    if(event){
      const transparent = (event.scrollTop * 100) / 57 / 100;
      const color = `rgba(242, 242, 242, ${transparent})`;
      this.header.navbar._elementRef.nativeElement.getElementsByClassName(
        'toolbar-background'
      )[0].style.background = color;
  
      const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
      const hex = `#${(
        (1 << 24) +
        (parseInt(rgba[0], 10) << 16) +
        (parseInt(rgba[1], 10) << 8) +
        parseInt(rgba[2], 10)
      )
        .toString(16)
        .slice(1)}`;
  
      this.statusBar.backgroundColorByHexString(hex);
      this.statusBar.styleDefault();
    }
  }

  ngOnDestroy() {
    this.statusBar.styleDefault();
    if(!isNil(this.clearInterVal)) {
      clearInterval(this.clearInterVal);
    }
    //this.events.unsubscribe('home:scrollToTop');
  }

  async queryPromotion() {
    this.isLoading = false;
    this.promotionService
      .productsOrderByPromotionType({promotionTypeId: this.promotionTypeId})
      .then((res) => {
        let promotionDetailsByType = res.data.map((item) => {
          item = {
            ...item,
            promotionProducts: item.promotionProducts.sort((e1, e2) => {
              return (e2.discountPercent ? e2.discountPercent : 0) - (e1.discountPercent ? e1.discountPercent : 0);
            })
          };
          return item;
        });
        let arr = [];
        this.promotionDetails = promotionDetailsByType[0];
        promotionDetailsByType.forEach(element => {
          element.promotionProducts.forEach(el => {
            arr.push(el)
          });
         
        });
        // console.log(arr)
        this.promotionDetailsShow = arr;
        

        this.countDownPromo();        
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }
  countDownPromo() {
    // if (this.promotionDetails) {
    //   const timer = setInterval(() => {
    //     this.promotionDetails.promotionType.isShowCountdown = false;
    //     const countTime =
    //       new Date(this.promotionDetails.promotionType.endDate.toString()).getTime() /
    //       1000 -
    //       new Date().getTime() / 1000;
    //     if (countTime > 0) {
    //       this.promotionDetails.promotionType.countDownTimer = {
    //         hour: 0,
    //         minute: 0,
    //         second: 0,
    //       };
    //       this.promotionDetails.promotionType.countDownTimer.hour = Math.floor(countTime / 60 / 60);
    //       this.promotionDetails.promotionType.countDownTimer.minute = Math.floor(
    //         (countTime - this.promotionDetails.promotionType.countDownTimer.hour * 60 * 60) / 60
    //       );
    //       this.promotionDetails.promotionType.countDownTimer.second = Math.floor(
    //         countTime -
    //         this.promotionDetails.promotionType.countDownTimer.hour * 60 * 60 -
    //         this.promotionDetails.promotionType.countDownTimer.minute * 60
    //       );
    //       if (this.promotionDetails.promotionType.countDownTimer.hour <= 10) {
    //         this.promotionDetails.promotionType.isShowCountdown = true;
    //       }
    //     } else {
    //       clearInterval(timer);
    //     }
    //   });
    // }
  }

  async load_categories() {
    return new Promise(resolve => {
        this.categoryService.tree().then(async (resp) => {
          this.tree = resp;
          let catagory = resp[0].children;
          for (let index = 0; index < catagory.length; index++) {
            const element = catagory[index];
            this.searchFields.categoryId = element._id;
            this.nameCatagory.push(element.name);
            let res = await this.queryListProduct(this.searchFields);
            if(index == (catagory.length - 1)){
              resolve('resolved');
            }
          }
         
        });
    });
  }
  async queryListProduct(event) {
    return new Promise(resolve => {
    this.isLoading = true;
    const params = {
      page: 1,
      take: this.itemsPerPage,
      sort: this.sort,                    
      sortType: this.sortType,
      ...event,
    };

    this.productService.search(params).then((res) => {
      this.isLoading = true;
      this.itemsNews = res.data.items;
      this.listShowItem.push(this.itemsNews);
      this.total = res.data.count;
       resolve(true); 
      // this.searchFields = this.searchFields;
    });
    });
  }
  async loadPromotionDetails(item: any) {
    // console.log('home product')
    let id = item[0].categoryId;
    this.searchFieldsMore.categoryId = id
    // return this.nav.push(ProductListingComponent, this.searchFieldsMore);
    // console.log(this.searchFieldsMore)
    this.productListService
      .onProductListChanged(this.searchFieldsMore)
      .catch((err) => {
        // console.log(err)
        // return this.errorHandler.handleError(err);
      });
  }
}
