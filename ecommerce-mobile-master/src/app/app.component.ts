import { Component, ViewChild, OnInit } from '@angular/core';
import { Platform, AlertController, Nav, ModalController, Keyboard } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import { TranslateService } from '@ngx-translate/core';
import { isNil, isNull, isEmpty } from 'lodash';

import {
  CategoryService,
  SystemService,
  WeErrorHandler,
  AuthService,
  BannerService,
} from "../services";
import { ProductListService } from "../services/productList.service";
import { PopupPromotionComponent } from "../pages/popup/popup-promotion";
import { FCM } from "@ionic-native/fcm";
import { LocalNotifications } from '@ionic-native/local-notifications';
declare var rootdetection:any;
export interface MenuItem {
  title: string;
  component;
  icon: string;
}

@Component({
  templateUrl: 'app.html',
})
export class MyApp implements OnInit {
  @ViewChild(Nav) nav: Nav;
  rootPage = TabsPage;
  items = [];
  
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
  page = 1;
  itemsPerPage = 12;
  isShowPopup = false;
  randomPromotion: any;

  constructor(
    private translateService: TranslateService,
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private systemService: SystemService,
    private categoryService: CategoryService,
    private alertCtrl: AlertController,
    private network: Network,
    private productListService: ProductListService,
    private errorHandler: WeErrorHandler,
    public modalCtrl: ModalController,
    private fcm: FCM,
    private localNotifications: LocalNotifications,
    private authService: AuthService,
    private keyboard: Keyboard,
    private bannerService: BannerService
  ) {
    // Set translation
    // https://github.com/ngx-translate/core
    const defaultLang = 'vi';
    this.translateService.setDefaultLang(defaultLang);
    this.systemService
      .configs()
      .then((resp) => {
        this.translateService.setDefaultLang(resp.i18n.defaultLanguage);
        this.translateService.use(resp.userLang);
      })
      .catch((err) => {
        return this.errorHandler.handleError(err);
      });
      platform.ready().then(() => {
        if (typeof(rootdetection) !== 'undefined' && rootdetection) {
                  rootdetection.isDeviceRooted((data) => {
                      if (data && data == 1) {
                          console.log("This is routed device");
  
                      } else {
                          console.log("This is not routed device");
                      }
                  }, (data) => {
                      console.log("routed device detection failed case", data);
                  });
              }
          });
  }

  ngOnInit() {
    this.initializeApp();
    this.network.onDisconnect().subscribe(() => {
      const alert = this.alertCtrl.create({
        title: "Lỗi kết nối mạng",
        subTitle:
          "Vui lòng kiểm tra kết nối mạng thiết bị của bạn.",
        buttons: ["Đã hiểu!"],
      });
      return alert.present();
    });
    this.load_categories().catch((err) => {
      return this.errorHandler.handleError(err);
    });
    if (localStorage.getItem('accessToken')) {
      this.authService.getCurrentUser().then(async (res) => {
        this.loadDataOfPopup();
      });
    }else {
      this.loadDataOfPopup();
    }
  }

  loadDataOfPopup(){
    this.bannerService.random({
      isActive: true,
      position: 'banner-popup-promotion'
    })
    .then(async res => {
      if(!isEmpty(res.data)) {
        this.isShowPopup = true;
        this.randomPromotion = res.data[Math.floor(Math.random() * res.data.length)];
        this.presentModal();
      }
    });
 }

  // create popup
  async presentModal() {
    const modal = this.modalCtrl.create(PopupPromotionComponent, {
      cssClass: 'select-modal',
      randomPromotion: this.randomPromotion,
      isShowPopup: this.isShowPopup
    });
    return modal.present();
  }
  async load_categories() {
    await this.categoryService.tree().then((resp) => (this.tree = resp));
  }
  updateFilter(id: string, type: string) {
    console.log('app ')
    type === 'category'
      ? (this.searchFields.categoryId = id)
      : (this.searchFields.shopId = id);
    this.productListService
      .onProductListChanged(this.searchFields)
      .catch((err) => {
        console.log(err)
        // return this.errorHandler.handleError(err);
      });
  }

  initializeApp() {
    this.platform
      .ready()
      .then(() => {
        // *** Control Splash Screen
        this.splashScreen.show();
        this.splashScreen.hide();

        // *** Control Status Bar
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString('f3f3f3');
        this.statusBar.styleDefault();
        this.onNotification();
        // *** Control Keyboard
        this.keyboard.didShow.subscribe(() =>{ document.activeElement.scrollIntoView(false) })
      })
      .catch((err) => {
        return this.errorHandler.handleError(err);
      });
  }

  onNotification() {
    this.fcm.onNotification().subscribe(data => {
      if (data.wasTapped) {
        // console.log(data);
        // alert(JSON.stringify(data));
      } else {
        this.notification(data.title, data.body);
        // alert(JSON.stringify(data));
      };
    });
  }

  notification(title, body) {
    // tslint:disable-next-line: no-floating-promises
    this.localNotifications.requestPermission().then((x) => {
      if (x) {
        this.localNotifications.schedule({
          title,
          text: body
        })
      }
    })
  }
}
