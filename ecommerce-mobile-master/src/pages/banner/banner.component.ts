import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BannerService, ToastyService, ProductService } from '../../services';
import { NavController, AlertController, Platform, Content, App } from 'ionic-angular';
import { WebviewInappPage } from '../webview-inapp/webview-inapp';
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { ProductDetailComponent } from '../products';
import { PromotionPage } from '../promotion-tab/promotion-tab.component';
@Component({
  selector: 'app-banner',
  templateUrl: './banner.html',
})
export class BannerComponent implements OnInit {
  @Input() position = 'home';
  banners = [];

  constructor(
    private service: BannerService,
    private toasty: ToastyService,
    private translate: TranslateService,
    private nav: NavController,
    public platform: Platform,
    private inAppBrowser: InAppBrowser,
    private productService: ProductService,
  ) { }

  async ngOnInit() {
    this.service
      .random({
        take: 15,
        position: this.position,
        isActive: true
      })
      .then((resp) => {
        if (resp.data.length) {
          let a = resp.data[0];
          resp.data.push(a)
          this.banners = resp.data.map((item) => {
            return {
              content: item.content ? item.content : "",
              imageUrl: item.media
                ? item.media.fileUrl
                : '../../assets/img/banner.jpg',
              link: item.link ? item.link : '#',
            };
          });
        } else {
          this.banners = [
            {
              imageUrl: '../../assets/img/banner.jpg',
            },
          ];
        }
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }

  async changeLink(url) {
    if (isValidURL(url)) {
      if (url) {
        return this.platform.ready().then(() => {
          return this.inAppBrowser.create(
            url,
            '_blank'
          );
        });
      }
    }
    else {
      if(url == 'Promotion'){
        return this.nav.push(PromotionPage);
      }
      else{
        const productRes = await this.productService.search({ sap: url });
        let alias;
        if (productRes.code == 200) {
          if (productRes.data.count == 1) {
            alias = productRes.data.items[0].alias;
            return this.nav.push(ProductDetailComponent, { alias: alias });
          }
        }
        else {
        }
      }
   
    }
  }

  async validURL(string) {
    let res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
  }


}
function isValidURL(string) {
  let res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};
