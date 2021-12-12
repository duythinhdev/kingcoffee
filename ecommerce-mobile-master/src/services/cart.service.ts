import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { clone, find, findIndex, isArray, isNil, pick } from 'lodash';
import { SystemService } from './system.service';
import { ToastyService } from './toasty.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';

@Injectable()
export class CartService {
  private cartChanged = new Subject();
  private cart;
  private quantityProduct = 0;
  cartChanged$ = this.cartChanged.asObservable();
  oldCart;

  constructor(
    private restangular: Restangular,
    private systemService: SystemService,
    private toasty: ToastyService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    // TODO - load cart from local storage
    const cartData = localStorage.getItem('cart');
    this.cart = !isNil(cartData) ? JSON.parse(cartData) : [];
    this.oldCart = this.cart ? clone(this.cart) : [];
    this.cartChanged.next(this.cart);
  }

  async get() {
    if (this.authService.isLoggedin()) {
      const currentUser = await this.authService.me();
      const cart = this.cart.filter((x) => {
        return x.username === currentUser.data.username;
      });
      this.quantityProduct = 0;
      cart.map((m) => {
        this.quantityProduct += m.quantity;
      });
      localStorage.setItem(
        'quantityProduct',
        JSON.stringify(this.quantityProduct)
      );
      return cart;
    }
  }

  backup() {
    this.oldCart = this.cart ? clone(this.cart) : [];
  }

  recovery() {
    this.cart = this.oldCart ? clone(this.oldCart) : this.cart;
    this.cartChanged.next(this.cart);
  }

  async updateCart(data, quantity: number, product) {
    if (!isNil(data) && !isNil(product)) {
      const currentUser = await this.authService.me();
      await this.remove(product);
      this.cart.unshift({
        username: currentUser.data.username,
        productId: data.productId,
        productVariantId: data.productVariantId,
        product: data.product,
        quantity,
        calculatedData: data.calculatedData ? data.calculatedData : undefined,
        promotions: data.promotions ? data.promotions : undefined,
      });
      const tempCart = this.cart.filter((x) => {
        return x.username === currentUser.data.username;
      });
      localStorage.setItem('cart', JSON.stringify(tempCart));
      this.quantityProduct = 0;
      tempCart.map((m) => {
        this.quantityProduct += m.quantity;
      });
      localStorage.setItem(
        'quantityProduct',
        JSON.stringify(this.quantityProduct)
      );
      this.cartChanged.next(tempCart);
    }
  }

  async add(data, quantity: number) {
    const currentUser = await this.authService.me();
    const existProduct = find(
      this.cart,
      (c) =>
        c.productId === data.productId &&
        c.username === currentUser.data.username
    );
    if (
      existProduct &&
      data.productVariantId === existProduct.productVariantId
    ) {
      return this.toasty.error(
        this.translate.instant('This product already has been added to cart.')
      );
    } else {
      this.cart.unshift({
        username: currentUser.data.username,
        productId: data.productId,
        productVariantId: data.productVariantId,
        product: data.product,
        quantity,
      });
    }
    const tempCart = await this.cart.filter((x) => {
      return x.username === currentUser.data.username;
    });
    localStorage.setItem('cart', JSON.stringify(tempCart));
    this.quantityProduct = 0;
    tempCart.map((m) => {
      this.quantityProduct += m.quantity;
    });
    localStorage.setItem(
      'quantityProduct',
      JSON.stringify(this.quantityProduct)
    );
    this.cartChanged.next(tempCart);
  }

  async remove(product) {
    if (this.authService.isLoggedin()) {
      const currentUser = await this.authService.me();
      const index = findIndex(
        this.cart,
        (c: { productId: string; username: string }) =>
          c.productId === product.productId &&
          c.username === currentUser.data.username
      );
      if (index > -1) {
        this.cart.splice(index, 1);
      }
      this.quantityProduct = 0;
      const tempCart = await this.cart.filter((x) => {
        return x.username === currentUser.data.username;
      });
      localStorage.setItem('cart', JSON.stringify(tempCart));

      await tempCart.map((m) => {
        this.quantityProduct += m.quantity;
      });
      localStorage.setItem(
        'quantityProduct',
        JSON.stringify(this.quantityProduct)
      );
      this.cartChanged.next(tempCart);
    }
  }

  async checkExistProd(currentCart) {
    const productLength = currentCart.products
      ? currentCart.products.length
      : currentCart.length;
    if (productLength === 0) {
      return this.clean();
    } else {
      const currentUser = await this.authService.me();
      const tempCart = this.cart.filter((x) => {
        return x.username === currentUser.data.username;
      });
      this.cartChanged.next(tempCart);
    }
  }

  async clean() {
    if (this.authService.isLoggedin()) {
      const currentUser = await this.authService.me();
      this.cart = this.cart.filter((x) => {
        return x.username !== currentUser.data.username;
      });
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.quantityProduct = 0;
      this.cart.map((m) => {
        this.quantityProduct += m.quantity;
      });
      localStorage.setItem(
        'quantityProduct',
        JSON.stringify(this.quantityProduct)
      );
      this.cartChanged.next(
        this.cart.filter((x) => {
          return x.username === currentUser.data.username;
        })
      );
    }

    localStorage.removeItem('quantityProduct');
    localStorage.removeItem('cart');
    localStorage.removeItem('orderCode');
    localStorage.removeItem("orderId");
    this.cartChanged.next([]);
  }

  checkout(params) {
    return this.restangular.one('orders').customPOST(params).toPromise();
  }

  callBackPayment(params, paymentMethod) {
    return this.restangular.one(`payment/${paymentMethod}/callback`).get(params).toPromise();
  }

  verifyCOD(params) {
    return this.restangular
      .one('orders', 'phone', 'check')
      .customPOST(params)
      .toPromise();
  }

  calculate() {
    return this.systemService.configs().then(async (systemConfig) => {
     
      const currentUser = await this.authService.me();
      const tempCart = this.cart.filter((x) => {
        return x.username === currentUser.data.username;
      });
      if (!isArray(tempCart)) {
        return Promise.resolve({
          products: [],
          userCurrency: systemConfig.customerCurrency,
        });
      }
      return this.restangular
        .one('cart', 'calculate')
        .customPOST({
          products: tempCart.map((product) =>
            pick(product, ['productId', 'productVariantId', 'quantity'])
          ),
          userCurrency: systemConfig.customerCurrency,
        })
        .toPromise();
    });
  }

  async calculateShip(data, cart) {
    this.cartChanged.next(cart);
    return this.restangular
      .all('cart/calculate')
      .customPOST({
        products: cart,
      })
      .toPromise();
  }
}
