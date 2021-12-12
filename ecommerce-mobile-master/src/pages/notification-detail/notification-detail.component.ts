import { Component, OnInit } from '@angular/core';
import { ProductListingComponent } from '../products';
import { ToastyService, AuthService, CartService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { isNil, isNull, isArray, isEmpty } from 'lodash';
import { NotificationService } from '../../services/notification.service';
import { NavController, NavParams } from 'ionic-angular';
import { PromotionForm } from '../../app/enums';
import { CheckoutComponent } from '../cart/components/checkout/checkout.component';

@Component({
  selector: 'notification-detail',
  templateUrl: 'notification-detail.html',
})
export class NotificationDetailComponent implements OnInit {
  id;
  dataNotification;
  applyRole;
  areaApply;
  promotionProducts = [];
  typePromotion = false;
  constructor(
    private toasty: ToastyService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    public nav: NavController,
    private navParams: NavParams,
    private cartService: CartService
  ) {
    this.id = this.navParams.data;
  }

  async ngOnInit() {
    await this.query();
  }
  async query() {
    const params = {
      id: this.id,
    };

    this.notificationService
      .readNotification(params)
      .then((res) => {
        this.dataNotification = res.data.notifyItem;
        // if (!isNil(res.data.promotion)) {
        //   this.applyRole = res.data.promotion.applyRole
        //     .map((item) => item.roleName)
        //     .toString();
        //   // this.areaApply = res.data.promotion.areaApply
        //   //   .map((item) => item.name)
        //   //   .toString();
        //   if (
        //     (res.data.promotion.promotionForm ===
        //       PromotionForm.CheckoutPercentOrMoneyDiscount &&
        //       !res.data.promotion.checkoutPercentOrMoneyDiscount
        //         .orderQuantity) ||
        //     (res.data.promotion.promotionForm ===
        //       PromotionForm.CheckoutDiscount &&
        //       !res.data.promotion.checkoutDiscount.orderQuantity)
        //   ) {
        //     this.typePromotion = true;
        //   }
        //   if (
        //     !isEmpty(
        //       res.data.promotion.checkoutPercentOrMoneyDiscount
        //         .promotionProducts
        //     )
        //   ) {
        //     this.promotionProducts =
        //       res.data.promotion.checkoutPercentOrMoneyDiscount.promotionProducts;
        //   }
        //   if (!isEmpty(res.data.promotion.checkoutDiscount.promotionProducts)) {
        //     this.promotionProducts =
        //       res.data.promotion.checkoutDiscount.promotionProducts;
        //   }
        // }
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }
  async order() {
    if (!isEmpty(this.promotionProducts)) {
      const list_product = [];
      for (const detail of this.promotionProducts) {
        const product_ = {
          productId: detail.product._id,
          quantity: detail.quantity,
        };
        list_product.push(product_);
        await this.cartService.add(
          {
            productId: detail.product._id,
            productVariantId: undefined,
            product: detail.product,
          },
          detail.quantity
        );
      }
    }
    return this.nav.setRoot(CheckoutComponent);
  }
}
