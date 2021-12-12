import { Component, OnInit } from '@angular/core';
import {
  NavController,
  NavParams,
  LoadingController,
  Loading,
} from 'ionic-angular';
import {
  CartService,
  SystemService,
  ToastyService,
  AuthService,
  CheckoutService,
} from '../../../../services';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProductListingComponent } from '../../../products';
import { isArray, isNil, isNull, map, isEmpty, minBy } from 'lodash';
import { AddressComponent } from '../../../profile/components';
import { LoginComponent } from '../../../auth';
import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
import { LocalStorgeService } from '../../../../services/local-storge.service';
import { TabsService } from '../../../../services/tabs.service';
import { PromotionService } from '../../../../services/promotion.service';
import {
  PromotionForm,
  ApplyCondition,
  GiveGiftType,
  DiscountType,
} from '../../../../app/enums';
import { HomePage } from '../../../home/home';
import { GiftNewMemberComponent } from '../gift-newmember/gift-newmember.component';
import { CheckoutDiscountOrderQuantityComponent } from '../checkout-discount-order-quantity/checkout-discount-order-quantity';
import { PreferentialProducts } from '../preferential-products/preferential-products.component';
import { GiftForOrderComponent } from '../give-for-order/gift-for-order';
import _ from 'lodash';

@Component({
  selector: 'page-cart',
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit {
  number;
  goodPercent;
  percentNew = 0;
  totalAfterpercentFirst = [];
  totalAfterOrder = [];
  totalOrderPriceCondition;
  GoodPriceProducts;
  sendDataGiftNewMember = [];
  sendDataGiftOrderQuantity = [];
  sendDataGiftOrder = [];
  listGiftCheckout = [];
  listGiftBonusProduct = [];
  giveGiftType = '';
  giveOrderGiftType = '';
  listGift = [];
  discountOrderFirst = [];
  discountOrderPercent = [];
  discountOrderNumber = [];
  discountPriceList = [];
  listPromotion = [];
  listProductsDiscountOrder = [];
  listGiftForNewbee = [];
  currentOrder;
  totalChange;
  listProductChange = [];
  listQuantity = [];
  listOrderDetail = [];
  listOrder = [];
  loading: Loading;
  cart;
  totalPrice = 0;
  totalTaxPrice = 0;
  totalShippingPrice = 0;
  userInfo = {
    paymentMethod: 'cod',
    userCurrency: '',
    lastName: '',
    firstName: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    telephoneNumber: '',
    address: '',
    city: '',
    ward: '',
    zipCode: '',
    district: '',
  };

  phoneNumber = {
    number: '',
  };
  isSubmitted = false;
  dialCode = '+84';
  codCode = '';
  orderId: string;
  productsPage = ProductListingComponent;

  stripeTest: FormGroup;
  stripeToken;
  coupon = '';
  totalDiscountPrice = 0;
  paymentGateway;
  isLoading = true;
  items = [];

  firstName;
  lastName;
  telephoneNumber;
  city;
  ward;
  district;
  address;
  zipCode;
  showCheckout: boolean;
  shipToThisAddressId;
  discount = 0;
  quantityProduct = 0;
  dataInfo = {
    products: [],
    promotions: [],
    shipmentTypeId: 1,
    toHubId: 3,
    shippingPrice: 0,
    percentDiscount: 0.07,
    transportation: {
      id: 0,
      name: '',
    },
    paymentMethod: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    streetAddress: '',
    city: {
      id: '',
      name: '',
    },
    district: {
      id: '',
      name: '',
    },
    ward: {
      id: '',
      name: '',
    },
    zipCode: '70000',
    returnUrl: '',
    giftOrderQuantity: [],
  };
  role_discount = {
    we_free: 0,
    we: 4,
    hubs: 7,
  };
  isSubmit = true;

  constructor(
    private cartService: CartService,
    public localStore: LocalStorgeService,
    private systemService: SystemService,
    private toasty: ToastyService,
    private nav: NavController,
    private authService: AuthService,
    private navParams: NavParams,
    public loadingCtrl: LoadingController,
    public tabsService: TabsService,
    private promotionService: PromotionService,
    private translate: TranslateService,
    private checkoutService: CheckoutService
  ) {
    this.systemService
      .configs()
      .then((res) => {
        this.userInfo.userCurrency = res ? res.customerCurrency : 'USD';
        this.paymentGateway = res.paymentGatewayConfig;
        this.role_discount = res.tradeDiscount;
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  async ngOnInit() {
    if (this.authService.isLoggedin()) {
      const isMember = await this.authService.isMember();
      if (isMember) {
        this.authService
          .me()
          .then(async (userMe) => {
            const initData = await this.checkoutService.initializeCheckout(
              userMe,
              this.role_discount
            );
            if (initData.isSuccess) {
              this.userInfo = initData.userInfo;
              this.discount = initData.discount;
              this.role_discount = initData.role_discount;
              this.dataInfo = initData.dataInfo;
            }
          })
          .catch((err) => {
            return this.toasty.error(
              this.translate.instant(err.message || 'Something went wrong!')
            );
          });
      } else {
        return this.toasty.error(
          'Bạn chưa là WE đại lý, vui lòng nạp 500k để kích hoạt tài khoản.'
        );
      }
      this.shipToThisAddressId = this.navParams.get('shipToThisAddressId');

      this.cartService.cartChanged$.subscribe(() => {
        this.quantityProduct = Number(localStorage.getItem('quantityProduct'));
      });
      await this.saveAddressId();
      this.cartService.calculate().then(
        async (res) => {
          this.isLoading = false;
          this.cart = res.data ? res.data : {};
          await this.cartService.checkExistProd(this.cart);
          if (res.data && res.data.products && res.data.products.length) {
            this.updateTotalPrice();
            await this.checkPromotions();
            this.isSubmit = false;
          }
          this.items = await this.query();
          if (!this.shipToThisAddressId) {
            this.items.forEach((e) => {
              if (e.default === true) {
                this.firstName = e.firstName;
                this.lastName = e.lastName;
                this.telephoneNumber = e.phoneNumber;
                this.address = e.address;
                this.city = e.city.name;
                this.ward = e.ward.name;
                this.zipCode = e.zipCode;
                this.district = e.district.name;

                this.userInfo.telephoneNumber = e.phoneNumber;
                this.userInfo.address = e.address;
                this.userInfo.city = e.city;
                this.userInfo.ward = e.ward;
                this.userInfo.zipCode = e.zipCode;
                this.userInfo.district = e.district;

                this.dataInfo.firstName = e.firstName;
                this.dataInfo.lastName = e.lastName;
                this.dataInfo.phoneNumber = e.phoneNumber;
                this.dataInfo.city = e.city;
                this.dataInfo.ward = e.ward;
                this.dataInfo.district = e.district;
                this.dataInfo.zipCode = e.zipCode;
              }
            });
          } else {
            this.items.forEach((element) => {
              if (element._id === this.shipToThisAddressId) {
                this.firstName = element.firstName;
                this.lastName = element.lastName;
                this.telephoneNumber = element.phoneNumber;
                this.address = element.address;
                this.city = element.city.name;
                this.ward = element.ward.name;
                this.zipCode = element.zipCode;
                this.district = element.district.name;

                this.userInfo.telephoneNumber = element.phoneNumber;
                this.userInfo.address = element.address;
                this.userInfo.city = element.city.name;
                this.userInfo.ward = element.ward.name;
                this.userInfo.zipCode = element.zipCode;
                this.userInfo.district = element.district.name;

                this.dataInfo.firstName = element.firstName;
                this.dataInfo.lastName = element.lastName;
                this.dataInfo.phoneNumber = element.phoneNumber;
                this.dataInfo.city = element.city;
                this.dataInfo.ward = element.ward;
                this.dataInfo.district = element.district;
                this.dataInfo.zipCode = element.zipCode;
              }
            });
          }

          if (res.data && res.data.products && res.data.products.length) {
            this.cartService
              .calculateShip(this.userInfo, this.cart.products)
              .then((resp) => {
                this.showCheckout = false;
                this.totalShippingPrice = resp.data.shippingPrice;
                if (!resp.data.totalShippingPrice && resp.data.errorMessage) {
                  this.showCheckout = true;
                  return this.toasty.error(resp.data.errorMessage);
                }
              })
              .catch(() => {
                this.showCheckout = true;
                this.isLoading = false;
              });
          }
        },
        async (error) => {
          this.isLoading = false;
          await this.toasty.error(error.data.message);
        }
      );
    } else {
      return this.nav.push(LoginComponent);
    }
  }

  async discountOrderFollowProductQuantity(product, promotion) {
    const existProduct = promotion.discountOrderFollowProductQuantity.promotionProducts.find(
      (x) => x._id === product.productId
    );
    if (
      existProduct &&
      promotion.discountOrderFollowProductQuantity.orderQuantity <=
        product.quantity
    ) {
      product.calculatedData.total -=
        (promotion.discountOrderFollowProductQuantity.discountPercent *
          product.calculatedData.total) /
        100;
      product.calculatedData.productPrice -=
        (promotion.discountOrderFollowProductQuantity.discountPercent *
          existProduct.salePrice) /
        100;
      product.calculatedData.discount =
        promotion.discountOrderFollowProductQuantity.discountPercent;
      product.calculatedData.product = product.calculatedData.total;
      product.userProductPrice = product.calculatedData.productPrice;
      this.number = promotion.discountOrderFollowProductQuantity.orderQuantity;
      if (!isNil(product.promotions)) {
        product.promotions.push(promotion);
      } else {
        product.promotions = [];
        product.promotions.push(promotion);
      }

      const obj = {
        id: product.productId,
        discount: promotion.discountOrderFollowProductQuantity.discountPercent,
      };
      this.listQuantity.push(obj);
    }

    await this.cartService.updateCart(product, product.quantity, product);
    return product;
  }

  async productDiscount(product, promotion) {
    const itemDiscount = promotion.productDiscount.find(
      (x) => x.productId === product.productId
    );
    if (!isNil(itemDiscount)) {
      product.calculatedData.discount = itemDiscount.discountPercent;
      product.calculatedData.productPrice -=
        (itemDiscount.discountPercent * product.calculatedData.productPrice) /
        100;
      product.calculatedData.total -=
        (itemDiscount.discountPercent * product.calculatedData.total) / 100;
      this.totalChange = product.calculatedData.total;
      product.calculatedData.product = product.calculatedData.productPrice;
      product.userProductPrice = product.calculatedData.productPrice;
      if (product.promotions) {
        product.promotions.push(promotion);
      } else {
        product.promotions = [];
        product.promotions.push(promotion);
      }

      const obj = {
        id: product.productId,
        discount: itemDiscount.discountPercent,
      };
      this.listProductChange.push(obj);
      await this.cartService.updateCart(product, product.quantity, product);
      this.updateTotalPrice();
    }
    return product;
  }

  async buyGoodPriceProduct(promotion) {
    let isValidDiscount = true;
    if (
      this.cart.products.length <=
      promotion.buyGoodPriceProduct.promotionProducts.length
    ) {
      for (const product of this.cart.products) {
        const existProduct = promotion.buyGoodPriceProduct.promotionProducts.find(
          (x) => x._id === product.productId
        );
        if (isNil(existProduct)) {
          isValidDiscount = false;
          break;
        }
      }
    }else{
      isValidDiscount = false;
    }
    if (isValidDiscount) {
      if (
        this.checkDiscount(this.totalPrice) >=
        promotion.buyGoodPriceProduct.totalOrderPriceCondition
      ) {
        this.totalOrderPriceCondition =
          promotion.buyGoodPriceProduct.totalOrderPriceCondition;
        this.GoodPriceProducts = promotion;
        this.goodPercent =
          promotion.buyGoodPriceProduct.discountOnProductPercent;
      }
    }
  }

  async discountOrderForNewMember(order) {
    let countProduct = 0;
    for (const product of this.cart.products) {
      const existProduct = order.discountOrderForNewMember.promotionProducts.find(
        (x) => x._id === product.productId
      );
      if (existProduct) {
        countProduct += 1;
      }
    }
    if (countProduct === this.cart.products.length) {
      for (const discountNew of order.discountOrderForNewMember
        .orderConditions) {
        if (
          discountNew.orderNumber === this.currentOrder + 1 &&
          discountNew.totalOrderPriceCondition <=
            this.checkDiscount(this.totalPrice)
        ) {
          this.discountOrderFirst.push(discountNew.discountPercent);
          this.percentNew = discountNew.discountPercent;
          this.dataInfo.promotions.push(order);
        }
      }
    }
  }

  async giveSomeGiftForNewMember(order: {
    giveSomeGiftForNewMember: {
      gifts: { gift; quantity }[];
      orderConditions: {
        orderNumber: number;
        totalOrderPriceCondition: number;
      }[];
      promotionProducts: { _id: string }[];
      giveGiftType: string;
    };
  }) {
    let coefficient: number;
    let countProduct = 0;
    for (const product of this.cart.products) {
      const existProduct = order.giveSomeGiftForNewMember.promotionProducts.find(
        (x) => x._id === product.productId
      );
      if (existProduct) {
        countProduct += 1;
      }
    }
    if (
      isArray(order.giveSomeGiftForNewMember.orderConditions) &&
      countProduct === this.cart.products.length
    ) {
      for (const giveSomeGift of order.giveSomeGiftForNewMember
        .orderConditions) {
        if (
          giveSomeGift.orderNumber === this.currentOrder + 1 &&
            (this.totalPrice - (this.discount / 100) * this.totalPrice) >= giveSomeGift.totalOrderPriceCondition
        ) {
          coefficient = Math.floor(
            (this.totalPrice - (this.discount / 100) * this.totalPrice) /
              giveSomeGift.totalOrderPriceCondition
          );
          if (
            order.giveSomeGiftForNewMember.giveGiftType === GiveGiftType.And
          ) {
            if (isArray(order.giveSomeGiftForNewMember.gifts)) {
              for (const item of order.giveSomeGiftForNewMember.gifts) {
                item.gift.quantity = item.quantity * coefficient;
              }
              const param = order.giveSomeGiftForNewMember.gifts.map((gift) => {
                return gift.gift;
              });
              this.listGiftForNewbee.push(...param);
            }
            this.dataInfo.promotions.push(order);
            this.dataInfo.promotions = [...this.dataInfo.promotions];
          } else {
            if (isArray(order.giveSomeGiftForNewMember.gifts)) {
              for (const item of order.giveSomeGiftForNewMember.gifts) {
                item.gift.quantity = item.quantity * coefficient;
              }
              const param = order.giveSomeGiftForNewMember.gifts.map((gift) => {
                return gift.gift;
              });
              this.sendDataGiftNewMember.push(param);
              this.dataInfo.promotions.push(order);
              this.dataInfo.promotions = [...this.dataInfo.promotions];
            }
          }
        }
      }
    }
  }

  async orderDiscount(order) {
    let countProduct = 0;
    const discountPrice = this.checkDiscount(this.totalPrice);
    if (discountPrice >= order.orderDiscount.totalOrderPriceCondition) {
      for (const product of this.cart.products) {
        const existProduct = order.orderDiscount.promotionProducts.find(
          (x) => x._id === product.productId
        );
        if (existProduct) {
          countProduct += 1;
        }
      }

      if (countProduct === this.cart.products.length) {
        if (order.orderDiscount.discountType === DiscountType.Percent) {
          this.discountOrderPercent.push(
            order.orderDiscount.discountOrderValue
          );
          this.dataInfo.promotions.push(order);
        }
        if (order.orderDiscount.discountType === DiscountType.Number) {
          this.discountOrderNumber.push(order.orderDiscount.discountOrderValue);
          this.dataInfo.promotions.push(order);
        }
      }
    }
  }

  async checkPromotions() {
    const getAllPromotions = await this.promotionService.promotionForUser();
    this.currentOrder = getAllPromotions.data.countOrder;
    this.listPromotion = getAllPromotions.data.items;
    this.listOrder = getAllPromotions.data.items.filter((pr) => {
      return pr.applyCondition === ApplyCondition.Order;
    });
    this.listOrderDetail = getAllPromotions.data.items.filter((pr) => {
      return pr.applyCondition === ApplyCondition.OrderDetail;
    });
    await this.checkPromotionForOrderDetails();
    await this.checkPromotionForOrder();
    await this.calculatePercent();
    this.updateTotalPrice();
  }

  async checkPromotionForOrder() {
    for (const order of this.listOrder) {
      switch (order.promotionForm) {
        case PromotionForm.DiscountOrderForNewMember:
          await this.discountOrderForNewMember(order);
          break;
        case PromotionForm.GiveSomeGiftForNewMember:
          await this.giveSomeGiftForNewMember(order);
          break;
        case PromotionForm.OrderDiscount:
          await this.orderDiscount(order);
          break;
        case PromotionForm.CheckoutDiscount:
          const checkoutDiscount = await this.checkoutService.checkoutDiscount(
            order,
            this.cart,
            this.quantityProduct
          );
          if (!isEmpty(checkoutDiscount.sendDataGiftOrderQuantity) || !isEmpty(checkoutDiscount.promotions)) {
            this.giveGiftType = checkoutDiscount.giveGiftType;
            this.dataInfo.promotions.push(...checkoutDiscount.promotions);
            this.dataInfo.products.push(...checkoutDiscount.products);
            this.sendDataGiftOrderQuantity =
              checkoutDiscount.sendDataGiftOrderQuantity;
            if(this.giveGiftType === GiveGiftType.And && !isEmpty(checkoutDiscount.listGiftCheckout)) {
              this.listGiftCheckout.push(...checkoutDiscount.listGiftCheckout);              
            }
          }
          break;
        case PromotionForm.CheckoutPercentOrMoneyDiscount:
          const checkoutPercentOrMoneyDiscount = await this.checkoutService.checkoutPercentOrMoneyDiscount(
            order,
            this.cart,
            this.quantityProduct
          );
          if(!isEmpty(checkoutPercentOrMoneyDiscount.discountOrderPercent)) {
            this.discountOrderPercent.push(
              ...checkoutPercentOrMoneyDiscount.discountOrderPercent
            );
            this.dataInfo.promotions.push(
              ...checkoutPercentOrMoneyDiscount.promotions);
          }
          if(!isEmpty(checkoutPercentOrMoneyDiscount.discountOrderNumber)) {
            this.discountOrderNumber.push(
              ...checkoutPercentOrMoneyDiscount.discountOrderNumber
            );
            this.dataInfo.promotions.push(
              ...checkoutPercentOrMoneyDiscount.promotions);
          }
          
          break;
        case PromotionForm.GiveGiftForOrder:
          const giveGiftForOrder = await this.checkoutService.giveGiftForOrder(
            order,
            this.cart,
            this.totalPrice,
            this.discount
          );
          if (!isEmpty(giveGiftForOrder.sendDataGiftOrder) || !isEmpty(giveGiftForOrder.promotions)) {
            this.dataInfo.products = [
              ...this.dataInfo.products,
              ...giveGiftForOrder.listGift,
            ];
            this.giveOrderGiftType = giveGiftForOrder.giveOrderGiftType;
            this.sendDataGiftOrder = giveGiftForOrder.sendDataGiftOrder;
            this.dataInfo.promotions = [
              ...this.dataInfo.promotions,
              ...giveGiftForOrder.promotions,
            ];
          }
          break;
        default:
          break;
      }
    }
  }

  async checkPromotionForOrderDetails() {
    for (let product of this.cart.products) {
      for (const promotion of this.listOrderDetail) {
        switch (promotion.promotionForm) {
          // product discount
          case PromotionForm.ProductDiscount:
            product = await this.productDiscount(product, promotion);
            break;
          // discountOrderFollowProductQuantity
          case PromotionForm.DiscountOrderFollowProductQuantity:
            product = await this.discountOrderFollowProductQuantity(
              product,
              promotion
            );
            break;
          // buyGoodPriceProduct
          case PromotionForm.BuyGoodPriceProduct:
            await this.buyGoodPriceProduct(promotion);
            break;
          // bonusProduct
          case PromotionForm.BonusProduct:
            const bonusProduct = await this.checkoutService.bonusProduct(
              promotion,
              product
            );
            this.listGiftBonusProduct.push(
              ...bonusProduct.listGiftCheckout
            );
            break;
          default:
            break;
        }
      }
    }
  }

  async checkBuyGood() {
    const getAllPromotions = await this.promotionService.promotionForUser();
    this.currentOrder = getAllPromotions.data.countOrder;
    this.listPromotion = getAllPromotions.data.items;
    this.listOrderDetail = getAllPromotions.data.items.filter((pr) => {
      return pr.applyCondition === ApplyCondition.OrderDetail;
    });
    const discountPrice = this.checkDiscount(this.totalPrice);
    for (const orderDetail of this.listOrderDetail) {
      // buyGoodPriceProduct
      if (orderDetail.promotionForm === PromotionForm.BuyGoodPriceProduct) {
        if (
          discountPrice >=
          orderDetail.buyGoodPriceProduct.totalOrderPriceCondition
        ) {
          this.totalOrderPriceCondition =
            orderDetail.buyGoodPriceProduct.totalOrderPriceCondition;
          this.GoodPriceProducts = orderDetail;
          this.goodPercent =
            orderDetail.buyGoodPriceProduct.discountOnProductPercent;
        }
      }
    }
    await this.calculatePercent();
    this.updateTotalPrice();
  }

  async checkDiscountOrderFollowProductQuantity() {
    const getAllPromotions = await this.promotionService.promotionForUser();
    this.currentOrder = getAllPromotions.data.countOrder;
    this.listPromotion = getAllPromotions.data.items;
    this.listOrderDetail = getAllPromotions.data.items.filter((pr) => {
      return pr.applyCondition === ApplyCondition.OrderDetail;
    });
    for (const product of this.cart.products) {
      for (const orderDetail of this.listOrderDetail) {
        // buyGoodPriceProduct
        if (
          orderDetail.promotionForm ===
          PromotionForm.DiscountOrderFollowProductQuantity
        ) {
          const existProduct = orderDetail.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts.find(
            (x) => x._id === product.productId
          );
          if (
            existProduct &&
            orderDetail.checkoutDiscountAndDiscountOrderFollowProductQuantity
              .orderQuantity === product.quantity
          ) {
            continue;
          } else if (
            existProduct &&
            orderDetail.checkoutDiscountAndDiscountOrderFollowProductQuantity
              .orderQuantity > product.quantity
          ) {
            product.calculatedData.total =
              (product.calculatedData.total * 100) /
              (100 -
                orderDetail
                  .checkoutDiscountAndDiscountOrderFollowProductQuantity
                  .discountPercent);
            product.calculatedData.productPrice = product.calculatedData.total;
            product.calculatedData.discount =
              product.checkoutDiscountAndDiscountOrderFollowProductQuantity.discountPercent;
            product.calculatedData.product = product.calculatedData.total;
            product.userProductPrice = product.productPrice;
          }
          await this.cartService.updateCart(product, product.quantity, product);
        }
      }
      await this.calculatePercent();
      this.updateTotalPrice();
    }
  }

  async calculatePercent() {
    const calPercent = await this.checkoutService.calculatePercent(
      this.totalPrice,
      this.discount,
      this.discountOrderPercent,
      this.discountOrderNumber,
      this.discountOrderFirst
    );
    if (!isEmpty(calPercent.totalAfterPercentFirst)) {
      this.totalAfterpercentFirst = calPercent.totalAfterPercentFirst;
    }
    if (!isEmpty(calPercent.totalAfterOrder)) {
      this.totalAfterOrder = calPercent.totalAfterOrder;
    }
  }

  async remove(index: number) {
    await this.cartService.remove(this.cart.products[index]);
    this.cart.products.splice(index, 1);
    if (this.cart.products.length > 0) {
      this.cartService
        .calculateShip(this.userInfo, this.cart.products)
        .then(async (resp) => {
          this.totalShippingPrice = resp.data.shippingPrice;
          if (!resp.data.totalShippingPrice && resp.data.errorMessage) {
            await this.toasty.error(resp.data.errorMessage);
          }
          this.updateTotalPrice();
        })
        .catch(async (err) => {
          await this.toasty.error(err.data.message);
        });
    }
  }

  updateTotalPrice() {
    this.totalPrice = 0;
    this.totalTaxPrice = 0;
    this.totalDiscountPrice = 0;
    if (!this.cart.products.length) {
      return;
    }

    this.cart.products.forEach((product) => {
      if (product.quantity < 1) {
        product.quantity = 1;
      }
      product.calculatedData = {
        product: product.userProductPrice * product.quantity,
        productPrice: product.userProductPrice,
        taxClass: product.taxClass,
        tax: 0,
        shipping: 0,
        discount: 0,
      };
      if (product && product.isDiscounted) {
        product.calculatedData.discount =
          (product.discountPercentage * product.calculatedData.product) / 100;
        this.totalDiscountPrice += product.calculatedData.discount;
      }
      if (product.taxPercentage && product.taxClass) {
        product.calculatedData.taxClass = product.taxClass;
        product.calculatedData.tax =
          product.calculatedData.product * (product.taxPercentage / 100);
        this.totalTaxPrice += product.calculatedData.tax;
      }

      product.calculatedData.total =
        product.calculatedData.product +
        product.calculatedData.tax +
        product.calculatedData.shipping -
        product.calculatedData.discount;

      this.totalPrice += product.calculatedData.total;
    });
  }

  checkDiscount(total) {
    const totalPrice = this.checkoutService.checkDiscount(
      total,
      this.discount,
      this.discountOrderPercent,
      this.discountOrderNumber,
      this.discountOrderFirst
    );
    return totalPrice;
  }

  async changeQuantity(index, change) {
    this.isSubmit = true;
    const product = this.cart.products[index];
    if (change) {
      product.quantity++;
    } else {
      product.quantity--;
    }
    if (product.quantity >= 1) {
      this.updateTotalPrice();
      await this.cartService.updateCart(
        {
          productId: product.productId,
          product,
        },
        product.quantity,
        product
      );
      this.isSubmit = false;
      // await this.resetDataPromotion().then(async () => {
      //   await this.checkPromotions().then(() => {
      //     this.isSubmit = false;
      //   });
      // })
    } else {
      await this.remove(index);
      this.isSubmit = false;
      // await this.resetDataPromotion().then(async () => {
      //   await this.checkPromotions().then(() => {
      //     this.isSubmit = false;
      //   });
      // })
    }
  }

  async submit() {
    // await this.checkDiscountOrderFollowProductQuantity();
    await this.cart.products.forEach((x) => {
      const item = {
        productId: x.productId,
        quantity: x.quantity,
        calculatedData: x.calculatedData ? x.calculatedData : undefined,
        promotions: x.promotions ? x.promotions : [],
      };
      this.dataInfo.products.push(item);
    });

    const sendData = {
      dataInfo: {},
      goodPrice: [],
      giftNewMember: [],
      giftOrderQuantity_CheckoutDiscount: [],
      giftOrderQuantity: []
    };

    if (this.giveGiftType === GiveGiftType.Or) {
      sendData.dataInfo = this.dataInfo;
      sendData.giftOrderQuantity_CheckoutDiscount = this.sendDataGiftOrderQuantity;
    }
    if (this.giveOrderGiftType === GiveGiftType.Or) {
      sendData.dataInfo = this.dataInfo;
      sendData.giftOrderQuantity = this.sendDataGiftOrder;
    }
    if (
      (this.GoodPriceProducts &&
        this.checkDiscount(this.totalPrice) >= this.totalOrderPriceCondition) ||
      this.sendDataGiftNewMember
    ) {
      sendData.dataInfo = this.dataInfo;
      sendData.goodPrice = this.GoodPriceProducts || undefined;
      sendData.giftNewMember = this.sendDataGiftNewMember || [];
    } 

    if(!_.isEmpty(sendData.giftOrderQuantity_CheckoutDiscount)){
      return this.nav.push(CheckoutDiscountOrderQuantityComponent, sendData);
    }

    if(!_.isEmpty(sendData.giftOrderQuantity)){
      return this.nav.push(GiftForOrderComponent, sendData);
    }

    if (!_.isEmpty(sendData.giftNewMember)) {
      return this.nav.push(GiftNewMemberComponent, sendData);
    }

    if (!_.isEmpty(sendData.goodPrice)) {
      return this.nav.push(PreferentialProducts, sendData);
    }

    return this.nav.push(CreateOrderComponent, this.dataInfo);
  }

  selectDial(event) {
    this.dialCode = event;
  }

  goTo(page) {
    switch (page) {
      case 'home':
        return this.nav.setRoot(HomePage);
      case 'product':
        console.log('checkout product')
        return this.nav.setRoot(ProductListingComponent);
    }
  }

  changePhone(event) {
    if (!event) {
      return;
    }
    this.phoneNumber.number = event.value;
  }

  async query() {
    return this.authService.getShippingAdress();
  }

  changeAddress(flagchange) {
    return this.nav.push(AddressComponent, { flagchange });
  }

  async saveAddressId() {
    if (this.navParams.get('shipToThisAddressId') !== undefined) {
      localStorage.setItem(
        'isAddress',
        this.navParams.get('shipToThisAddressId')
      );
    } else {
      this.shipToThisAddressId = localStorage.getItem('isAddress');
    }
  }
  ionViewWillEnter() {
    this.tabsService.hide();
  }
  ionViewWillLeave() {
    this.tabsService.show();
  }
  async onKey(event, index) {
    this.isSubmit = true;
    const product = this.cart.products[index];
    if(parseInt(event.target.value) < 0) {
      product.quantity = Math.abs(event.target.value);
    }
    if(parseInt(event.target.value) > 0) {
      product.quantity = Math.abs(event.target.value);
    }
    if(parseInt(event.target.value) === 0) {
      product.quantity = 0;
      await this.remove(index);
      this.isSubmit = false;
    }

    if (product.quantity >= 1) {
      this.updateTotalPrice();
      await this.cartService.updateCart(
        {
          productId: product.productId,
          product,
        },
        product.quantity,
        product
      );
      this.isSubmit = false;
    }
  }
  async resetDataPromotion() {
    return Promise.resolve(() => {
      this.goodPercent = 0;
      this.percentNew = 0;
      this.totalAfterpercentFirst = [];
      this.totalAfterOrder = [];
      this.totalOrderPriceCondition;
      this.GoodPriceProducts = [];
      this.sendDataGiftNewMember = [];
      this.sendDataGiftOrderQuantity = [];
      this.sendDataGiftOrder = [];
      this.listGiftCheckout = [];
      this.giveGiftType = '';
      this.giveOrderGiftType = '';
      this.listGift = [];
      this.discountOrderFirst = [];
      this.discountOrderPercent = [];
      this.discountOrderNumber = [];
      this.discountPriceList = [];
      this.listPromotion = [];
      this.listProductsDiscountOrder = [];
      this.listGiftForNewbee = [];
      this.currentOrder = 0;
      this.totalChange = 0;
      this.listProductChange = [];
      this.listQuantity = [];
      this.listOrderDetail = [];
      this.listOrder = [];
    })  
  }
}
