import { Injectable } from '@angular/core';
import { isNil, isEmpty, isArray, clone, isNull } from 'lodash';
import { CartService, ToastyService } from '.';
import {
  GiveGiftType,
  ApplyCondition,
  PromotionForm,
  DiscountType,
} from '../app/enums';
import { PromotionService } from './promotion.service';
import { Subject } from 'rxjs';

@Injectable()
export class CheckoutService {
  private giftForOrderChanged = new Subject();
  giftForOrderChanged$ = this.giftForOrderChanged.asObservable();

  constructor(
    private cartService: CartService,
    private toasty: ToastyService,
    private promotionService: PromotionService,
  ) {}

  async initializeCheckout(userMe, role_discount) {
    const response = {
      isSuccess: true,
      userInfo: {
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
      },
      discount: 0,
      dataInfo: {
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
      },
      role_discount: {
        we_free: 0,
        we: 4,
        hubs: 7,
      },
    };
    if (!isNil(userMe.data)) {
      response.userInfo.lastName = userMe.data.name.slice(
        userMe.data.name.lastIndexOf(' ') + 1,
        userMe.data.name.length
      );
      response.dataInfo.lastName = response.userInfo.lastName;
      response.userInfo.firstName = userMe.data.name.slice(
        0,
        userMe.data.name.lastIndexOf(response.userInfo.lastName) - 1
      );
      response.dataInfo.firstName = response.userInfo.firstName;
      response.userInfo.email = userMe.data.email;
      response.userInfo.phoneNumber = userMe.data.phoneNumber;
      response.dataInfo.phoneNumber = response.userInfo.phoneNumber;
      response.userInfo.streetAddress = userMe.data.address;

      if (userMe.data.userRoles[0].Role === 0) {
        response.dataInfo.percentDiscount = 0;
      }
      else if(userMe.data.userRoles[0].Role === 5){
        response.dataInfo.percentDiscount = role_discount.we_free
          ? role_discount.we_free
          : 0;
      }
      else if (
        userMe.data.userRoles[0].Role === 1 ||
        userMe.data.userRoles[0].Role === 2
      ) {
        response.dataInfo.percentDiscount = role_discount.we
          ? role_discount.we
          : 0;
      } else if (userMe.data.userRoles[0].Role === 3) {
        response.dataInfo.percentDiscount = role_discount.hubs
          ? role_discount.hubs
          : 0;
      }
      response.discount = response.dataInfo.percentDiscount;
      response.dataInfo.percentDiscount =
        response.dataInfo.percentDiscount / 100;
    } else {
      await this.toasty.error(
        'Bạn chưa là WE đại lý, vui lòng nạp 500k để kích hoạt tài khoản.'
      );
      response.isSuccess = false;
    }
    return response;
  }

