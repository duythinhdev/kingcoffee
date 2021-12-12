import { Component, Input, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProductDetailComponent } from '../detail/detail.component';
import {
  AuthService,
  CartService,
  ToastyService,
  WishlistService,
} from '../../../services';
import { TranslateService } from '@ngx-translate/core';
import { LoginComponent } from '../../auth';
import { isNil, isEmpty } from 'lodash';
import { PromotionForm } from '../../../app/enums';
import { LocalStorgeService } from '../../../services/local-storge.service';

@Component({
  selector: 'promotion-card',
  templateUrl: 'promotion-card.html',
})
export class PromotionCard implements OnInit {
  @Input() discountPercent;
  @Input() product : {
    _id,
    taxPercentage,
    salePrice,
    price,
    promotions
  };
  @Input() showDeal = 0;
  @Input() isHome = false;
  isRole;
  price = 0;
  pre_price = 0;
  salePrice = 0;
  pre_salePrice = 0;
  isLoggedIn = this.authService.isLoggedin();
  promotionName = undefined;
  isShowPromotionName = false;
  constructor(
    private nav: NavController,
    private authService: AuthService,
    public toasty: ToastyService,
    public wishlistService: WishlistService,
    public translate: TranslateService,
    public cartService: CartService,
    public localstore: LocalStorgeService,
  ) {}

  ngOnInit() {
    this.isRole = this.localstore.get('role');
    if (this.product) {
      const vatSalePrice = this.product.taxPercentage
        ? (this.product.salePrice * this.product.taxPercentage) / 100
        : 0;
      const vatBasePrice = this.product.taxPercentage
        ? (this.product.price * this.product.taxPercentage) / 100
        : 0;
      this.price = this.product.price + vatBasePrice || 0;
      this.pre_price = this.product.price + vatBasePrice || 0;
      this.salePrice = this.product.salePrice + vatSalePrice || 0;
      this.pre_salePrice = this.product.salePrice + vatSalePrice || 0;
      if(!isEmpty(this.product.promotions)) {
        const productDiscount = this.product.promotions.filter(
          (item) => item.promotionForm === PromotionForm.ProductDiscount
        );
        if(!isEmpty(productDiscount)) {
          const productDiscountItem = productDiscount[0].productDiscount.filter(x => x.productId === this.product._id)
          this.discountPercent = productDiscountItem[0].discountPercent;
          this.promotionName = productDiscount[0].name;
          this.isShowPromotionName = true;
          if(!isNil(this.discountPercent)) {
            this.salePrice = this.product.salePrice + vatSalePrice - (this.product.salePrice + vatSalePrice)*this.discountPercent/100;
            this.price = this.product.price + vatSalePrice - (this.product.price + vatSalePrice)*this.discountPercent/100;
          }
        }else {
          const endDatePromotion = this.product.promotions[0].endDate;
          let promotionEndDate = this.product.promotions[0];
          for (const iterator of this.product.promotions) {
            if(iterator.endDate < endDatePromotion) {
              promotionEndDate = iterator;
            }
          }
          if(!isEmpty(promotionEndDate)) {
            this.promotionName = promotionEndDate.name;
            this.isShowPromotionName = true;
          }
        }
      }
    }
    this.isLoggedIn = this.authService.isLoggedin();
  }

  viewDetail(item) {
    return this.nav.push(ProductDetailComponent, { alias: item.alias });
  }

  addWishList(item) {
    this.wishlistService
      .create({ productId: item._id })
      .then((resp) => {
        return this.toasty.success(
          `${item.name} ${this.translate.instant(
            'has been added to your wishlist.'
          )}`
        );
      })
      .catch((err) =>
        this.toasty.error(
          this.translate.instant(
            err.data.data.message || 'Something went wrong, please try again.'
          )
        )
      );
  }

  async addCart(item) {
    if (!item.stockQuantity) {
      return this.toasty.error(this.translate.instant('Item is out of stock.'));
    }
    if (this.authService.isLoggedin()) {
      const isMember = await this.authService.isMember();
      if (isMember) {
        await this.cartService.add(
          {
            productId: item._id,
            productVariantId: undefined,
            product: this.product,
          },
          1
        );
      } else {
        return this.toasty.error(
          'Bạn chưa là WE đại lý, vui lòng nạp 500k để kích hoạt tài khoản.'
        );
      }
    } else {
      return this.nav.setRoot(LoginComponent);
    }
  }
}
