import { Component, OnInit } from '@angular/core';
import { AuthService, CartService, OrderService } from '../../../../services';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { RefundModalComponent } from '../refundModal/refund-modal.component';
import { OrderTrackingComponent } from '../order-tracking/order-tracking.component';
import {
  OrderLogStatus,
  OrderStatus,
  PromotionForm,
} from '../../../../app/enums';
import { CheckoutComponent } from '../../../cart/components';
import { isNil, isEmpty } from 'lodash';

@Component({
  selector: 'order-view',
  templateUrl: './view.html',
})
export class OrderViewComponent implements OnInit {
  isSubmitted = false;
  order: {
    _id;
    promotions;
    orderStatus;
    details;
    shippingPrice;
    percentDiscount;
    transaction;
    lastName;
    firstName;
    phoneNumber;
    streetAddress;
    city;
    district;
    ward;
    zipCode;
  };
  details = [];
  lastestProgress;
  OrderStatus = OrderStatus;
  totalPromotionDiscountPrice = 0;
  statusText;
  status = [
    { name: 'ordered', value: 'Đặt hàng thành công' },
    { name: 'canceled', value: 'Đơn hàng đã bị huỷ' },
    { name: 'processing', value: 'Đang xử lý đơn hàng' },
    { name: 'handedOver', value: 'Đóng gói & Bàn giao vận chuyển' },
    { name: 'shipping', value: 'Đang vận chuyển' },
    { name: 'successDelivered', value: 'Giao hàng thành công' },
    { name: 'failDelivered', value: 'Giao hàng thất bại' },
    { name: 'failOrdered', value: 'Đặt hàng thất bại' },
  ];

  dataInfo: {
    products;
    shipmentTypeId;
    toHubId;
    shippingPrice;
    percentDiscount;
    transportation;
    paymentMethod;
    firstName;
    lastName;
    phoneNumber;
    streetAddress;
    city;
    district;
    ward;
    zipCode;
    returnUrl;
  };

  extraProducts = [];
  totalExtraProductsPrice = 0;
  isShowDiscountPercent = false;
  isShowShippingPrice = false;
  isShowShippingDiscount = false;
  shippingPrice = 0;
  totalPrice = 0;


  constructor(
    private orderService: OrderService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    public nav: NavController,
    private cartService: CartService,
    private auth: AuthService
  ) {
    const role = auth.getRoleId();
    if (role === '3') {
      this.status.splice(1, 0, { name: 'confirmed', value: 'TNI tiếp nhận' });
    }
  }

  async ngOnInit() {
    await this.orderService.findOne(this.navParams.data).then(async (res) => {
      if (res.data) {
        this.order = res.data;
        // calculate total promotion discount price
        if (this.order.promotions && this.order.promotions.length > 0) {
          let total = this.order.promotions
            .filter(
              (x) => x.promotionOrder.promotionForm !== PromotionForm.FreeShip
            )
          if(!isEmpty(total)) {
            total = total.reduce(
              (
                totalDiscountPrice: { discountPrice },
                prom: { discountPrice }
              ) => totalDiscountPrice.discountPrice + prom.discountPrice
            );
            this.totalPromotionDiscountPrice = total ? total.discountPrice : 0;
          }
        }
        this.details = res.data.details;
        let i = 0;
        this.totalPrice = this.details.reduce((n, { totalPrice }) => n + totalPrice, 0)
        for (const detail of this.details) {
          // Tách sản phẩm mua ưu đãi khỏi order detail
          const prom = detail.promotions.find(
            (x) =>
              x.promotionOrder.promotionForm ===
              PromotionForm.BuyGoodPriceProduct
          );
          if (prom) {
            this.details.splice(i, 1);
            this.extraProducts.push(detail);
            this.totalExtraProductsPrice = detail.totalPrice;
          }

          const currencyExchange = detail.currencyExchangeRate || 1;
          detail.taxPrice = currencyExchange * (detail.taxPrice || 0);
          detail.shippingPrice = currencyExchange * (detail.shippingPrice || 0);
          i++;
        }
        for (const promotion of this.order.promotions) {
          if (promotion.discountPercent > 0) {
            this.isShowDiscountPercent = true;
          }
          if (
            promotion.promotionOrder.freeShip.shippingPriceDiscount > 0 &&
            this.order.shippingPrice === 0
          ) {
            this.isShowShippingPrice = true;
            if(promotion.discountPrice < promotion.promotionOrder.freeShip.shippingPriceDiscount) {
              this.shippingPrice = promotion.discountPrice;
            } else {
              this.shippingPrice = promotion.promotionOrder.freeShip.shippingPriceDiscount;
            }
          }
          if (
            promotion.promotionOrder.freeShip.shippingPriceDiscount > 0 &&
            this.order.shippingPrice > 0
          ) {
              this.shippingPrice = promotion.promotionOrder.freeShip.shippingPriceDiscount;
              this.order.shippingPrice = this.order.shippingPrice + promotion.discountPrice;
          }
          if (promotion.promotionOrder.freeShip.shippingPriceDiscount > 0) {
            this.isShowShippingDiscount = true;
          }
        }
      }
    });
    this.status.forEach((x) => {
      if (x.name === this.order.orderStatus) {
        this.statusText = x.value;
      }
    });
    await this.getOrderProgressList();
  }

  openRefund(item) {
    const modalRef = this.modalCtrl.create(RefundModalComponent, {
      orderDetailId: item._id,
    });
    return modalRef.present();
  }

  openOrderTracking(item) {
    return this.nav.push(OrderTrackingComponent, { order: item });
  }

  async order_again() {
    const order = this.order;
    if (order) {
      const list_product = [];
      for (const detail of order.details) {
        const product_ = {
          productId: detail.productId,
          quantity: detail.quantity,
        };
        list_product.push(product_);
        await this.cartService.add(
          {
            productId: detail.productId,
            productVariantId: undefined,
            product: detail.product,
          },
          detail.quantity
        );
      }

      this.dataInfo = {
        products: list_product,
        shipmentTypeId: 1,
        toHubId: 3,
        shippingPrice: order.shippingPrice,
        percentDiscount: order.percentDiscount,
        transportation: {
          id: 6,
          name: 'Giao Hàng Nhanh',
        },
        paymentMethod: order.transaction
          ? order.transaction.paymentGateway
          : undefined,
        firstName: order.firstName,
        lastName: order.lastName,
        phoneNumber: order.phoneNumber,
        streetAddress: order.streetAddress,
        city: order.city,
        district: order.district,
        ward: order.ward,
        zipCode: order.zipCode,
        returnUrl: '',
      };
    }
    return this.nav.push(CheckoutComponent, this.dataInfo);
  }

  async getOrderProgressList() {
    if (this.order) {
      return this.orderService
        .getOrderLog({
          orderId: this.order._id,
          eventType: OrderLogStatus.OrderStatus,
        })
        .then((resp) => {
          if (resp) {
            this.lastestProgress = resp.data[resp.data.length - 1];
          }
        });
    }
  }
}
