import { Component, OnInit, ViewChild } from '@angular/core';
import { App, Content, Events, NavController, NavParams } from 'ionic-angular';
import {
  ProductService,
  CategoryService,
  ShopService,
  AuthService,
  CartService,
} from '../../../services';
import { TabsService } from '../../../services/tabs.service';
import { ProductListService } from '../../../services/productList.service';
import { StatusBar } from '@ionic-native/status-bar';
import { isNil } from 'lodash';

@Component({
  selector: 'search-products',
  templateUrl: './listing.html',
})
export class ProductListingComponent implements OnInit {
  @ViewChild('header') header;
  @ViewChild('top') top: Content;
  items = [];
  tree = [];
  shops = [];
  page = 1;
  itemsPerPage = 12;
  searchFields: {
    q: string;
    categoryId: string;
    shopId: string;
    featured: string;
    hot: string;
    bestSell: string;
    dailyDeal: string;
    soldOut: string;
    discounted: string;
    page?: number;
  };
  sort = 'createdAt';
  sortType = 'desc';
  sortPriceType = '';
  sortTimeType = 'desc';
  total = 0;
  totalShop = 0;
  isLoading = false;
  loadingShop = false;
  collapsed = false;
  filterShops;
  scrollHeight = 0;
  show = false;

  constructor(
    private productService: ProductService,
    public nav: NavController,
    private tabsService: TabsService,
    private categoryService: CategoryService,
    private shopService: ShopService,
    private productListService: ProductListService,
    private authService: AuthService,
    private cartService: CartService,
    private statusBar: StatusBar,
    private navParams: NavParams,
    public events: Events,
    private app: App
  ) {
    if(this.app.getActiveNav().parent.parent){
      this.app.getActiveNav().parent.select(3);
    }
    events.subscribe('product-list:scrollToTop', () => {
      if(this.top && this.top.scrollTop > 0){
        this.top.scrollTo(0, 0, 500);
      }
    });

    this.productListService.productListChanged.subscribe(
      async (data: {
        q: string;
        categoryId: string;
        shopId: string;
        featured: string;
        hot: string;
        bestSell: string;
        dailyDeal: string;
        soldOut: string;
        discounted: string;
      }) => {
        this.searchFields = { ...data };
        await this.query();
      }
    );
    if(!isNil(this.navParams.data)) {
      this.searchFields = this.navParams.data;
    }

    this.tabsService.show();
    this.statusBar.backgroundColorByHexString('f3f3f3');
  }

  async ngOnInit() {
    await this.categoryService.tree().then((resp) => (this.tree = resp));
    await this.queryFeaturedShop(10);
    await this.query();
    console.log('vao product list on init')
  }

  // async ionViewWillEnter() {
  //   if (!this.authService.isLoggedin()) {
  //     await this.cartService.clean();
  //   }
  //   console.log('vao product list will enter')
  //   this.statusBar.backgroundColorByHexString('f2f2f2');
  //   this.statusBar.styleDefault();
  // }

  changeShow() {
    this.show ? (this.show = false) : (this.show = true);
  }

  query(event?) {
    console.log('event--------- ',event)
    this.isLoading = true;
    if (event !== undefined) {
      this.page = 1;
      this.searchFields = {
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
      this.sort = 'createdAt';
      this.sortType = 'desc';
      this.sortTimeType = 'desc';
    }
    const params = {
      page: 1,
      take: this.itemsPerPage,
      sort: this.sort,
      sortType: this.sortType,
      ...this.searchFields,
    };
    console.log(params);
    return this.productService.search(params).then((res) => {
      this.isLoading = false;
      this.items = res.data.items;
      console.log(this.items)
      this.total = res.data.count;
      this.searchFields = this.searchFields;
      if (event !== undefined) {
        event.complete();
      }
    });
  }

  queryFeaturedShop(take: number) {
    take += 10;
    this.loadingShop = true;
    return this.shopService.search({ take, featured: 1 }).then((resp) => {
      this.shops = this.shops.concat(resp.data.items);
      this.totalShop = resp.data.count;
      this.loadingShop = false;
    });
  }

  collapseFeaturedShop() {
    this.collapsed = !this.collapsed;
  }

  doInfinite(infiniteScroll) {
    this.page += 1;
    const params = {
      page: this.page,
      take: this.itemsPerPage,
      sort: this.sort,
      sortType: this.sortType,
      ...this.searchFields,
    };
    return this.productService.search(params).then((res) => {
      this.isLoading = false;
      this.items = this.items.concat(res.data.items);
      this.total = res.data.count;
      infiniteScroll.complete();
    });
  }

  loading(infiniteScroll) {
    setTimeout(() => {
      infiniteScroll.complete();
    }, 1000);
  }

  async changeSort(sort: string) {
    this.sort = sort;
    this.sortType = this.sortTimeType;
    this.page = 1;
    await this.query();
  }

  async changePriceSort(sort: string, event) {
    this.sort = sort;
    this.sortType = event;
    this.page = 1;
    await this.query();
  }

  async updateFilter(id: string, type: string) {
    type === 'category'
      ? (this.searchFields.categoryId = id)
      : (this.searchFields.shopId = id);
    this.searchFields.page = 1;
    await this.query();
  }

  async updateFields(event) {
    for (const key of event) {
      event.hasOwnProperty(key) && event[key]
        ? (this.searchFields[key] = event[key])
        : (this.searchFields[key] = '');
    }
    this.page = 1;
    await this.query();
  }

  async scrollTop() {
    await this.top.scrollToTop();
  }

  onScroll(event) {
    if(event){
      const transparent = (event.scrollTop * 100) / 57 / 100;
      const color = `rgba(242, 242, 242, ${transparent})`;
      this.header.navbar._elementRef.nativeElement.getElementsByClassName(
        'toolbar-background'
      )[0].style.background = color;
  
      const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
      const hex = `#${(
        (1 << 24) +
        (parseInt(rgba[0], 10) << 16) +
        (parseInt(rgba[1], 10) << 8) +
        parseInt(rgba[2], 10)
      )
        .toString(16)
        .slice(1)}`;
  
      this.statusBar.backgroundColorByHexString(hex);
      this.statusBar.styleDefault();
    }
  }

  ngOnDestroy() {
    this.statusBar.styleDefault();
    //this.events.unsubscribe('product-list:scrollToTop');
  }
}
