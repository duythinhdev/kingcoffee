import { Component, Input, OnInit, ViewChild,NgZone } from '@angular/core';
import { Content, NavController } from 'ionic-angular';
import { AuthService, CartService, OrderService } from '../../services';
import _ from 'lodash';


@Component({
  selector: 'qrcode-result',
  templateUrl: 'qrcode-result.html'
})
export class QrcodeResultComponent implements OnInit {
  @ViewChild('top') top: Content;
  tab1Root;
  tab2Root;
  tab3Root;
  text: string;
  scrollHeight = 0;
  orders = [];
  page = 1;
  take = 10;
  searchFields = {
    orderStatus: 'scanned',
  };
  sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc',
  };
  total = 0;
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
  constructor(    
    private orderService: OrderService,
    public nav: NavController,
    private zone: NgZone,
    private auth: AuthService) {
  }
  async ngOnInit() {
    console.log('get query')
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
    await this.orderService.find(params).then(async (res) => {
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
  async removeOrder(someArray){
    return  _.reject(someArray, function(el) { return el.orderStatus !== "scanned"; });
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
    console.log('infiniteScroll')
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
    console.log('loading')
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

}
