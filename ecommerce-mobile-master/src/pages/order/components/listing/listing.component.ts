import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Content, NavController } from 'ionic-angular';
import { AuthService, CartService, OrderService } from '../../../../services';
import { OrderViewComponent } from '../../components';
import { CheckoutComponent } from '../../../cart/components/checkout/checkout.component';

@Component({
  selector: 'order-listing',
  templateUrl: './listing.html',
})
export class OrderListingComponent implements OnInit {
  @ViewChild('top') top: Content;
  tab1Root;
  tab2Root;
  tab3Root;

  orders = [];
  page = 1;
  take = 10;
  total = 0;
  searchFields = {
    orderStatus: '',
  };
  sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc',
  };
  viewPage = OrderViewComponent;
  scrollHeight = 0;

  orderCode = '';
  loadingSearch = true;
  timeOutSearch;
  status = [
    { name: 'ordered', value: 'Đặt hàng thành công' },
    // {name: 'confirmed', value: "TNI tiếp nhận"},
    { name: 'processing', value: 'Đang xử lý đơn hàng' },
    { name: 'handedOver', value: 'Đóng gói & Bàn giao vận chuyển' },
    { name: 'shipping', value: 'Đang vận chuyển' },
    { name: 'successDelivered', value: 'Giao hàng thành công' },
    { name: 'canceled', value: 'Đơn hàng đã bị huỷ' },
    { name: 'failDelivered', value: 'Giao hàng thất bại' },
    { name: 'failOrdered', value: 'Đặt hàng thất bại' },
    { name: 'scanned', value: 'Đơn hàng QR code' },
  ];
  dataInfo = {
    products: [
      // {
      //     "productId": "5f7313b17583580018e871e0",
      //     "quantity": 1
      // }
    ],
    shipmentTypeId: 1,
    toHubId: 3,
    shippingPrice: 0,
    percentDiscount: 0.07,
    transportation: {
      id: 6,
      name: 'Giao Hàng Nhanh',
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
  };

  roleId;
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private zone: NgZone,
    public nav: NavController,
    private auth: AuthService
  ) {
    const role = auth.getRoleId();
    if (role === '3') {
      this.status.splice(1, 0, { name: 'confirmed', value: 'TNI tiếp nhận' });
    }
  }

  async ngOnInit() {
    this.roleId = this.auth.getRoleId();
    await this.query();
  }

  async query() {
    const params = {
      page: this.page,
      take: this.take,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`,
      orderCode: this.orderCode,
      ...this.searchFields,
    };
    await this.orderService.find(params).then((res) => {
      if (res && res.data && res.data.count > 0) {
        this.orders = res.data.items;
        this.total = res.data.count;
      } else {
        this.orders = [];
        this.total = 0;
      }

      if (this.orders.length > 0) {
        this.orders.map((x) => {
          const find = this.status.find(
            (status) => status.name === x.orderStatus
          );
          if (find) {
            x.statusText = find.value;
          }
        });
      }
    });
  }

  async order_again(id) {
    const find = this.orders.find((x) => x._id === id);
    if (find) {
      const list_product = [];
      for (const detail of find.details) {
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

      if (this.roleId !== '3') {
        this.dataInfo = {
          products: list_product,
          shipmentTypeId: 1,
          toHubId: 3,
          shippingPrice: find.shippingPrice,
          percentDiscount: find.percentDiscount,
          transportation: {
            id: 6,
            name: 'Giao Hàng Nhanh',
          },
          paymentMethod: find.transaction
            ? find.transaction.paymentGateway
            : undefined,
          firstName: find.firstName,
          lastName: find.lastName,
          phoneNumber: find.phoneNumber,
          streetAddress: find.streetAddress,
          city: find.city,
          district: find.district,
          ward: find.ward,
          zipCode: find.zipCode,
          returnUrl: '',
        };
      } else {
        this.dataInfo = {
          products: list_product,
          shipmentTypeId: 1,
          toHubId: 3,
          shippingPrice: find.shippingPrice,
          percentDiscount: find.percentDiscount,
          transportation: undefined,
          paymentMethod: undefined,
          firstName: find.firstName,
          lastName: find.lastName,
          phoneNumber: find.phoneNumber,
          streetAddress: find.streetAddress,
          city: find.city,
          district: find.district,
          ward: find.ward,
          zipCode: find.zipCode,
          returnUrl: '',
        };
      }
    }
    return this.nav.setRoot(CheckoutComponent, this.dataInfo);
  }

  async changeStatus(status) {
    this.searchFields.orderStatus = status;
    await this.query();
  }

  async searchOrder() {
    clearTimeout(this.timeOutSearch);

    this.timeOutSearch = setTimeout(async () => {
      this.page = 1;
      this.loadingSearch = false;
      await this.query();
    }, 3000);
  }

  async doInfinite(infiniteScroll) {
    const params = {
      page: this.page + 1,
      take: this.take,
      ...this.searchFields,
    };
    await this.orderService.find(params).then((res) => {
      this.orders = this.orders.concat(res.data.items);
      this.total = res.data.count;

      this.orders.map((x) => {
        const find = this.status.find(
          (status) => status.name === x.orderStatus
        );
        if (find) {
          x.statusText = find.value;
        }
      });
      infiniteScroll.complete();
    });
  }

  loading(infiniteScroll) {
    setTimeout(() => {
      infiniteScroll.complete();
    }, 1000);
  }

  async scrollTop() {
    await this.top.scrollToTop();
  }

  onScroll($event) {
    this.zone.run(() => {
      this.scrollHeight = $event.scrollTop;
    });
  }

  async sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    await this.query();
  }

  openOrderDetail(_id) {
    return this.nav.push(OrderViewComponent, _id);
  }
}
