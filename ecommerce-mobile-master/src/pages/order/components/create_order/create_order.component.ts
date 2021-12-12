import { Component, OnInit } from '@angular/core';
import {
  NavController,
  NavParams,
  LoadingController,
  Loading,
  Platform
} from 'ionic-angular';
import {
  CartService,
  SystemService,
  ToastyService,
  AuthService,
  OrderService,
  CheckoutService,
} from '../../../../services';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProductListingComponent } from '../../../products';
import {
  clone,
  pick,
  uniqBy,
  isArray,
  isEmpty,
  isNil,
  isNull,
  cloneDeep,
} from 'lodash';
import { AddressComponent } from '../../../profile/components';
import { LoginComponent } from '../../../auth';
import { CheckoutComponent } from '../../../cart/components';
import { TPLTypeComponent } from '../TPLType/tplType.component';
import { PaymentTypeComponent } from '../paymentType/paymentType.component';
import { TPLService } from '../../../../services/tpl.service';
import moment from 'moment';
import { LocalStorgeService } from '../../../../services/local-storge.service';
import { ResultOrderComponent } from '../result_order/result_order.component';
import { TabsService } from '../../../../services/tabs.service';
import { PaymentService } from '../../../../services/payment.service';
import {
  ApplyCondition,
  PromotionForm,
  GiveGiftType,
  DiscountType,
  FreeShipApplyType,
} from '../../../../app/enums';
import { PromotionService } from '../../../../services/promotion.service';
import { GiftNewMemberComponent } from '../../../cart/components/gift-newmember/gift-newmember.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PreferentialProducts } from '../../../cart/components/preferential-products/preferential-products.component';
import _ from 'lodash';
import { environment } from '../../../../app/environments/environment';
import { SafariViewController } from '@ionic-native/safari-view-controller';

declare let cordova: any;
const STATUS_SUCCESS = "1";
const STATUS_FAILED = "-1";
const STATUS_CANCELED = "4";

@Component({
  selector: 'create_order',
  templateUrl: './create_order.html',
})
export class CreateOrderComponent  {
  totalAfterpercentFirst = [];
  change = false;
  giftNewSend = [];
  sendDataGiftNewMember = [];
  giftOrderQuantity: {
    gift: object;
    isChoose: boolean;
    quantity: number;
    quantityGift: number;
  }[];
  totalAfterOrder = [];
  percentNew = 0;
  percentOrder = 0;
  quantityProduct = Number(localStorage.getItem('quantityProduct'));
  idCity;
  goodItem;
  totalOrderPriceCondition;
  listGift = [];
  goodPercent;
  GoodPriceProducts;
  listGiftCheckout = [];
  listGiftForOrder = [];
  discountOrderFirst = [];
  discountOrderPercent = [];
  listPromotion = [];
  listProductsDiscountOrder = [];
  giveGiftType = '';
  listGiftForNewbee = [];
  cunrrentOrder;
  totalChange;
  listProductChange = [];
  listOrderDetail = [];
  listOrder = [];
  loading: Loading;
  cart;
  totalPrice = 0;
  totalTaxPrice = 0;
  totalShippingPrice = 0;
  listGiftBonusProduct = [];
  userInfo = {
    paymentMethod: '',
    streetAddress: '',
    lastName: '',
    firstName: '',
    email: '',
    userCurrency: '',
    telephoneNumber: '',
    address: '',
    city: '',
    ward: '',
    zipCode: '',
    district: '',
  };

  paymentTypePrice = window.appConfig.paymentTypePrice;
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
  totalDiscountPrice = 0;
  isLoading = true;
  isSubmit = false;
  shippingAddresses = [];

  address_calculate;
  showCheckout: boolean;
  shipToThisAddressId;
  roleId = '';
  prevComponent;

  dataInfo = {
    change: false,
    goodPriceProduct: {},
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
    email: '',
    freeShipCode: '',
    isChangeDelivery: false,
  };
  isCreateOrder = false;
  isFreeShip = false;
  titleHeader = 'Thông tin đơn hàng';
  discount;
  deliverydate: string;
  role_user;
  weight = 0;
  paymentMethodsConfig = [];
  oldCart = [];
  discountOrderNumber = [];
  promotionCode = '';
  totalPriceOrder = 1000000;
  freeShipDiscount = 0;
  freeShipAmount = 0;
  isApplyPromotionCode = false;
  checkoutText = 'CHECKOUT';
  errorFeeTransport = false;
  currentFreeShipCode = '';
  currentFreeShipDiscount = 0;
  currentFreeShip;

