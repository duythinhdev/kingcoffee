import {
  NavController,
  Platform,
  PopoverController,
  Searchbar,
} from 'ionic-angular';
import { NotificationsPage } from '../../../pages/notifications/notifications';
import { SettingsPage } from '../../../pages/settings/settings';
import { CheckoutComponent } from '../../../pages/cart/components';
import { LoginComponent } from '../../../pages/auth';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { CartService, AuthService, CategoryService } from '../../../services';
import { ProductListingComponent } from '../../../pages/products';
import { HomePage } from '../../../pages/home/home';
import { LocalStorgeService } from '../../../services/local-storge.service';
import { TabsService } from '../../../services/tabs.service';
import { Deeplinks } from '@ionic-native/deeplinks';
import { ResultOrderComponent } from '../../../pages/order/components/result_order/result_order.component';
import { ProductListService } from '../../../services/productList.service';
import { isNil } from 'lodash';
import { NotificationComponent } from '../../../pages/notification/notification.component';
import { NotificationService } from '../../../services/notification.service';
import { ScanQrcodePage } from '../../../pages/scan-qrcode/scan-qrcode';

@Component({
  selector: 'app-header',
  templateUrl: 'header.html',
})
export class AppHeader implements OnInit {
  @Input() isShowLogo = false;
  @Input() headerTransparent = false;
  @Input() title = 'Home';
  @Input() class = '';
  @Input() primary = false;
  @ViewChild('searchbar1111') searchbar1111: Searchbar;
  @ViewChild('navbar') navbar;
  @ViewChild('button') button;
  searchText = '';
  cart = [];
  quantityProduct = 0;
  numberNotifications = 0;
  show = false;
  isLoggedIn = false;
  count = 0;
  tree = [];
  searchFields = {
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

  constructor(
    public nav: NavController,
    private auth: AuthService,
    public localStore: LocalStorgeService,
    private tabsService: TabsService,
    protected platform: Platform,
    protected deeplinks: Deeplinks,
    public popoverCtrl: PopoverController,
    private cartService: CartService,
    private zone: NgZone,
    private categoryService: CategoryService,
    private productListService: ProductListService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit() {
    this.productListService.productListChanged.subscribe(
      (data: { q: string }) => {
        this.searchText = data.q;
      }
    );
    this.notificationService.numberNotifications$.subscribe(() => {
      this.notificationService.countUnReadNotification().then((res) => {
        this.numberNotifications = res.data.count;
      });
    });
    this.cartService.cartChanged$.subscribe(() => {
      this.quantityProduct = Number(localStorage.getItem('quantityProduct'));
    });

    const token = this.auth.getAccessToken();
    if (!isNil(token)) {
      this.isLoggedIn = true;
      this.notificationService.countUnReadNotification().then((res) => {
        this.numberNotifications = res.data.count;
      });
    }

    if (this.title !== 'Cart') {
      await this.cartService.get().then((result) => {
        this.cart = result;
        this.quantityProduct = Number(localStorage.getItem('quantityProduct'));
      });
    }

    this.searchText = this.localStore.get('searchText');
    this.tabsService.show();
    await this.load_categories();
    await this.platform.ready().then(() => {
      const deeplinks = this.deeplinks
        .route({
          '': ResultOrderComponent,
        })
        .subscribe(
          (match) => {
            const paymentMethod = localStorage.getItem("paymentMethod");
            if (paymentMethod === 'momo' || paymentMethod === 'zalopay') {
              const url = match.$link.url;
              const find = url.search('tniecommerce://');
              this.zone.run(() => {
                if (find !== -1) {
                  if (paymentMethod === 'momo') {
                    const isSuccess = url.search('errorCode=0');
                    if (isSuccess !== -1) {
                      localStorage.setItem('isCheck', JSON.stringify(true));
                      localStorage.removeItem('shipToThisAddressId');
                      this.nav.setRoot(ResultOrderComponent, true);
                    } else {
                      localStorage.setItem('isCheck', JSON.stringify(false));
                      this.nav.setRoot(CheckoutComponent);
                    }
                  }
                  if (paymentMethod === 'zalopay') {
                    const isSuccess = url.search('code=1');
                    if (isSuccess !== -1) {
                      localStorage.setItem('isCheck', JSON.stringify(true));
                      localStorage.removeItem('shipToThisAddressId');
                      this.nav.setRoot(ResultOrderComponent, true);
                    } else {
                      localStorage.setItem('isCheck', JSON.stringify(false));
                      this.nav.setRoot(CheckoutComponent);
                    }
                  }
                  else {
                    localStorage.setItem('isCheck', JSON.stringify(false));
                    this.nav.setRoot(CheckoutComponent);
                  }

                  deeplinks.unsubscribe();
                  return;
                }
              });
            }
          },
          (nomatch) => {
            const url = nomatch.$link ? nomatch.$link.url : '';
            const find = url.search('tniecommerce://');
            this.zone.run(() => {
              if (find !== -1) {
                localStorage.setItem('isCheck', JSON.stringify(false));
                this.nav.setRoot(CheckoutComponent);
                deeplinks.unsubscribe();
                return;
              }
            });
          }
        );
    })
  }

  // to go account page
  goTo(state) {
    if (state === 'cart') {
      return this.nav.push(CheckoutComponent);
    } 
    // else if (state === 'setting') {
    //   return this.nav.push(SettingsPage);
    // } 
    else if (state === 'login') {
      return this.nav.setRoot(LoginComponent);
    }
     else if (state === 'home') {
      return this.nav.setRoot(HomePage);
    } 
     else if (state === 'setting') {
      //  return this.nav.setRoot(LoginComponent);
      return this.nav.push(SettingsPage);
    } 
    else if (state === 'notification') {
      return this.nav.push(NotificationComponent);
    }
  }

  presentNotifications(myEvent) {
    const popover = this.popoverCtrl.create(NotificationsPage);
    return popover.present({
      ev: myEvent,
    });
  }

  search() {
    this.searchText = this.searchText.trim();
    // nativate to search page
    this.searchFields.q = this.searchText;
    this.localStore.set('searchText', this.searchText);
    console.log('search')
    return this.productListService.onProductListChanged(this.searchFields);
  }

  openSearch() {
    this.show = !this.show;
  }

  onClickBackHome() {
    return this.nav.setRoot(HomePage, { q: this.searchText });
  }

  async load_categories() {
    await this.categoryService.tree().then((resp) => (this.tree = resp));
  }

  updateFilter(id: string, type: string) {
    
    console.log('click '+id)
    type === 'category'
      ? (this.searchFields.categoryId = id)
      : (this.searchFields.shopId = id);
      console.log(this.searchFields)
    return this.nav.push(ProductListingComponent, this.searchFields);
  }
}
