import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { App, AlertController,NavParams, NavController } from 'ionic-angular';
import {
  ProductService,
  ProductVariantService,
  AuthService,
  WishlistService,
  CartService,
  ToastyService,
  WeErrorHandler,
} from '../../../services';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';
import { ImageViewerController } from 'ionic-img-viewer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { LoginComponent } from '../../auth';
import { CheckoutComponent } from '../../cart/components';
import { LocalStorgeService } from '../../../services/local-storge.service';
import { UserRoles, PromotionForm } from '../../../app/enums';
import { isNil, isEmpty } from 'lodash';
import { ProductListingComponent } from '../listing/product-listing.component';
import { ProductListService } from '../../../services/productList.service';
import { AccountService } from '../../../services/account.service';
// import { SettingsPage } from '../../settings/settings';
import {NotificationComponent} from '../../notification/notification.component';
// import { LoginComponent } from '../../auth/login/login.component';

@Component({
  selector: 'page-productd',
  templateUrl: './detail.html',
})
export class ProductDetailComponent  {
  product;
  list = [];
  searchFields = {
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
  clearInterVal;
  countDownTimer = {
    hour: 10,
    minute: 0,
    second: 0
  };
  variants = [];
  listRecommend = [];
  selectedVariant: {
    productId;
    _id;
  };
  price = 0;
  salePrice = 0;
  priceDiscount = 0;
  percentDiscount = 0;
  discountVal: string;
  stockQuantity = 0;
  isVariant = false;
  tab = 'infomation';
  quantity = 1;
  roleId ;
  isLoggedIn = this.authService.isLoggedin();
  currentUser: {
    userRoles;
    inventoryId;
  };
  loadRecommend = true;
  isLoading = true;
  isShowCountdown = false;
  constructor(
    private navParams: NavParams,
    private productService: ProductService,
    private variantService: ProductVariantService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private toasty: ToastyService,
    private cartService: CartService,
    private socialSharing: SocialSharing,
    private translate: TranslateService,
    private localStore: LocalStorgeService,
    private imageViewerCtrl: ImageViewerController,
    private ga: GoogleAnalytics,
    private nav: NavController,
    private productListService: ProductListService,
    private errorHandler: WeErrorHandler,
    private accountService: AccountService,
    public alertCtr: AlertController,
    private app: App,
    private cd: ChangeDetectorRef,
  ) {}

  async ionViewWillEnter() {
    // this.logoutWE()
    if (this.isLoggedIn) {
      await this.authService
        .getCurrentUser()
        .then((res) => (this.currentUser = res));
    }
    this.roleId =  this.authService.getRoleId();
    const alias = this.navParams.data.alias;
    await this.productService.find(alias).then(async (res) => {
      this.isLoading = false;
      this.product = res;
      if (res.shop && res.shop.gaCode) {
        await this.ga.startTrackerWithId(res.shop.gaCode);
        await this.ga.trackView('Track product');
      }
      this.setPrice(res);
      await this.getVariants(res._id);
      this.countDown();
    });
    await this.listRecommendProduct();
  }

  // async ngOnInit() {
  
  // }
  async listRecommendProduct() {
    let list = [];
    if (!isNil(this.product)) {
      const productId = this.product.id;
      await this.productService.related(productId,{}).then(async (res) => {
        list = res.data;
      });
      this.list = list;
      if (!isEmpty(list)) {
        this.listRecommend = list.slice(0,3);
        this.loadRecommend = false;
        if (list.length <= 3) {
          this.listRecommend = [...list];
        }
        if (list.length > 3 && list.length <= 6) {
          let start = 3;
          let end = 6;
          this.clearInterVal = setInterval(() => {
            if(end === 6) {
              this.listRecommend = list.slice(start, end);
              start = 0;
              end = 3;
            }
            else {
              this.listRecommend = list.slice(start, end);
              start += 3;
              end += 3;
            }
          }, 3000);
        }
        if (list.length > 6) {
          let start = 3;
          let end = 6;
          this.clearInterVal = setInterval(() => {
            if(end === 9) {
              this.listRecommend = list.slice(start, end);
              start = 0;
              end = 3;
            }
            else {
              this.listRecommend = list.slice(start, end);
              start += 3;
              end += 3;
            }
          }, 3000);
        }
      }
    }
  }
  async changeQuantity(change) {
    if (change) {
      this.quantity++;
    } else {
      this.quantity--;
    }
    if (this.quantity < 1) {
      this.quantity = 1;
    }
  }

  getVariants(productId) {
    return this.variantService.search(productId, { take: 100 }).then((resp) => {
      this.variants = resp.data.items;
    });
  }

  viewImg(img) {
    const imageViewer = this.imageViewerCtrl.create(img);
    return imageViewer.present();
  }

  selectBase(product) {
    this.isVariant = false;
    this.setPrice(product);
  }

  selectVariant() {
    this.isVariant = true;
    this.setPrice(this.selectedVariant);
  }
  onKey(event) {
    if(parseInt(event.target.value) === 0) {
      this.quantity = 1;
    }
    if(event.target.value < 0) {
      this.quantity = Math.abs(event.target.value);
    }
  }
  countDown() {
    const timer = setInterval(() => {
      if (!isEmpty(this.product.promotions)) {
        const countTime =
          new Date(this.product.promotions[0].endDate.toString()).getTime() /
            1000 -
          new Date().getTime() / 1000;
        if (countTime > 0) {
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
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }

  setPrice(product) {
    const vatSalePrice = this.product.taxPercentage
      ? (product.salePrice * this.product.taxPercentage) / 100
      : 0;
    const vatBasePrice = this.product.taxPercentage
      ? (product.price * this.product.taxPercentage) / 100
      : 0;
    const checkProductForm = product.promotions.find(
      (x) => x.promotionForm === PromotionForm.ProductDiscount
    );
    if (checkProductForm) {
      const checkProductDiscount = checkProductForm.productDiscount.find(
        (y) => y.productId === product._id
      );
      if (checkProductDiscount) {
        this.priceDiscount =
          product.salePrice -
          (product.salePrice * checkProductDiscount.discountPercent) / 100;
        this.percentDiscount = checkProductDiscount.discountPercent;
      }
    }
   
    this.price = product.price + vatBasePrice || 0;
    this.salePrice = product.salePrice + vatSalePrice || 0;
    this.discountVal = !isNaN(this.price)
      ? (((this.price - this.salePrice) / this.price) * 100).toFixed(2)
      : '0';
    this.stockQuantity = product.stockQuantity;

  }

  async addCart(check) {
    if (this.authService.isLoggedin()) {
      const isMember = await this.authService.isMember();
      if (this.currentUser.userRoles.find((x) => x.Role === UserRoles.Admin)) {
        return this.toasty.error(
          this.translate.instant("Admin can't order product!")
        );
      }

      if (this.currentUser && this.currentUser.userRoles) {
        if (
          this.currentUser.userRoles.find(
            (x) => x.Role === UserRoles.WE || x.Role === UserRoles.WE_HOME || x.Role === UserRoles.WE_FREE
          )
        ) {
          if (!isMember) {
            return this.toasty.error('Bạn chưa là WE đại lý, vui lòng nạp 500k để kích hoạt tài khoản.'
              // this.translate.instant(
              //   'You are not a member yet, please top-up 500,000 đ!'
              // )
            );
          }
        }

        if (
          this.currentUser.userRoles.find((x) => x.Role === UserRoles.HUB) &&
          !this.currentUser.inventoryId
        ) {
          return this.toasty.error(
            this.translate.instant(
              'You must have inventory before buy product!'
            )
          );
        }

        if (
          this.currentUser.userRoles.find(
            (x) => x.Role === UserRoles.GENERALCONTRACTOR
          )
        ) {
          return this.toasty.error(
            this.translate.instant("GENERALCONTRACTOR can't order product!")
          );
        }
      }
      this.quantity = parseInt(`${this.quantity}`);
      await this.cartService.add(
        {
          productId: this.isVariant
            ? this.selectedVariant.productId
            : this.product._id,
          productVariantId: this.isVariant
            ? this.selectedVariant._id
            : undefined,
          product: this.product,
        },
        this.quantity
      );
      if (check) {
        return this.nav.push(CheckoutComponent);
      }
    } else {
      return this.nav.push(LoginComponent);
    }
  }

  changeTab(tab: string) {
    this.tab = tab;
  }
  updateFilter(id: string, type: string) {
    console.log('detail product')
    type === 'category'
      ? (this.searchFields.categoryId = id)
      : (this.searchFields.shopId = id);
    return this.nav.push(ProductListingComponent, this.searchFields);
  }
  shareSocial() {
    const prod = this.product;
    const prodWebUrl = window.appConfig.webUserUrl + '/products/' + prod.alias;
    return this.socialSharing.share(
      prod.shortDescription,
      prod.name,
      undefined,
      prodWebUrl
    );
  }
  ngOnDestroy () {
    if(!isNil(this.clearInterVal)) {
      clearInterval(this.clearInterVal);
    }
  }
  refresh() {
    this.cd.detectChanges();
  }
  async changeRole() {
      try {
        let token = localStorage.getItem('social_token');
        const res = await this.accountService.ChangeRoleToWe(token);
        if (res.StatusCode === 200) {
          const alert = this.alertCtr.create({
            title: '',
            subTitle:
              'Xin chúc mừng! Yêu cầu đăng ký trở thành Đại lý của bạn đã được chấp nhận',
            buttons: ['Đóng'],
          });
        
          await alert.present();
          this.logoutWE();
        } else {
          return this.toasty.error(res.Message);
        }
      } catch (error) {
      }
     
      
  }
  async logoutWE() {
    this.authService.logout();
    this.refresh();
    this.nav.push(LoginComponent);
    this.nav.push(NotificationComponent);
    return this.app.getActiveNav().parent.select(0);
  }
  
}