  constructor(
    private cartService: CartService,
    private tplService: TPLService,
    private systemService: SystemService,
    private toasty: ToastyService,
    private nav: NavController,
    private translate: TranslateService,
    private localStore: LocalStorgeService,
    private tabsService: TabsService,
    public paymentService: PaymentService,
    private orderService: OrderService,
    private promotionService: PromotionService,
    private authService: AuthService,
    private navParams: NavParams,
    public loadingCtrl: LoadingController,
    private checkoutService: CheckoutService,
    private inAppBrowser: InAppBrowser,
    private platform: Platform,
    private safariViewController: SafariViewController,
  ) {
    this.prevComponent = CheckoutComponent;
    this.giftNewSend = JSON.parse(localStorage.getItem('gifts'));
    this.giftOrderQuantity = JSON.parse(
      localStorage.getItem('giftOrderQuantity')
    );
    this.dataInfo = this.navParams.data.dataInfo || this.navParams.data;
    if (this.dataInfo.change) {
      this.change = true;
    }
    this.idCity = this.dataInfo.city.id;
    if (this.dataInfo.promotions) {
      this.dataInfo.promotions = [];
      if (this.dataInfo.products) {
        const array = [];
        const items = JSON.parse(localStore.get('cart'));
        for (const item of items) {
          for (const product of this.dataInfo.products) {
            if (item.productId === product.productId) {
              array.push(product);
            }
          }
        }
        this.dataInfo.products = [...array];
      }
    }
    if (this.navParams.data.isCreateOrder) {
      this.isCreateOrder = true;
      this.titleHeader = 'Xác nhận đơn hàng';
    }

    this.systemService
      .configs()
      .then(async () => {
        if (window.appData) {
          this.userInfo.userCurrency = window.appData.customerCurrency
            ? window.appData.customerCurrency
            : 'VND';
          if (
            window.appData.paymentGatewayConfig &&
            window.appData.paymentGatewayConfig.paymentMethods
          ) {
            this.paymentMethodsConfig =
              window.appData.paymentGatewayConfig.paymentMethods;
            const paymentMethod = this.paymentMethodsConfig.find(
              (x) => x.value === this.dataInfo.paymentMethod && x.enable
            );
            // tslint:disable-next-line: strict-boolean-conditions
            if (!this.dataInfo.paymentMethod || !paymentMethod) {
              // default first enabled payment method in config
              const filterPaymentList = this.paymentMethodsConfig.filter(
                (x) => x.enable === true
              );
              if (filterPaymentList && filterPaymentList.length > 0) {
                this.dataInfo.paymentMethod = filterPaymentList[0].value;
              } else {
                return this.toasty.error(
                  this.translate.instant('Payment method not found!')
                );
              }
            }
          } else {
            return this.toasty.error(
              this.translate.instant('Payment method not found!')
            );
          }
        }
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

async ionViewWillEnter() {
  this.tabsService.hide();
    if (this.authService.isLoggedin()) {
      const isMember = await this.authService.isMember();
      if (isMember) {
        this.authService
          .me()
          .then((resp) => {
            this.dataInfo.lastName = resp.data.name.slice(
              resp.data.name.lastIndexOf(' ') + 1,
              resp.data.name.length
            );
            this.dataInfo.firstName = resp.data.name.slice(
              0,
              resp.data.name.lastIndexOf(this.dataInfo.lastName) - 1
            );
            this.dataInfo.email = resp.data.email;
            this.dataInfo.streetAddress = resp.data.address;
            this.dataInfo.streetAddress = resp.data.address;
          })
          .catch((err) => {
            return this.toasty.error(
              this.translate.instant(err.message || 'Something went wrong!')
            );
          });
        this.discount = this.dataInfo.percentDiscount;
      } else {
        return this.toasty.error(
          'Bạn chưa là WE đại lý, vui lòng nạp 500k để kích hoạt tài khoản.'
        );
      }
      // if (!isNil(this.dataInfo.goodPriceProduct)) {
      //   this.goodItem = clone(this.dataInfo.goodPriceProduct);
      //   // this.dataInfo.products.push(this.dataInfo.goodPriceProduct);
      // }
    } else {
      this.prevComponent = LoginComponent;
      return this.nav.setRoot(LoginComponent);
    }
    this.cartService.cartChanged$.subscribe(() => {
      this.quantityProduct = Number(localStorage.getItem('quantityProduct'));
    });
    this.isLoading = true;
    this.isSubmit = false;
    this.roleId = this.authService.getRoleId();
    this.titleHeader = 'Thông tin đơn hàng';
    localStorage.removeItem('flagchange');
    this.role_user = this.localStore.get('role');
    this.listGiftForNewbee = [];
    if (this.authService.isLoggedin()) {
      this.shipToThisAddressId = localStorage.getItem('shipToThisAddressId');
      this.cartService.calculate().then(
        async (res) => {
          this.cart = res.data ? res.data : {};

          // Kiểm tra duplicate giỏ hàng
          await this.cartService.checkExistProd(this.cart);
          // Lấy danh sách địa chỉ giao hàng và show địa chỉ mặc định hoặc được user chọn
          this.shippingAddresses = await this.authService.getShippingAdress();
          let shippingAddressChosen;
          if (!this.shipToThisAddressId) {
            shippingAddressChosen = this.shippingAddresses.find(
              (x) => x.default
            );
          } else {
            shippingAddressChosen = this.shippingAddresses.find(
              (x) => x._id === this.shipToThisAddressId
            );
            this.idCity = shippingAddressChosen.city.id;
          }

          if (!isNil(shippingAddressChosen)) {
            this.setDataInfo(shippingAddressChosen);
          }
          // Áp dụng promotion cho các sản phẩm trong giỏ hàng theo từng điều kiện chương trình
          if (res.data && res.data.products && res.data.products.length) {
            await this.applyPromotion();
          }
          // Tính phí ship cho đơn hàng dựa trên địa chỉ giao hàng hiện tại
          if (res.data && res.data.products && res.data.products.length) {
            await this.calculateShip();
          }

          if (
            (!this.dataInfo.isChangeDelivery && !this.shipToThisAddressId) ||
            (!this.dataInfo.isChangeDelivery && this.shipToThisAddressId)
          ) {
            await this.load_TPL();
          }

          this.isLoading = false;
        },
        async (error) => {
          this.isLoading = false;
          await this.cartService.checkExistProd(this.cart);
          await this.toasty.error(error.data.message);
        }
      );
      if (
        (!this.dataInfo.isChangeDelivery && !this.shipToThisAddressId) ||
        (!this.dataInfo.isChangeDelivery && this.shipToThisAddressId)
      ) {
        await this.load_TPL();
      }
    }

  }

  async applyPromotion() {
    await this.promotionService
      .promotionForUser()
      .then(async (resq) => {
        this.cunrrentOrder = resq.data.countOrder;
        this.listPromotion = resq.data.items;
        this.listOrder = resq.data.items.filter((pr) => {
          return pr.applyCondition === ApplyCondition.Order;
        });

        this.listOrder = this.listOrder.filter((item) => {
          return item.areaApply.find(
            ({ id }) => id === -1 || id === this.idCity
          );
        });

        this.listOrderDetail = resq.data.items.filter((pr) => {
          return pr.applyCondition === ApplyCondition.OrderDetail;
        });
        this.listOrderDetail = this.listOrderDetail.filter((item) => {
          return item.areaApply.find(
            ({ id }) => id === -1 || id === this.idCity
          );
        });
        this.updateTotalPrice();
        for (let product of this.cart.products) {
          for (const orderDetail of this.listOrderDetail) {
            switch (orderDetail.promotionForm) {
              // productDiscount
              case PromotionForm.ProductDiscount:
                product = await this.productDiscount(product, orderDetail);
                break;
              // discountOrderFollowProductQuantity
              case PromotionForm.DiscountOrderFollowProductQuantity:
                product = await this.discountOrderFollowProductQuantity(
                  product,
                  orderDetail
                );
                break;
              // buyGoodPriceProduct
              case PromotionForm.BuyGoodPriceProduct:
                await this.buyGoodPriceProduct(orderDetail);
                break;
              case PromotionForm.BonusProduct:
                const bonusProduct = await this.checkoutService.bonusProduct(
                  orderDetail,
                  product
                );
                if (!isEmpty(bonusProduct.products)) {
                  this.dataInfo.products.push(...bonusProduct.products);
                  this.listGiftBonusProduct.push(
                    ...bonusProduct.listGiftCheckout
                  );
                }
                break;
              default:
                break;
            }
          }
        }

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
              await this.checkoutDiscount(order);
              break;
            case PromotionForm.FreeShip:
              await this.checkFreeShip(order);
              break;
            case PromotionForm.CheckoutPercentOrMoneyDiscount:
              const checkoutPercentOrMoneyDiscount = await this.checkoutService.checkoutPercentOrMoneyDiscount(
                order,
                this.cart,
                this.quantityProduct
              );
              if (
                !isEmpty(checkoutPercentOrMoneyDiscount.discountOrderPercent)
              ) {
                this.discountOrderPercent.push(
                  ...checkoutPercentOrMoneyDiscount.discountOrderPercent
                );
                this.dataInfo.promotions.push(
                  ...checkoutPercentOrMoneyDiscount.promotions
                );
              }
              if (
                !isEmpty(checkoutPercentOrMoneyDiscount.discountOrderNumber)
              ) {
                this.discountOrderNumber.push(
                  ...checkoutPercentOrMoneyDiscount.discountOrderNumber
                );
                this.dataInfo.promotions.push(
                  ...checkoutPercentOrMoneyDiscount.promotions
                );
              }
              break;
            case PromotionForm.GiveGiftForOrder:
              await this.giveGiftForOrder(order);
              break;
            default:
              break;
          }
        }
        this.calculatePercent();
        // Backup lại data của cart hiện tại để thực hiện chức năng trở về
        this.backup();
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  async productDiscount(product, orderDetail) {
    const itemDiscount = orderDetail.productDiscount.find(
      (x) => x.productId === orderDetail.productId
    );
    if (itemDiscount) {
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
        product.promotions.push(orderDetail);
      } else {
        product.promotions = [];
        product.promotions.push(orderDetail);
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

  async discountOrderFollowProductQuantity(product, orderDetail) {
    const existProduct = orderDetail.discountOrderFollowProductQuantity.promotionProducts.find(
      (x) => x._id === product.productId
    );
    if (
      existProduct &&
      orderDetail.discountOrderFollowProductQuantity.orderQuantity <=
        product.quantity
    ) {
      product.calculatedData.total -=
        (orderDetail.discountOrderFollowProductQuantity.discountPercent *
          product.calculatedData.total) /
        100;
      product.calculatedData.productPrice -=
        (orderDetail.discountOrderFollowProductQuantity.discountPercent *
          existProduct.salePrice) /
        100;
      product.calculatedData.discount =
        orderDetail.discountOrderFollowProductQuantity.discountPercent;
      product.calculatedData.product = product.calculatedData.total;
      product.userProductPrice = product.calculatedData.productPrice;
      product.productPrice = product.calculatedData.productPrice;

      if (product.promotions) {
        product.promotions.push(orderDetail);
      } else {
        product.promotions = [];
        product.promotions.push(orderDetail);
      }
      await this.cartService.updateCart(product, product.quantity, product);
      this.updateTotalPrice();
    }
    return product;
  }

  async buyGoodPriceProduct(orderDetail) {
    let isValidDiscount = true;
    if (
      this.cart.products.length <=
      orderDetail.buyGoodPriceProduct.promotionProducts.length
    ) {
      for (const product of this.cart.products) {
        const existProduct = orderDetail.buyGoodPriceProduct.promotionProducts.find(
          (x) => x._id === product.productId
        );
        if (isNil(existProduct)) {
          isValidDiscount = false;
          break;
        }
      }
    } else {
      isValidDiscount = false;
    }
    if (isValidDiscount) {
      if (
        this.checkDiscount(this.totalPrice) >=
        orderDetail.buyGoodPriceProduct.totalOrderPriceCondition
      ) {
        this.totalOrderPriceCondition =
          orderDetail.buyGoodPriceProduct.totalOrderPriceCondition;
        this.GoodPriceProducts = orderDetail;
        this.goodPercent =
          orderDetail.buyGoodPriceProduct.discountOnProductPercent;
        this.goodItem = clone(this.dataInfo.goodPriceProduct);
        this.dataInfo.products.push(this.dataInfo.goodPriceProduct);
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
          discountNew.orderNumber === this.cunrrentOrder + 1 &&
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
          giveSomeGift.orderNumber === this.cunrrentOrder + 1 &&
          giveSomeGift.totalOrderPriceCondition <=
            this.totalPrice - (this.discount / 100) * this.totalPrice
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
              let formatGift = [...param];
              formatGift = formatGift.map((item) => {
                item = {
                  productId: item._id,
                  quantity: item.quantity,
                  promotions: [],
                };
                return item;
              });
              this.dataInfo.products.push(...formatGift);
            }
            this.dataInfo.promotions.push(order);
          } else {
            if (
              isArray(order.giveSomeGiftForNewMember.gifts) &&
              !this.navParams.data.gifts
            ) {
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
            if (this.navParams.data.gifts) {
              this.listGiftForNewbee.push(...this.navParams.data.gifts);
              this.dataInfo.promotions.push(order);
              let formatGift = [...this.navParams.data.gifts];
              formatGift = formatGift.map((item) => {
                item = {
                  productId: item._id,
                  quantity: item.quantity,
                  promotions: [],
                };
                return item;
              });
              this.dataInfo.products.push(...formatGift);
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

  async checkoutDiscount(order) {
    let ratio = 0;
    if (isNull(order.checkoutDiscount.orderQuantity)) {
      if (
        this.cart.products.length !==
        order.checkoutDiscount.promotionProducts.length
      ) {
        return;
      }
    } else {
      if (this.quantityProduct < order.checkoutDiscount.orderQuantity) {
        return;
      }
    }

    for (const product of this.cart.products) {
      const existProduct = order.checkoutDiscount.promotionProducts.find(
        (x) => x.product._id === product.productId
      );
      if (isNil(existProduct)) {
        return;
      }

      const ratioItem = parseInt(
        (product.quantity / existProduct.quantity).toString(),
        10
      );

      if (ratioItem <= 0) {
        return;
      } else if ((ratioItem > 0 && ratioItem < ratio) || ratio === 0) {
        ratio = ratioItem;
      }
    }

    if (!isNull(order.checkoutDiscount.orderQuantity)) {
      ratio = parseInt(
        (
          this.quantityProduct / order.checkoutDiscount.orderQuantity
        ).toString(),
        10
      );
    }

    if (ratio > 0) {
      this.giveGiftType = order.checkoutDiscount.giveGiftType;
      const gifts = this.giftOrderQuantity;
      if (!_.isEmpty(gifts)) {
        for (const gift of gifts) {
          if (gift) {
            const quantityGift = gift.quantity * ratio;
            gift.quantityGift = quantityGift;
            this.listGiftCheckout.push(gift);
          }
        }
      }
      if (this.giveGiftType === GiveGiftType.And) {
        const gifts = order.checkoutDiscount.gifts;
        for (const gift of gifts) {
          const quantityGift = gift.quantity * ratio;
          gift.quantityGift = quantityGift;
          this.listGiftCheckout.push(gift);
        }
      }
      if (!_.isEmpty(this.listGiftCheckout)) {
        this.listGift = this.listGiftCheckout.map((item) => {
          item = {
            productId: item.gift._id,
            quantity: item.quantityGift,
            promotions: [],
          };
          return item;
        });
      }

      this.dataInfo.products = [...this.dataInfo.products, ...this.listGift];
      this.dataInfo.promotions.push(order);
    }
  }

  async giveGiftForOrder(order) {
    let isValidDiscount = true;
    let ratio = 0;
    if (
      this.cart.products.length <=
      order.giveGiftForOrder.promotionProducts.length
    ) {
      for (const product of this.cart.products) {
        const existProduct = order.giveGiftForOrder.promotionProducts.find(
          (x) => x._id === product.productId
        );
        if (isNil(existProduct)) {
          isValidDiscount = false;
          break;
        }
      }
    } else {
      isValidDiscount = false;
    }
    const totalPrice =
      this.totalPrice - (this.totalPrice * this.discount) / 100;
    if (isValidDiscount) {
      const sendDataGiftOrderQuantity = [];
      this.giveGiftType = order.giveGiftForOrder.giveGiftType;
      if (totalPrice >= order.giveGiftForOrder.totalOrderPriceCondition) {
        const gifts = order.giveGiftForOrder.gifts;
        for (const gift of gifts) {
          ratio = parseInt(
            (
              totalPrice / order.giveGiftForOrder.totalOrderPriceCondition
            ).toString(),
            10
          );
          const quantityGift = gift.quantity * ratio;
          gift.quantity = quantityGift;
          gift.isChoose = false;
          this.listGiftForOrder.push(gift);
          sendDataGiftOrderQuantity.push(gift);
        }
        if (this.giveGiftType === GiveGiftType.And) {
          this.listGift = this.listGiftForOrder.map((item) => {
            item = {
              productId: item.gift._id,
              quantity: item.quantity,
              promotions: [],
            };
            return item;
          });
          this.dataInfo.products = [
            ...this.dataInfo.products,
            ...this.listGift,
          ];
          this.dataInfo.promotions.push(order);
        }

        if (this.giveGiftType === GiveGiftType.Or) {
          this.listGiftForOrder = [
            JSON.parse(localStorage.getItem('giftForOrderItem')),
          ];
          if (!_.isEmpty(this.listGiftForOrder)) {
            this.listGift = this.listGiftForOrder.map((item) => {
              item = {
                productId: item.gift._id,
                quantity: item.quantity,
                promotions: [],
              };
              return item;
            });

            this.dataInfo.products = [
              ...this.dataInfo.products,
              ...this.listGift,
            ];
            this.dataInfo.promotions.push(order);
          }
        }
      }
    }
  }

  setDataInfo(shippingAddressChosen) {
    this.dataInfo.firstName = shippingAddressChosen.firstName;
    this.dataInfo.lastName = shippingAddressChosen.lastName;
    this.dataInfo.phoneNumber = shippingAddressChosen.phoneNumber;
    this.dataInfo.streetAddress = shippingAddressChosen.address;
    this.dataInfo.city = shippingAddressChosen.city;
    this.dataInfo.district = shippingAddressChosen.district;
    if (!isNaN(shippingAddressChosen.ward.name)) {
      this.dataInfo.ward.name = `Phường ${shippingAddressChosen.ward.name}`;
      this.dataInfo.ward.id = shippingAddressChosen.ward.id;
    } else {
      this.dataInfo.ward.name = shippingAddressChosen.ward.name;
      this.dataInfo.ward.id = shippingAddressChosen.ward.id;
    }
    this.dataInfo.zipCode = shippingAddressChosen.zipCode;
    this.userInfo.telephoneNumber = shippingAddressChosen.phoneNumber;
    this.userInfo.address = shippingAddressChosen.address;
    this.userInfo.city = shippingAddressChosen.city.name;
    this.userInfo.ward = shippingAddressChosen.ward.name;
    this.userInfo.zipCode = shippingAddressChosen.zipCode;
    this.userInfo.district = shippingAddressChosen.district.name;
  }

  async calculateShip() {
    await this.cartService
      .calculateShip(this.userInfo, this.cart.products)
      .then(async (resp) => {
        this.showCheckout = false;
        this.totalShippingPrice = resp.data.shippingPrice;
        if (!resp.data.totalShippingPrice && resp.data.errorMessage) {
          this.showCheckout = true;
          await this.toasty.error(resp.data.errorMessage);
        }
        this.updateTotalPrice();
      })
      .catch(() => {
        this.showCheckout = true;
        this.isLoading = false;
      });
  }
  calculatePercent() {
    if (
      isEmpty(this.discountOrderPercent) &&
      isEmpty(this.discountOrderNumber) &&
      !isEmpty(this.discountOrderFirst)
    ) {
      let total = this.totalPrice - (this.totalPrice * this.discount) / 100;
      const arr = [];
      for (const discount of this.discountOrderFirst) {
        arr.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterpercentFirst = arr;
      return;
    }

    if (
      !isEmpty(this.discountOrderPercent) &&
      isEmpty(this.discountOrderNumber) &&
      isEmpty(this.discountOrderFirst)
    ) {
      let total = this.totalPrice - (this.totalPrice * this.discount) / 100;
      const arr = [];
      for (const discount of this.discountOrderPercent) {
        arr.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterOrder = arr;
      return;
    }

    if (
      !isEmpty(this.discountOrderPercent) &&
      isEmpty(this.discountOrderNumber) &&
      !isEmpty(this.discountOrderFirst)
    ) {
      let total = this.totalPrice - (this.totalPrice * this.discount) / 100;
      const arrFisrt = [];
      const arrOrder = [];
      for (const discount of this.discountOrderPercent) {
        arrOrder.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterOrder = arrOrder;
      for (const discount of this.discountOrderFirst) {
        arrFisrt.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterpercentFirst = arrFisrt;
      return;
    }
    if (
      isEmpty(this.discountOrderPercent) &&
      !isEmpty(this.discountOrderNumber) &&
      isEmpty(this.discountOrderFirst)
    ) {
      let total = this.totalPrice - (this.totalPrice * this.discount) / 100;
      const arr = [];
      for (const discountNumber of this.discountOrderNumber) {
        arr.push(total - discountNumber);
        total = total - discountNumber;
      }
      this.totalAfterOrder = arr;
      return;
    }
    if (
      !isEmpty(this.discountOrderPercent) &&
      !isEmpty(this.discountOrderNumber) &&
      isEmpty(this.discountOrderFirst)
    ) {
      let total = this.totalPrice - (this.totalPrice * this.discount) / 100;
      const arrOrder = [];
      for (const discount of this.discountOrderPercent) {
        arrOrder.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterOrder = arrOrder;
      for (const numberOrder of this.discountOrderNumber) {
        arrOrder.push(total - numberOrder);
        total = total - numberOrder;
      }
      this.totalAfterOrder = arrOrder;
      return;
    }
    if (
      !isEmpty(this.discountOrderPercent) &&
      !isEmpty(this.discountOrderNumber) &&
      !isEmpty(this.discountOrderFirst)
    ) {
      let total = this.totalPrice - (this.totalPrice * this.discount) / 100;
      const arrFisrt = [];
      const arrOrder = [];
      for (const discount of this.discountOrderPercent) {
        arrOrder.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterOrder = arrOrder;
      for (const numberOrder of this.discountOrderNumber) {
        arrOrder.push(total - numberOrder);
        total = total - numberOrder;
      }
      this.totalAfterOrder = arrOrder;
      for (const discount of this.discountOrderFirst) {
        arrFisrt.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      this.totalAfterpercentFirst = arrFisrt;
      return;
    }
    return;
  }

  // Xóa sản phẩm khỏi giỏ hàng
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
        .catch((err) => {
          return this.toasty.error(err.data.message);
        });
    }
  }

  // Backup data giỏ hàng
  backup() {
    this.oldCart = this.cart ? clone(this.cart) : [];
  }

  // Phục hồi data giỏ hàng như thời điểm backup
  recovery() {
    this.cart = this.oldCart ? clone(this.oldCart) : this.cart;
  }

  // Thay đổi hình thức thanh toán
  changePayment(page) {
    if (page === 'tpl') {
      this.prevComponent = CheckoutComponent;
      return this.nav.push(TPLTypeComponent, this.dataInfo, { animate: false });
    } else {
      this.prevComponent = CheckoutComponent;
      return this.nav.push(PaymentTypeComponent, this.dataInfo, {
        animate: false,
      });
    }
  }

  // Tính toán thông tin giá của đơn hàng
  updateTotalPrice() {
    this.totalPrice = 0;
    this.totalTaxPrice = 0;
    // this.totalShippingPrice = 0;
    this.totalDiscountPrice = 0;

    if (!this.cart.products.length) {
      return;
    }

    this.cart.products.forEach((product) => {
      const calculatedProduct = this.dataInfo.products.find(
        (x) => x.productId === product.productId
      );
      if (isNil(calculatedProduct)) {
        product.calculatedData = {
          product: product.userProductPrice * product.quantity,
          productPrice: product.userProductPrice,
          taxClass: product.taxClass,
          tax: 0,
          shipping: 0,
          discount: 0,
        };
      } else {
        product.calculatedData = clone(calculatedProduct.calculatedData);
      }

      if (product && product.isDiscounted) {
        product.calculatedData.discount =
          (product.discountPercentage * product.calculatedData.product) / 100;
        this.totalDiscountPrice += product.calculatedData.discount;
      }

      product.calculatedData.total =
        product.calculatedData.product +
        product.calculatedData.shipping -
        product.calculatedData.discount;

      this.totalPrice += product.calculatedData.total;
    });
  }

  checkDiscount(total) {
    let totalPrice = total - total * this.discount;
    if (
      !isEmpty(this.discountOrderPercent) &&
      isEmpty(this.discountOrderNumber) &&
      isEmpty(this.discountOrderFirst)
    ) {
      for (const discount of this.discountOrderPercent) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      return totalPrice;
    }
    if (
      isEmpty(this.discountOrderPercent) &&
      isEmpty(this.discountOrderNumber) &&
      !isEmpty(this.discountOrderFirst)
    ) {
      for (const discount of this.discountOrderFirst) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      return totalPrice;
    }
    if (
      !isEmpty(this.discountOrderPercent) &&
      isEmpty(this.discountOrderNumber) &&
      !isEmpty(this.discountOrderFirst)
    ) {
      for (const discount of this.discountOrderPercent) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      for (const discount of this.discountOrderFirst) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      return totalPrice;
    }
    if (
      isEmpty(this.discountOrderPercent) &&
      !isEmpty(this.discountOrderNumber) &&
      isEmpty(this.discountOrderFirst)
    ) {
      for (const numberOrder of this.discountOrderNumber) {
        totalPrice -= numberOrder;
      }
      return totalPrice;
    }
    if (
      !isEmpty(this.discountOrderPercent) &&
      !isEmpty(this.discountOrderNumber) &&
      isEmpty(this.discountOrderFirst)
    ) {
      for (const discount of this.discountOrderPercent) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      for (const numberOrder of this.discountOrderNumber) {
        totalPrice -= numberOrder;
      }
      return totalPrice;
    }
    if (
      !isEmpty(this.discountOrderPercent) &&
      !isEmpty(this.discountOrderNumber) &&
      !isEmpty(this.discountOrderFirst)
    ) {
      for (const discount of this.discountOrderPercent) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      for (const numberOrder of this.discountOrderNumber) {
        totalPrice -= numberOrder;
      }
      for (const discount of this.discountOrderFirst) {
        totalPrice -= (totalPrice * discount) / 100;
      }
      return totalPrice;
    }
    return totalPrice;
  }

  async changeQuantity(index, change) {
    const product = this.cart.products[index];
    if (change) {
      product.quantity++;
    } else {
      product.quantity--;
    }
    if (product.quantity >= 1) {
      this.updateTotalPrice();
      await this.cartService.updateCart(
        { productId: product.productId, product },
        product.quantity,
        product
      );
    } else {
      await this.remove(index);
    }
  }

  async total_weight() {
    let total = 0;
    if(this.cart){
      for (const iterator of this.cart.products) {
        total = total + iterator.product.weight * iterator.quantity;
      }
      return total;
    }
    else{
      return total;
    }
   
  }

  async load_TPL() {
    const params = {
      fromDistrictCode: undefined,
      fromWardCode: undefined,
      toDistrictCode: this.dataInfo.district.id,
      toWardCode: this.dataInfo.ward.id,
      weight: await this.total_weight(),
      orderName: `${this.dataInfo.lastName} ${this.dataInfo.firstName}`,
      orderPhone: this.dataInfo.phoneNumber,
      orderAddress: this.dataInfo.streetAddress,
    };
    if (this.dataInfo.city.id == '' && this.dataInfo.district.id == '' && this.dataInfo.ward.id == '') {
      await this.toasty.error('Vui lòng cập nhật đia chỉ nhận hàng đầy đủ trước khi đặt hàng');
    }
    else{
    const list_tpl = await this.tplService.getAllTPL(params);
    if (!isEmpty(list_tpl)) {
      this.dataInfo.transportation = {
        id: list_tpl[0].id,
        name: list_tpl[0].name,
      };
      this.errorFeeTransport = false;
      this.isSubmit = false;
    } else {
      this.errorFeeTransport = true;
      this.isSubmit = true;
    }
  }

  }

  // Tính phí ship cho đơn hàng
  async calculate_shipping() {
    this.weight = await this.total_weight();
    this.address_calculate = {
      tplId: this.dataInfo.transportation
        ? this.dataInfo.transportation.id + ''
        : undefined,
      fromDistrictCode: '',
      fromWardCode: '',
      toDistrictCode: this.dataInfo.district.id + '',
      toWardCode: this.dataInfo.ward.id + '',
      weight: this.weight,
    };
    this.updateTotalPrice();
    const res = await this.tplService.calculateTPL(this.address_calculate);
    if (res) {
      this.deliverydate = res.leadTimeUnix;
      if (this.authService.getRoleId() !== '3') {
        this.dataInfo.shippingPrice = res.total;
        if (
          this.isCreateOrder &&
          this.roleId !== '3' &&
          this.totalPrice - this.discount * this.totalPrice < 1000000 &&
          this.dataInfo.shippingPrice === 0
        ) {
          this.errorFeeTransport = true;
          this.isSubmit = true;
        } else {
          this.errorFeeTransport = false;
          this.isSubmit = false;
        }
      }
      // this.totalPrice =  this.totalPrice + this.dataInfo.shippingPrice;
    } else {
      this.errorFeeTransport = true;
      this.isSubmit = true;
    }
  }

  async checkFreeShip(order) {
    let isValidDiscount = true;
    if (this.cart.products.length <= order.freeShip.promotionProducts.length) {
      for (const product of this.cart.products) {
        const existProduct = order.freeShip.promotionProducts.find(
          (x) => x._id === product.productId
        );
        if (isNil(existProduct)) {
          isValidDiscount = false;
          break;
        }
      }
      if (isValidDiscount) {
        switch (order.freeShip.applyType) {
          case FreeShipApplyType.AnotherOrder:
            if (this.totalPrice >= order.freeShip.totalOrderPriceCondition) {
              this.isFreeShip = true;
              this.dataInfo.promotions.push(order);
            }
            break;
          case FreeShipApplyType.CurrentOrder:
            if (this.totalPrice >= order.freeShip.totalOrderPriceCondition) {
              this.isFreeShip = true;
              this.currentFreeShipCode = order.code;
              this.currentFreeShipDiscount =
                order.freeShip.shippingPriceDiscount;
              this.currentFreeShip = order;
            }
            break;
        }
      }
    }
  }

  // Tiếp tục để đến màn hình thanh toán
  async submit() {
    this.weight = await this.total_weight();
    await this.systemService.configs().then(async () => {
      if (
        window.appData &&
        window.appData.paymentGatewayConfig &&
        window.appData.paymentGatewayConfig.paymentMethods
      ) {
        this.paymentMethodsConfig =
          window.appData.paymentGatewayConfig.paymentMethods;

        if (
          // tslint:disable-next-line: strict-boolean-conditions
          !this.dataInfo.paymentMethod ||
          !this.paymentMethodsConfig.find(
            (x) => x.value === this.dataInfo.paymentMethod && x.enable
          )
        ) {
          return this.toasty.error(
            this.translate.instant('Payment method not found!')
          );
        } else {
          const sendData = {
            dataInfo: {},
            goodPrice: {},
            giftNewMember: [],
            isCreateOrder: true,
          };
          sendData.dataInfo = this.dataInfo;
          sendData.goodPrice = this.GoodPriceProducts || undefined;
          sendData.giftNewMember = this.sendDataGiftNewMember || [];
          if (
            this.checkDiscount(this.totalPrice) >= this.totalOrderPriceCondition
          ) {
            if (this.change && !isNil(this.GoodPriceProducts)) {
              // this.goodItem = clone(this.dataInfo.goodPriceProduct);
              // this.dataInfo.products.push(this.dataInfo.goodPriceProduct);
              await this.nav.push(PreferentialProducts, sendData);
            }
          }
          this.titleHeader = 'Xác nhận đơn hàng';
          this.isCreateOrder = true;
          if (
            this.roleId !== '3' &&
            this.totalPrice - this.discount * this.totalPrice <= 1000000
          ) {
            await this.calculate_shipping();
          }
          if (this.sendDataGiftNewMember.length > 0) {
            await this.nav.push(GiftNewMemberComponent, sendData);
          }
        }
      } else {
        return this.toasty.error(
          this.translate.instant('Payment method not found!')
        );
      }
    });
  }

  // Trở về màn hình trước đó
  onBack() {
    if (this.isCreateOrder) {
      this.titleHeader = 'Thông tin đơn hàng';
      this.isCreateOrder = false;
      this.recovery();
      // this.ngOnInit();
    } else {
      if (this.prevComponent) {
        return this.nav.setRoot(this.prevComponent);
      }
    }
  }

  // Thanh toán
  async payment() {
    this.isSubmit = true;
    const dataInfoBackup = cloneDeep(this.dataInfo);
    if (this.dataInfo.city.id == '' && this.dataInfo.district.id == '' && this.dataInfo.ward.id == '') {
      await this.toasty.error('Vui lòng cập nhật đia chỉ nhận hàng đầy đủ trước khi đặt hàng');
    }
    else {
    if (this.roleId === '3') {
      this.dataInfo.transportation = undefined;
      this.dataInfo.paymentMethod = undefined;
    }

    if (this.totalPrice >= this.paymentTypePrice) {
      this.dataInfo.transportation = undefined;
    }

    // Momo
    if (this.dataInfo.paymentMethod === this.paymentMethodsConfig[1].value) {
      this.dataInfo.returnUrl = 'tniecommerce://';
      localStorage.setItem('dataInfo', JSON.stringify(this.dataInfo));
    }

    // VNPay
    if (this.dataInfo.paymentMethod === this.paymentMethodsConfig[3].value) {
      this.dataInfo.returnUrl = `${window.appConfig.webUserUrl}/cart/checkout/${this.paymentMethodsConfig[3].value}/callback?platform=${environment.platform}`;
      localStorage.setItem('dataInfo', JSON.stringify(this.dataInfo));
    }

    // ZaloPay
    if (this.dataInfo.paymentMethod === this.paymentMethodsConfig[4].value) {
      this.dataInfo.returnUrl = `tniecommerce://`;
      localStorage.setItem('dataInfo', JSON.stringify(this.dataInfo));
    }

    const currentUser = await this.authService.getCurrentUser();
    this.dataInfo.toHubId = currentUser.inventoryId;
    if (this.dataInfo.promotions) {
      this.dataInfo.promotions = this.dataInfo.promotions.map((x) => x._id);
    }

    this.dataInfo.products.forEach((item) => {
      if (!isNil(item)) {
        if (item.calculatedData) {
          delete item.calculatedData;
        }

        if (item.name) {
          delete item.name;
        }
      }
    });
    for (const item of this.dataInfo.products) {
      if (!isNil(item) && !isEmpty(item.promotions)) {
        item.promotions = await item.promotions.map((x) => x._id);
      }
    }
    const params = pick(this.dataInfo, [
      'products',
      'shipmentTypeId',
      'toHubId',
      'shippingPrice',
      'percentDiscount',
      'transportation',
      'paymentMethod',
      'firstName',
      'lastName',
      'phoneNumber',
      'streetAddress',
      'city',
      'district',
      'ward',
      'zipCode',
      'returnUrl',
      'promotions',
      'freeShipCode',
    ]);

    // distinct list products
    params.products = uniqBy(params.products, 'productId');
    params.products = params.products.filter((x) => !isNil(x));
    await this.orderService
      .createOrder(params)
      .then(async (res) => {
        if (res.code === 200) {
          this.dataInfo = dataInfoBackup;
          if (
            res.data.order.orderStatus === 'failOrdered' &&
            this.dataInfo.paymentMethod !==
              this.paymentMethodsConfig[1].value &&
            this.dataInfo.paymentMethod !==
              this.paymentMethodsConfig[3].value &&
            this.dataInfo.paymentMethod !== this.paymentMethodsConfig[4].value
          ) {
            await this.toasty.error(res.message);
          } else if (
            res.data.order.orderStatus === 'failOrdered' &&
            (this.dataInfo.paymentMethod ===
              this.paymentMethodsConfig[1].value ||
              this.dataInfo.paymentMethod ===
                this.paymentMethodsConfig[3].value ||
              this.dataInfo.paymentMethod ===
                this.paymentMethodsConfig[4].value)
          ) {
            // Redirect to MoMo payment page
            if (
              this.dataInfo.paymentMethod === this.paymentMethodsConfig[1].value
            ) {
              setTimeout(() => {
                this.isSubmit = false;
              }, 800);
              localStorage.setItem('orderCode', res.data.order.orderCode);
              localStorage.setItem('orderId', res.data.order._id);
              localStorage.setItem('paymentMethod', 'momo');

              this.platform.ready().then(() => {
                if (this.platform.is('android')) {
                  window.location.href = res.data.order.payUrl;
                } else {
                  this.safariViewController.isAvailable()
                    .then((available: boolean) => {
                        if (available) {
                          this.safariViewController.show({
                            url: res.data.order.payUrl,
                            hidden: false,
                            animated: false,
                            transition: 'curl',
                            enterReaderModeIfAvailable: true,
                            tintColor: '#000000'
                          })
                            .subscribe((result: any) => {
                                // if(result.event === 'opened') console.log('Opened');
                                // else if(result.event === 'loaded') console.log('Loaded');
                                // else if(result.event === 'closed') console.log('Closed');
                              },
                              (error: any) => {
                                // console.error(error)
                              }
                            );

                        } else {
                          // use fallback browser, example InAppBrowser
                        }
                      }
                    );

                }
              });
            }

            // VNPay
            if (
              this.dataInfo.paymentMethod === this.paymentMethodsConfig[3].value
            ) {
              localStorage.setItem('paymentMethod', 'vnpay');
              const orderCode = res.data.order.orderCode;
              setTimeout(() => {
                this.isSubmit = false;
              }, 800);
              const paymentTab = this.inAppBrowser.create(
                res.data.order.vnpUrl,
                '_blank'
              );
              paymentTab.on('exit').subscribe(async () => {
                this.cartService
                  .callBackPayment({ requestId: orderCode }, 'vnpay')
                  .then(async (response) => {
                    if (response.data.errorCode === '00') {
                      await this.toasty.success('Tạo đơn hàng thành công!');
                      localStorage.removeItem('shipToThisAddressId');
                      this.prevComponent = ResultOrderComponent;
                      return this.nav.setRoot(ResultOrderComponent, true);
                      } else {
                      return this.nav.setRoot(CheckoutComponent);
                    }
                  });
              });
            }

            // ZaloPay
            if (
              this.dataInfo.paymentMethod === this.paymentMethodsConfig[4].value
            ) {
              localStorage.setItem('paymentMethod', 'zalopay');
              const orderCode = res.data.order.orderCode;

              // Redirect to zalopay app
              const zalopay_token = res.data.order && res.data.order.zaloPayToken ? res.data.order.zaloPayToken : "";
              if (zalopay_token !== "") {
                setTimeout(() => {
                  this.isSubmit = false;
                }, 800);
                localStorage.setItem('orderCode', orderCode);
                  cordova.plugins.ZaloPayPlugin.payOrder(zalopay_token, function (response) {
                  // switch (response.status) {
                  //   case STATUS_SUCCESS:
                  //   this.cartService.callBackPayment({ requestId: orderCode }, this.dataInfo.paymentMethod);
                  //   localStorage.removeItem('shipToThisAddressId');
                  //   this.prevComponent = ResultOrderComponent;
                  //   return this.nav.setRoot(ResultOrderComponent, true);
                  // }
                }.bind(this));
                } else {
                this.isSubmit = false;
              }
            }
          } else if (
            res.data.order.orderStatus === 'ordered' ||
            res.data.order.orderStatus === 'confirmed'
          ) {
            if (
              this.dataInfo.paymentMethod !==
                this.paymentMethodsConfig[1].value &&
              this.dataInfo.paymentMethod !==
                this.paymentMethodsConfig[3].value &&
              this.dataInfo.paymentMethod !== this.paymentMethodsConfig[4].value
            ) {
              await this.toasty.success('Tạo đơn hàng thành công!');
              localStorage.removeItem('shipToThisAddressId');
              this.prevComponent = ResultOrderComponent;
              return this.nav.setRoot(ResultOrderComponent, true);
            }
          }
        } else {
          return this.toasty.error(res.message);
        }
      })
      .catch(async (res) => {
        if (res.status === 400) {
          await this.toasty.error(res.data.message);
        } else {
          await this.toasty.error('Tạo đơn hàng không thành công!');
        }
        this.isSubmit = false;
      });
  }

  }

  // Thay đổi địa chỉ giao hàng
  changeAddress(flagchange) {
    //this.prevComponent = AddressComponent;
    return this.nav.push(
      AddressComponent,
      { dataInfo: this.dataInfo, flagchange },
      { animate: false }
    );
  }

  // ionViewWillEnter() {
  //   this.tabsService.hide();
  // }

  ionViewWillLeave() {
    this.tabsService.show();
  }

  async applyPromotionCode() {
    try {
      if (!isEmpty(this.promotionCode)) {
        if (
          this.isFreeShip &&
          this.currentFreeShipCode === this.promotionCode
        ) {
          if (this.dataInfo.shippingPrice < this.currentFreeShipDiscount) {
            this.freeShipAmount = this.dataInfo.shippingPrice;
          } else {
            this.freeShipAmount = this.currentFreeShipDiscount;
          }
          this.freeShipDiscount = this.currentFreeShipDiscount;
          this.isApplyPromotionCode = true;
          this.dataInfo.promotions.push(this.currentFreeShip);
        } else if (this.currentFreeShipCode !== this.promotionCode && !this.isApplyPromotionCode) {
          await this.orderService
            .checkCodePromotionFreeShip({
              code: this.promotionCode,
            })
            .then((freeShipCode) => {
              if (
                this.dataInfo.shippingPrice <
                freeShipCode.data.freeShip.shippingPriceDiscount
              ) {
                this.freeShipAmount = this.dataInfo.shippingPrice;
              } else {
                this.freeShipAmount =
                  freeShipCode.data.freeShip.shippingPriceDiscount;
              }
              this.freeShipDiscount =
                freeShipCode.data.freeShip.shippingPriceDiscount;
              this.dataInfo.freeShipCode = this.promotionCode;
              this.isApplyPromotionCode = true;
              this.dataInfo.promotions.push(freeShipCode.data);
            });
          return;
        } else {
          await this.toasty.error('Mã khuyến mãi không hợp lệ!');
        }
      } else {
        await this.toasty.error('Vui lòng nhập mã khuyến mãi!');
      }
    } catch (error) {
      await this.toasty.error(this.translate.instant(error.data.message));
    }
  }

  removePromotionCode() {
    this.isApplyPromotionCode = false;
    this.promotionCode = '';
    this.freeShipDiscount = 0;
    this.dataInfo.freeShipCode = '';
  }
}