  async discountOrderFollowProductQuantity(product, promotion) {
    const response = {
      listQuantity: [],
      product: {},
    };
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
      response.listQuantity.push(obj);
    }
    await this.cartService.updateCart(product, product.quantity, product);
    response.product = product;
    return response;
  }

  async productDiscount(product, promotion) {
    const response = {
      totalChange: 0,
      listProductChange: [],
      product: {},
    };
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
      response.totalChange = product.calculatedData.total;
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
      response.listProductChange.push(obj);
      response.product = product;
      await this.cartService.updateCart(product, product.quantity, product);
    }
    return response;
  }

  async buyGoodPriceProduct(
    promotion: {
      buyGoodPriceProduct: {
        promotionProducts: { product: { _id: string } }[];
        totalOrderPriceCondition: number;
      };
    },
    cart: { products: { productId: string }[] },
    totalPrice: number,
    discount,
    discountOrderPercent,
    discountOrderNumber,
    discountOrderFirst
  ) {
    const response = {
      totalOrderPriceCondition: 0,
      goodPriceProducts: {},
    };
    let isValidDiscount = true;
    if (
      cart.products.length <=
      promotion.buyGoodPriceProduct.promotionProducts.length
    ) {
      for (const product of cart.products) {
        const existProduct = promotion.buyGoodPriceProduct.promotionProducts.find(
          (x) => x.product._id === product.productId
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
        this.checkDiscount(
          totalPrice,
          discount,
          discountOrderPercent,
          discountOrderNumber,
          discountOrderFirst
        ) >= promotion.buyGoodPriceProduct.totalOrderPriceCondition
      ) {
        response.totalOrderPriceCondition =
          promotion.buyGoodPriceProduct.totalOrderPriceCondition;
        response.goodPriceProducts = promotion;
      }
    }
    return response;
  }

  checkDiscount(
    total,
    discount,
    discountOrderPercent,
    discountOrderNumber,
    discountOrderFirst
  ) {
    let totalPrice = total - (total * discount) / 100;
    if (
      !isEmpty(discountOrderPercent) &&
      isEmpty(discountOrderNumber) &&
      isEmpty(discountOrderFirst)
    ) {
      for (const discountPercent of discountOrderPercent) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      return totalPrice;
    }
    if (
      isEmpty(discountOrderPercent) &&
      isEmpty(discountOrderNumber) &&
      !isEmpty(discountOrderFirst)
    ) {
      for (const discountPercent of discountOrderFirst) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      return totalPrice;
    }
    if (
      !isEmpty(discountOrderPercent) &&
      isEmpty(discountOrderNumber) &&
      !isEmpty(discountOrderFirst)
    ) {
      for (const discountPercent of discountOrderPercent) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      for (const discountPercent of discountOrderFirst) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      return totalPrice;
    }
    if (
      isEmpty(discountOrderPercent) &&
      !isEmpty(discountOrderNumber) &&
      isEmpty(discountOrderFirst)
    ) {
      for (const numberOrder of discountOrderNumber) {
        totalPrice -= numberOrder;
      }
      return totalPrice;
    }
    if (
      !isEmpty(discountOrderPercent) &&
      !isEmpty(discountOrderNumber) &&
      isEmpty(discountOrderFirst)
    ) {
      for (const discountPercent of discountOrderPercent) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      for (const numberOrder of discountOrderNumber) {
        totalPrice -= numberOrder;
      }
      return totalPrice;
    }
    if (
      !isEmpty(discountOrderPercent) &&
      !isEmpty(discountOrderNumber) &&
      !isEmpty(discountOrderFirst)
    ) {
      for (const discountPercent of discountOrderPercent) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      for (const numberOrder of discountOrderNumber) {
        totalPrice -= numberOrder;
      }
      for (const discountPercent of discountOrderFirst) {
        totalPrice -= (totalPrice * discountPercent) / 100;
      }
      return totalPrice;
    }
    return totalPrice;
  }

  async discountOrderForNewMember(
    order,
    cart,
    totalPrice: number,
    discount,
    discountOrderPercent,
    discountOrderNumber,
    discountOrderFirst,
    currentOrder
  ) {
    const response = {
      discountOrderFirst: [],
      percentNew: 0,
      promotions: [],
    };
    let countProduct = 0;
    for (const product of cart.products) {
      const existProduct = order.discountOrderForNewMember.promotionProducts.find(
        (x) => x._id === product.productId
      );
      if (existProduct) {
        countProduct += 1;
      }
    }
    if (countProduct === cart.products.length) {
      for (const discountNew of order.discountOrderForNewMember
        .orderConditions) {
        if (
          discountNew.orderNumber === currentOrder + 1 &&
          discountNew.totalOrderPriceCondition <=
            this.checkDiscount(
              totalPrice,
              discount,
              discountOrderPercent,
              discountOrderNumber,
              discountOrderFirst
            )
        ) {
          response.discountOrderFirst.push(discountNew.discountPercent);
          response.percentNew = discountNew.discountPercent;
          response.promotions.push(order);
        }
      }
    }
    return response;
  }

  async giveSomeGiftForNewMember(
    order: {
      giveSomeGiftForNewMember: {
        gifts: { gift; quantity }[];
        orderConditions: {
          orderNumber: number;
          totalOrderPriceCondition: number;
        }[];
        promotionProducts: { _id: string }[];
        giveGiftType: string;
      };
    },
    cart,
    totalPrice: number,
    currentOrder: number,
    discount: number
  ) {
    const response = {
      giftForNewbies: [],
      promotions: [],
      sendDataGiftNewMember: [],
    };
    let coefficient: number;
    let countProduct = 0;
    for (const product of cart.products) {
      const existProduct = order.giveSomeGiftForNewMember.promotionProducts.find(
        (x) => x._id === product.productId
      );
      if (existProduct) {
        countProduct += 1;
      }
    }
    if (
      isArray(order.giveSomeGiftForNewMember.orderConditions) &&
      countProduct === cart.products.length
    ) {
      for (const giveSomeGift of order.giveSomeGiftForNewMember
        .orderConditions) {
        if (
          giveSomeGift.orderNumber === currentOrder + 1 &&
          giveSomeGift.totalOrderPriceCondition <=
            totalPrice - (discount / 100) * totalPrice
        ) {
          coefficient = Math.floor(
            (totalPrice - (discount / 100) * totalPrice) /
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
              response.giftForNewbies.push(...param);
            }
            response.promotions.push(order);
          } else {
            if (isArray(order.giveSomeGiftForNewMember.gifts)) {
              for (const item of order.giveSomeGiftForNewMember.gifts) {
                item.gift.quantity = item.quantity * coefficient;
              }
              const param = order.giveSomeGiftForNewMember.gifts.map((gift) => {
                return gift.gift;
              });
              response.sendDataGiftNewMember.push(param);
              response.promotions.push(order);
            }
          }
        }
      }
    }
    return response;
  }

  async checkBuyGood(
    totalPrice,
    discount,
    discountOrderPercent,
    discountOrderNumber,
    discountOrderFirst
  ) {
    const getAllPromotions = await this.promotionService.promotionForUser();
    const response = {
      currentOrder: 0,
      listPromotion: [],
      listOrderDetail: [],
      totalOrderPriceCondition: 0,
      goodPriceProducts: [],
    };
    response.currentOrder = getAllPromotions.data.countOrder;
    response.listPromotion = getAllPromotions.data.items;
    response.listOrderDetail = getAllPromotions.data.items.filter((pr) => {
      return pr.applyCondition === ApplyCondition.OrderDetail;
    });
    const discountPrice = this.checkDiscount(
      totalPrice,
      discount,
      discountOrderPercent,
      discountOrderNumber,
      discountOrderFirst
    );
    for (const orderDetail of response.listOrderDetail) {
      // buyGoodPriceProduct
      if (orderDetail.promotionForm === PromotionForm.BuyGoodPriceProduct) {
        if (
          discountPrice >=
          orderDetail.buyGoodPriceProduct.totalOrderPriceCondition
        ) {
          response.totalOrderPriceCondition =
            orderDetail.buyGoodPriceProduct.totalOrderPriceCondition;
          response.goodPriceProducts = orderDetail;
        }
      }
    }
    return response;
  }

  async calculatePercent(
    totalPrice,
    discount,
    discountOrderPercent,
    discountOrderNumber,
    discountOrderFirst
  ) {
    const response = {
      totalAfterPercentFirst: [],
      totalAfterOrder: [],
    };
    if (
      isEmpty(discountOrderPercent) &&
      isEmpty(discountOrderNumber) &&
      !isEmpty(discountOrderFirst)
    ) {
      let total = totalPrice - (totalPrice * discount) / 100;
      const arr = [];
      for (const discountPercent of discountOrderFirst) {
        arr.push((total * discountPercent) / 100);
        total = total - (total * discountPercent) / 100;
      }
      response.totalAfterPercentFirst = arr;
      return response;
    }

    if (
      !isEmpty(discountOrderPercent) &&
      isEmpty(discountOrderNumber) &&
      isEmpty(discountOrderFirst)
    ) {
      let total = totalPrice - (totalPrice * discount) / 100;
      const arr = [];
      for (const discountPercent of discountOrderPercent) {
        arr.push((total * discountPercent) / 100);
        total = total - (total * discountPercent) / 100;
      }
      response.totalAfterOrder = arr;
      return response;
    }

    if (
      !isEmpty(discountOrderPercent) &&
      isEmpty(discountOrderNumber) &&
      !isEmpty(discountOrderFirst)
    ) {
      let total = totalPrice - (totalPrice * discount) / 100;
      const arrFirst = [];
      const arrOrder = [];
      for (const discountPercent of discountOrderPercent) {
        arrOrder.push((total * discountPercent) / 100);
        total = total - (total * discountPercent) / 100;
      }
      response.totalAfterOrder = arrOrder;
      for (const {} of discountOrderFirst) {
        arrFirst.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      response.totalAfterPercentFirst = arrFirst;
      return response;
    }
    if (
      isEmpty(discountOrderPercent) &&
      !isEmpty(discountOrderNumber) &&
      isEmpty(discountOrderFirst)
    ) {
      let total = totalPrice - (totalPrice * discount) / 100;
      const arr = [];
      for (const discountNumber of discountOrderNumber) {
        arr.push(total - discountNumber);
        total = total - discountNumber;
      }
      response.totalAfterOrder = arr;
      return response;
    }
    if (
      !isEmpty(discountOrderPercent) &&
      !isEmpty(discountOrderNumber) &&
      isEmpty(discountOrderFirst)
    ) {
      let total = totalPrice - (totalPrice * discount) / 100;
      const arrOrder = [];
      for (const discountPercent of discountOrderPercent) {
        arrOrder.push((total * discountPercent) / 100);
        total = total - (total * discountPercent) / 100;
      }
      response.totalAfterOrder = arrOrder;
      for (const numberOrder of discountOrderNumber) {
        arrOrder.push(total - numberOrder);
        total = total - numberOrder;
      }
      response.totalAfterOrder = arrOrder;
      return response;
    }
    if (
      !isEmpty(discountOrderPercent) &&
      !isEmpty(discountOrderNumber) &&
      !isEmpty(discountOrderFirst)
    ) {
      let total = totalPrice - (totalPrice * discount) / 100;
      const arrOrder = [];
      const arrFirst = [];
      for (const {} of discountOrderPercent) {
        arrOrder.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      response.totalAfterOrder = arrOrder;
      for (const numberOrder of discountOrderNumber) {
        arrOrder.push(total - numberOrder);
        total = total - numberOrder;
      }
      response.totalAfterOrder = arrOrder;
      for (const {} of discountOrderFirst) {
        arrFirst.push((total * discount) / 100);
        total = total - (total * discount) / 100;
      }
      response.totalAfterPercentFirst = arrFirst;
      return response;
    }
    return response;
  }

  async updateTotalPrice(cart) {
    const response = {
      totalPrice: 0,
      totalTaxPrice: 0,
      totalDiscountPrice: 0,
      cart: {},
    };
    if (!cart.products.length) {
      return;
    }
    const tempCart = clone(cart);
    tempCart.products.forEach((product) => {
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
        response.totalDiscountPrice += product.calculatedData.discount;
      }
      if (product.taxPercentage && product.taxClass) {
        product.calculatedData.taxClass = product.taxClass;
        product.calculatedData.tax =
          product.calculatedData.product * (product.taxPercentage / 100);
        response.totalTaxPrice += product.calculatedData.tax;
      }

      product.calculatedData.total =
        product.calculatedData.product +
        product.calculatedData.tax +
        product.calculatedData.shipping -
        product.calculatedData.discount;

      response.totalPrice += product.calculatedData.total;
    });
    response.cart = tempCart;
    return response;
  }

  async orderDiscount(
    order,
    cart,
    totalPrice,
    discount,
    discountOrderPercent,
    discountOrderNumber,
    discountOrderFirst
  ) {
    const response = {
      discountOrderPercent: [],
      promotions: [],
      discountOrderNumber: [],
    };
    let countProduct = 0;
    const discountPrice = this.checkDiscount(
      totalPrice,
      discount,
      discountOrderPercent,
      discountOrderNumber,
      discountOrderFirst
    );
    if (discountPrice >= order.orderDiscount.totalOrderPriceCondition) {
      for (const product of cart.products) {
        const existProduct = order.orderDiscount.promotionProducts.find(
          (x) => x._id === product.productId
        );
        if (existProduct) {
          countProduct += 1;
        }
      }

      if (countProduct === cart.products.length) {
        if (order.orderDiscount.discountType === DiscountType.Percent) {
          response.discountOrderPercent.push(
            order.orderDiscount.discountOrderValue
          );
          response.promotions.push(order);
        }
        if (order.orderDiscount.discountType === DiscountType.Number) {
          response.discountOrderNumber.push(
            order.orderDiscount.discountOrderValue
          );
          response.promotions.push(order);
        }
      }
    }
    return response;
  }

  async checkoutDiscount(order, cart, quantityProduct) {
    let ratio = 0;
    const listGiftCheckout = [];
    const response = {
      giveGiftType: '',
      sendDataGiftOrderQuantity: [],
      products: [],
      promotions: [],
      listGiftCheckout: []
    };
    if(isNull(order.checkoutDiscount.orderQuantity)){
      if (cart.products.length !== order.checkoutDiscount.promotionProducts.length) {
        return response;
      }
    }else{
      if (quantityProduct < order.checkoutDiscount.orderQuantity) {
        return response;
      }
    }

    for (const product of cart.products) {
      const existProduct = order.checkoutDiscount.promotionProducts.find(
        (x) => x.product._id === product.productId
      );
      if (isNil(existProduct)) {
        return response;
      }

      const ratioItem = parseInt(
        (product.quantity / existProduct.quantity).toString(),
        10
      );
      
      if(ratioItem <= 0){
        return response;
      }else if ((ratioItem > 0 && ratioItem < ratio) || ratio === 0) {
        ratio = ratioItem;
      }
    }

    if (!isNull(order.checkoutDiscount.orderQuantity)) {
      ratio =  parseInt(
        (
          quantityProduct /
          order.checkoutDiscount.orderQuantity
        ).toString(),
        10
      )
    }
    
    if (ratio > 0) {
      response.giveGiftType = order.checkoutDiscount.giveGiftType;
      const gifts = order.checkoutDiscount.gifts;
      for (const gift of gifts) {
        const quantityGift = gift.quantity * ratio;
        gift.quantityGift = quantityGift;
        if (response.giveGiftType === GiveGiftType.And) {
          gift.isChoose = true;
        }else{
          gift.isChoose = false;
        }
        listGiftCheckout.push(gift);
        response.sendDataGiftOrderQuantity.push(gift);
      }
      const listGift = listGiftCheckout.map((item) => {
        item = {
          productId: item.gift._id,
          quantity: item.quantityGift,
          promotions: [],
        };
        return item;
      });
      response.products = [
        ...listGift,
      ];
      response.listGiftCheckout = listGiftCheckout;
      response.promotions.push(order);
    }
    return response;
  }

  async checkoutPercentOrMoneyDiscount(order, cart, quantityProduct) {
    let isValidDiscount = true;
    const response = {
      discountOrderPercent: [],
      discountOrderNumber: [],
      promotions: []
    }
    if (
      cart.products.length <=
      order.checkoutPercentOrMoneyDiscount.promotionProducts.length
    ) {
      for (const product of cart.products) {
        const existProduct = order.checkoutPercentOrMoneyDiscount.promotionProducts.find(
          (x) => x.product._id === product.productId
        );
        if(isNil(order.checkoutPercentOrMoneyDiscount.orderQuantity)) {
          if (isNil(existProduct) || (product.quantity < existProduct.quantity) ||
          cart.products.length !== order.checkoutPercentOrMoneyDiscount.promotionProducts.length) {
            isValidDiscount = false;
            break;
          }
        }

        if(isNil(existProduct) || quantityProduct < order.checkoutPercentOrMoneyDiscount.orderQuantity ) {
          isValidDiscount = false;
          break;
        }
      }
      if (isValidDiscount) {
        if(order.checkoutPercentOrMoneyDiscount.discountType === DiscountType.Number){
          response.discountOrderNumber.push(
            order.checkoutPercentOrMoneyDiscount.discountOrderValue
          );
        }
        if(order.checkoutPercentOrMoneyDiscount.discountType === DiscountType.Percent){
          response.discountOrderPercent.push(
            order.checkoutPercentOrMoneyDiscount.discountOrderValue
          );
        }
        response.promotions.push(order);
      }
    }
    return response;
  }

  async giveGiftForOrder(order, cart, total, discount) {
    let isValidDiscount = true;
    let ratio = 0;
    const response = {
      giveOrderGiftType: '',
      sendDataGiftOrder: [],
      promotions: [],
      listGift: []
    }
    if (
      cart.products.length <=
      order.giveGiftForOrder.promotionProducts.length
    ) {
      for (const product of cart.products) {
        const existProduct = order.giveGiftForOrder.promotionProducts.find(
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
    const totalPrice =
      total - (total * discount) / 100;
    if (isValidDiscount) {
      response.giveOrderGiftType = order.giveGiftForOrder.giveGiftType;
      if (totalPrice >= order.giveGiftForOrder.totalOrderPriceCondition) {
        const gifts = order.giveGiftForOrder.gifts;
        const listGiftCheckout = [];
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
          listGiftCheckout.push(gift);
          response.sendDataGiftOrder.push(gift);
        }
        if (response.giveOrderGiftType === GiveGiftType.And) {
          response.listGift = listGiftCheckout.map((item) => {
            item = {
              productId: item.gift._id,
              quantity: item.quantity,
              promotions: [],
            };
            return item;
          });
        }
        response.promotions.push(order);
      }
    }
    return response;
  }

  async bonusProduct(order, product) {
    let ratio = 0;
    const response = {
      listGiftCheckout: [],
      products: [],
    }
    
    const gift = order.bonusProducts.promotionProducts.find(
      (x) => x.product._id === product.productId
    );
    if (
      !isNil(gift) &&
      product.quantity >= order.bonusProducts.orderQuantity
    ) {
      ratio = parseInt(
        (product.quantity / order.bonusProducts.orderQuantity).toString(),
        10
      );
      const quantity = order.bonusProducts.bonusQuantity * ratio;
      response.listGiftCheckout.push({
        quantityGift: quantity,
        gift: gift.bonusProduct
      });
      const listGift = response.listGiftCheckout.map((item) => {
        item = {
          productId: item.gift._id,
          quantity: item.quantityGift,
          promotions: [order],
        };
        return item;
      });
      response.products = [...listGift];
    }
    return response;
  }
}
