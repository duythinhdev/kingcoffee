import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HomePage } from '../home/home';
import { ProductListingComponent } from '../products';
import { TranslateService } from '@ngx-translate/core';
import { SettingsPage } from '../settings/settings';
import { Content, Events, NavController, Tabs,ModalController,Platform ,ViewController } from 'ionic-angular';
import { ProductListService } from '../../services/productList.service';
import { PromotionPage } from '../promotion-tab/promotion-tab.component';
import { SpinLuckyPage} from '../spin-lucky/spin-lucky';
import { ScanQrcodePage} from '../scan-qrcode/scan-qrcode';
import { App } from 'ionic-angular/components/app/app';
import { ScanQRCodeInfo } from '../scan-qrcode-info/scan-qrcode-info';


// import { Router } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: 'tabs.html',
})
export class TabsPage implements OnInit {
  @ViewChild('tabHome') tabRef: Tabs;
  @ViewChild('tabHome') tabHome;
  tab1Root = HomePage;
  tab2Root = SpinLuckyPage;
  tab3Root = ScanQrcodePage;
  // tab3Root = ScanQRCodeInfo;
  tab4Root = ProductListingComponent;
  // tab4Root = PromotionPage;
  tab5Root = PromotionPage;
  public currentTabIndex = 0;
  search;

  constructor(
    public translate: TranslateService,
    public nav: NavController,
    productListService: ProductListService,
    public events: Events,
    private modalCtrl: ModalController,
    private viewController : ViewController ,
    public platform: Platform,
    public app: App
  ) {
    productListService.productListChanged.subscribe(async () => {
      console.log('tabd product');
      // this.events.publish('product-list:scrollToTop');
      return this.tabRef.select(3);
      // return this.nav.setRoot(ProductListingComponent)
    });
  }

  ngOnInit() {
    try {
      this.platform.ready().then(() => {
        document.addEventListener("backbutton", async () => {
           this.events.publish('home:scrollToTop');
           this.tabRef.select(0);
        })
      })
    }
    catch (error) {
      console.log(error)
      // error.page = "tabspage";
      // error.func = "handleBackButton";
      // error.param = this.router.url;
      // C.writeErrorLog(error, null);
    }
  }
  dismiss() {
    let data = { 'foo': 'bar' };
    this.viewController.dismiss(data);
  }
  refreshTab(event){
    if(event.target.className.includes('tab-button-icon') || 
        event.target.className.includes('tab-button') ||
        event.target.className.includes('tab-button-text')
    ){
      if(this.currentTabIndex == 0){
        this.events.publish('home:scrollToTop');
      }
     
      if(this.currentTabIndex == 3){
        this.events.publish('product-list:scrollToTop');
      }
    }
  }

  openTab(event) {
    this.currentTabIndex = event.index;
    if(event.index == 0){
      this.events.publish('home:scrollToTop');
      this.tabRef.select(0);
    }
    if(event.index == 1){
      // this.events.publish('home:scrollToTop');
      this.tabRef.select(1);
    }
    if(event.index == 2){
      // this.events.publish('home:scrollToTop');
      this.tabRef.select(2);
    }
    if(event.index == 4){
    //   // this.events.publish('home:scrollToTop');
      this.tabRef.select(4);
    // this.nav.push(SettingsPage)
    }
    if(event.index == 5){
      // this.events.publish('home:scrollToTop');
      this.tabRef.select(5);
    }
   
    if(event.index == 3){
      this.events.publish('product-list:scrollToTop');
      this.tabRef.select(3);
    }
  }
}
