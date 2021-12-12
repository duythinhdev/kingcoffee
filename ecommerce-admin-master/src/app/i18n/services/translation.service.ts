import { Injectable } from "@angular/core";
import { Restangular } from "ngx-restangular";
import { ROUTES } from "../../shared/sidebar/menu-items";
import { Constant } from "../../infrastructure/constant";
import { StartTitle } from "../../model/start.title.model";
import { StatTitle } from "../../model/stat.title.model";
import { SendMailTitle } from "../../model/newletter.sendmail.title.model";
import { ContactTitle } from "../../model/newletter.contacts.title.model";
import { OrderListingTitle } from "../../model/orders.listing.title.model";
import { RefundTitle } from "../../model/refund.title.model";
import { UserCreateTitle } from "../../model/user.create.title.model";
import { UserListTitle } from "../../model/user.list.title.model";
import { UserProfileTitle } from "../../model/user.profile.title.model";
import { ShopCreateTitle } from "../../model/shop.create.title.model";
import { ShopListTitle } from "../../model/shop.list.title.model";
import { ProductListTitle } from "../../model/product.listing.title.model";
import { ProductCreateTitle } from "../../model/product.create.title.model";
import { ProductCategoryTitle } from "../../model/product.category.title.model";
import { ProductCreateCategoryTitle } from "../../model/product.create.category.title.model";
import { ProductOptionTitle } from "../../model/product.option.title.model";
import { ProductCreateOptionTitle } from "../../model/product.create.option.title.model";
import { BannerListTitle } from "../../model/banner.listing.title.model";
import { BannerCreateTitle } from "../../model/banner.create.title.model";
import { PostListTitle } from "../../model/post.listing.title.model";
import { ComplaintListTitle } from "../../model/complaint.listing.title.model";
import { ReportSaleTitle } from "../../model/report.sale.title.model";
import { ReportPayOutTitle } from "../../model/report.payout.title.model";
import { KpiListTitle } from "../../model/kpi.list.title.model";
import { ConfigListTitle } from "../../model/config.listing.title.model";
import { ConfigLanguageTitle } from "../../model/config.language.title.model";
import { ConfigTextTitle } from "../../model/config.text.title.model";
import { PackageListingTitle } from "../../model/package.listing.title.model";
import { PackageCreateTitle } from "../../model/package.create.title.model";
import { PackagePaymentHistoryTitle } from "../../model/package.paymenthistory.title.model";
import { ShopBasicInfoTitle } from "../../model/shop.basicinfo.title.model";
import { ShopBusinessInfoTitle } from "../../model/shop.businessinfo.title.model";
import { ShopSocialInfoTitle } from "../../model/shop.socialinfo.title.model";
import { PostCreateTitle } from "../../model/post.create.title.model";
import { ShopUpdateListTitle } from "../../model/shop.update.list.title.model";
import { UserProfileCardTitle } from "../../model/user.profilecard.title.model";
import { ShopShippingInfoTitle } from "../../model/shop.shippinginfo.title.model";
import { ProductVariantTitle } from "../../model/product.variant.title.model";
import { UpdateVariantTitle } from "../../model/update.variant.title.model";
import { OrderViewTitle } from "../../model/order.view.title.model";
import { TranslatetionTitle } from "../../model/translation.title.model";
import { ErrorTitle } from "../../model/error.title.model";
import { UserProfileHistoryTitle } from "../../model/user.profile.history.title.model";
import { UploadImageTitle } from "../../model/upload.image.title.model";
import {userIdCreateTitle} from '../../model/userId.create.title.model';
import "rxjs/add/operator/toPromise";

@Injectable()
export class TranslationService {
  public searchby: any = {
    text: "",
    translation: "",
  };

  public listlang = [];
  public lang = "vi";

  constructor(private restangular: Restangular) {}

  create(data: any): Promise<any> {
    return this.restangular.all("i18n/translations").post(data).toPromise();
  }

  update(id, data: any): Promise<any> {
    return this.restangular
      .one("i18n/translations", id)
      .customPUT(data)
      .toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one("i18n/translations").get(params).toPromise();
  }

  remove(id): Promise<any> {
    return this.restangular
      .one("i18n/translations", id)
      .customDELETE()
      .toPromise();
  }

  pull(lang: string): Promise<any> {
    return this.restangular
      .one("i18n/translations", lang)
      .one("pull")
      .post()
      .toPromise();
  }

  searchByKey(params: any): Promise<any> {
    return this.restangular
      .one("i18n/translations/searchByKey")
      .get(params)
      .toPromise();
  }

  setLanguage() {
    //set lang
    this.search(
      Object.assign(this.searchby, {
        lang: this.lang,
      })
    ).then((resp) => {
      this.listlang = resp.data.items;
      for (let i = 0; i < this.listlang.length; i++) {
        if (Constant.sidebarnav.dashboard.name == this.listlang[i]["text"]) {
          ROUTES[0]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.users.name == this.listlang[i]["text"]) {
          ROUTES[1]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.shops.name == this.listlang[i]["text"]) {
          ROUTES[2]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.products.name == this.listlang[i]["text"]) {
          ROUTES[3]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.events.name == this.listlang[i]["text"]) {
          ROUTES[4]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.name == this.listlang[i]["text"]) {
          ROUTES[5]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.banners.name == this.listlang[i]["text"]) {
          ROUTES[6]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.posts.name == this.listlang[i]["text"]) {
          ROUTES[7]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.newsletter.name == this.listlang[i]["text"]) {
          ROUTES[8]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.complaints.name == this.listlang[i]["text"]) {
          ROUTES[9]["title"] = this.listlang[i]["translation"];
        }
        // if(Constant.sidebarnav.requestspayout.name == this.listlang[i]['text']){
        //   ROUTES[9]['title'] = this.listlang[i]['translation'];
        // }
        if (Constant.sidebarnav.commission.name == this.listlang[i]["text"]) {
          ROUTES[10]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.report.name == this.listlang[i]["text"]) {
          ROUTES[11]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.name != "") {
          ROUTES[12]["title"] = "KPIs";
        }
        if (Constant.sidebarnav.config.name == this.listlang[i]["text"]) {
          ROUTES[13]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.promotions.name == this.listlang[i]["text"]) {
          ROUTES[14]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.packages.name == this.listlang[i]["text"]) {
          ROUTES[15]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.userids.name == this.listlang[i]["text"]) {
          ROUTES[16]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.name == this.listlang[i]["text"]) {
          ROUTES[17]["title"] = this.listlang[i]["translation"];
        }
        //Child in SlideBar
        //Users
        if (
          Constant.sidebarnav.users.listuser.name == this.listlang[i]["text"]
        ) {
          ROUTES[1].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.name == this.listlang[i]["text"]
        ) {
          ROUTES[1].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        //Shops
        if (Constant.sidebarnav.shops.name == this.listlang[i]["text"]) {
          ROUTES[2].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.name == this.listlang[i]["text"]
        ) {
          ROUTES[2].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        // Products
        if (Constant.sidebarnav.products.name == this.listlang[i]["text"]) {
          ROUTES[3].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[3].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcategories.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[3].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[3].submenu[3]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productoption.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[3].submenu[4]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewoption.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[3].submenu[5]["title"] = this.listlang[i]["translation"];
        }
        //Events
        if (
          Constant.sidebarnav.events.listing.name == this.listlang[i]["text"]
        ) {
          ROUTES[4].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.events.importlisting.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[4].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.events.slot.name == this.listlang[i]["text"]) {
          ROUTES[4].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.events.awardlisting.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[4].submenu[3]["title"] = this.listlang[i]["translation"];
        }
        //Orders
        if (Constant.sidebarnav.orders.name == this.listlang[i]["text"]) {
          ROUTES[5].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.refund.name == this.listlang[i]["text"]
        ) {
          ROUTES[5].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        //Banner
        if (Constant.sidebarnav.banners.name == this.listlang[i]["text"]) {
          ROUTES[6].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.name == this.listlang[i]["text"]
        ) {
          ROUTES[6].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        //Posts
        if (
          Constant.sidebarnav.posts.listing.pagename == this.listlang[i]["text"]
        ) {
          ROUTES[7].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.postname == this.listlang[i]["text"]
        ) {
          ROUTES[7].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.name == this.listlang[i]["text"]
        ) {
          ROUTES[7].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        //NewLetter
        if (
          Constant.sidebarnav.newsletter.contacts.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[8].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[8].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        //Complaints
        if (
          Constant.sidebarnav.complaints.listing.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[9].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        //Request Payout
        if (
          Constant.sidebarnav.requestspayout.listing.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[10].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        //Report
        if (Constant.sidebarnav.report.sales.name == this.listlang[i]["text"]) {
          ROUTES[11].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        // if(Constant.sidebarnav.report.payout.name == this.listlang[i]['text']){
        //   ROUTES[11].submenu[1]['title'] = this.listlang[i]['translation'];
        // }
        if (Constant.sidebarnav.kpi.list.name == this.listlang[i]["text"]) {
          ROUTES[12].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.config.name == this.listlang[i]["text"]) {
          ROUTES[12].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        //Config
        if (Constant.sidebarnav.config.name == this.listlang[i]["text"]) {
          ROUTES[13].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.name == this.listlang[i]["text"]
        ) {
          ROUTES[13].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.text.name == this.listlang[i]["text"]) {
          ROUTES[13].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        //Promotion
        if (
          Constant.sidebarnav.promotions.programList.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[14].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.promotions.programDetail.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[14].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.promotions.listing.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[14].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.promotions.create.name == this.listlang[i]["text"]
        ) {
          ROUTES[14].submenu[3]["title"] = this.listlang[i]["translation"];
        }
        //Packages
        if (Constant.sidebarnav.packages.name == this.listlang[i]["text"]) {
          ROUTES[15].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[15].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.name ==
          this.listlang[i]["text"]
        ) {
          ROUTES[15].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        // My profile
        if (Constant.sidebarnav.myprofile.name == this.listlang[i]["text"]) {
          ROUTES[17].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.ActionHistory ==
          this.listlang[i]["text"]
        ) {
          ROUTES[17].submenu[1]["title"] = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.logout.name == this.listlang[i]["text"]
        ) {
          ROUTES[17].submenu[2]["title"] = this.listlang[i]["translation"];
        }
        //
        if (Constant.sidebarnav.userids.newuser.name == this.listlang[i]["text"]) {
          ROUTES[16].submenu[0]["title"] = this.listlang[i]["translation"];
        }
        // Dashboard
        if (Constant.sidebarnav.dashboard.shop == this.listlang[i]["text"]) {
          StartTitle[0].shop = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.total == this.listlang[i]["text"]) {
          StartTitle[0].total = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.commission == this.listlang[i]["text"]
        ) {
          StartTitle[0].commission = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.shopbalance == this.listlang[i]["text"]
        ) {
          StartTitle[0].shopBalance = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.sitebalance == this.listlang[i]["text"]
        ) {
          StartTitle[0].siteBalance = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.paid == this.listlang[i]["text"]) {
          StartTitle[0].paid = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.latestRequestPayoutofSeller ==
          this.listlang[i]["text"]
        ) {
          StartTitle[0].cardtitle = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.orders == this.listlang[i]["text"]) {
          StartTitle[0].orders = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.products == this.listlang[i]["text"]
        ) {
          StartTitle[0].products = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.users == this.listlang[i]["text"]) {
          StartTitle[0].users = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.createdAt == this.listlang[i]["text"]
        ) {
          StartTitle[0].createdAt = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.approved == this.listlang[i]["text"]
        ) {
          StartTitle[0].approved = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.rejected == this.listlang[i]["text"]
        ) {
          StartTitle[0].rejected = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.pending == this.listlang[i]["text"]) {
          StartTitle[0].pending = this.listlang[i]["translation"];
        }
        //Stat
        if (Constant.sidebarnav.dashboard.orders == this.listlang[i]["text"]) {
          StatTitle[0].orders = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.products == this.listlang[i]["text"]
        ) {
          StatTitle[0].products = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.users == this.listlang[i]["text"]) {
          StatTitle[0].users = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.shop == this.listlang[i]["text"]) {
          StatTitle[0].shop = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.statistic == this.listlang[i]["text"]
        ) {
          StatTitle[0].statistic = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.total == this.listlang[i]["text"]) {
          StatTitle[0].total = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.featured == this.listlang[i]["text"]
        ) {
          StatTitle[0].featured = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.actived == this.listlang[i]["text"]) {
          StatTitle[0].actived = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.inActived == this.listlang[i]["text"]
        ) {
          StatTitle[0].inActived = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.verified == this.listlang[i]["text"]
        ) {
          StatTitle[0].verified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.unverified == this.listlang[i]["text"]
        ) {
          StatTitle[0].unverified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.totalSub == this.listlang[i]["text"]
        ) {
          StatTitle[0].totalSub = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.completed == this.listlang[i]["text"]
        ) {
          StatTitle[0].completed = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.shipping == this.listlang[i]["text"]
        ) {
          StatTitle[0].shipping = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.progressing == this.listlang[i]["text"]
        ) {
          StatTitle[0].progressing = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.dashboard.pending == this.listlang[i]["text"]) {
          StatTitle[0].pending = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.refunded == this.listlang[i]["text"]
        ) {
          StatTitle[0].refunded = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.dashboard.cancelled == this.listlang[i]["text"]
        ) {
          StatTitle[0].cancelled = this.listlang[i]["translation"];
        }
        // New Letter
        // 1.Send mail
        if (
          Constant.sidebarnav.newsletter.sendmail.Subject ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].subject = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Subjectisrequired ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].subjectisrequired = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Usertype ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].usertype = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Allusers ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].allusers = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Seller ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].seller = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Registereduser ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].registereduser = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Newslettercontacts ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].newslettercontacts = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Content ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Contentisrequired ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].contentisrequired = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Send ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].send = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.sendmail.Cancel ==
          this.listlang[i]["text"]
        ) {
          SendMailTitle[0].cancel = this.listlang[i]["translation"];
        }
        //2. contact
        if (
          Constant.sidebarnav.newsletter.contacts.Email ==
          this.listlang[i]["text"]
        ) {
          ContactTitle[0].Email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.contacts.Name ==
          this.listlang[i]["text"]
        ) {
          ContactTitle[0].Name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.contacts.Createdat ==
          this.listlang[i]["text"]
        ) {
          ContactTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.newsletter.contacts.Search ==
          this.listlang[i]["text"]
        ) {
          ContactTitle[0].Search = this.listlang[i]["translation"];
        }
        // Orders
        //1. Listing
        if (
          Constant.sidebarnav.orders.listing.Order == this.listlang[i]["text"]
        ) {
          OrderListingTitle[0].Order = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.listing.TotalProducts ==
          this.listlang[i]["text"]
        ) {
          OrderListingTitle[0].TotalProducts = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.listing.Totalprice ==
          this.listlang[i]["text"]
        ) {
          OrderListingTitle[0].Totalprice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.listing.Paymentmethod ==
          this.listlang[i]["text"]
        ) {
          OrderListingTitle[0].Paymentmethod = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.listing.UserIP == this.listlang[i]["text"]
        ) {
          OrderListingTitle[0].UserIP = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.listing.CreatedAt ==
          this.listlang[i]["text"]
        ) {
          OrderListingTitle[0].CreatedAt = this.listlang[i]["translation"];
        }
        // OrderView
        if (
          Constant.sidebarnav.orders.view.Balance == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Balance = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Cancel == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Cancelled == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Cancelled = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.City == this.listlang[i]["text"]) {
          OrderViewTitle[0].City = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Commission == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Commission = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.CommissionPrice ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].CommissionPrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Completed == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Completed = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Country == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Country = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Createdat == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.Email == this.listlang[i]["text"]) {
          OrderViewTitle[0].Email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Generalinformation ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Generalinformation = this.listlang[i][
            "translation"
            ];
        }
        if (Constant.sidebarnav.orders.view.IP == this.listlang[i]["text"]) {
          OrderViewTitle[0].IP = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.Name == this.listlang[i]["text"]) {
          OrderViewTitle[0].Name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Number == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Number = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Paymentmethod ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Paymentmethod = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Paymentstatus ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Paymentstatus = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Pending == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Pending = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Phonenumber ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Phonenumber = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.Price == this.listlang[i]["text"]) {
          OrderViewTitle[0].Price = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.Price == this.listlang[i]["text"]) {
          OrderViewTitle[0].Price = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Product == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Product = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Products == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Products = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Progressing ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Progressing = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Quantity == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Quantity = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Refunded == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Refunded = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Shipping == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Shipping = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Shippingaddress ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Shippingaddress = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Shippingdetails ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Shippingdetails = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Shippingprice ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Shippingprice = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.State == this.listlang[i]["text"]) {
          OrderViewTitle[0].State = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Status == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Status = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Streetaddress ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Streetaddress = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.Tax == this.listlang[i]["text"]) {
          OrderViewTitle[0].Tax = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.Totalprice == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].Totalprice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.UpdateStatus ==
          this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].UpdateStatus = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.District == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].District = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.orders.view.Ward == this.listlang[i]["text"]) {
          OrderViewTitle[0].Ward = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.view.FeeShip == this.listlang[i]["text"]
        ) {
          OrderViewTitle[0].FeeShip = this.listlang[i]["translation"];
        }
        //2. Refund
        if (
          Constant.sidebarnav.orders.refund.Actions == this.listlang[i]["text"]
        ) {
          RefundTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.refund.Createdat ==
          this.listlang[i]["text"]
        ) {
          RefundTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.refund.Product == this.listlang[i]["text"]
        ) {
          RefundTitle[0].Product = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.orders.refund.Reason == this.listlang[i]["text"]
        ) {
          RefundTitle[0].Reason = this.listlang[i]["translation"];
        }
        //3.User
        // create User
        if (
          Constant.sidebarnav.users.createname.firstandlastname ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].firstandlastname = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname
            .pleaseenteruserfirstnameandlastname == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].pleaseenteruserfirstnameandlastname = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.email == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.emailisrequired ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].emailisrequired = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.pleaseenteravalidemailaddress ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].pleaseenteravalidemailaddress = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.users.createname.active ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.emailverified ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].emailverified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.role == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].role = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.user == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].user = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.admin == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].admin = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.phonenumber ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].phonenumber = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.address ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.avatar ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].avatar = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.createuserbeforeupdateavatar ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].createuserbeforeupdateavatar = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.users.createname.password ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].password = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.pleaseenterpassword ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].pleaseenterpassword = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.users.createname
            .passwordmustbeatleast6characters == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].passwordmustbeatleast6characters = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.save == this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].save = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.createname.cancel ==
          this.listlang[i]["text"]
        ) {
          UserCreateTitle[0].cancel = this.listlang[i]["translation"];
        }
        //list user
        if (
          Constant.sidebarnav.users.listuser.namecol == this.listlang[i]["text"]
        ) {
          UserListTitle[0].namecol = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.email == this.listlang[i]["text"]
        ) {
          UserListTitle[0].email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.role == this.listlang[i]["text"]
        ) {
          UserListTitle[0].role = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.active == this.listlang[i]["text"]
        ) {
          UserListTitle[0].active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.emailVerified ==
          this.listlang[i]["text"]
        ) {
          UserListTitle[0].emailVerified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.createdAt ==
          this.listlang[i]["text"]
        ) {
          UserListTitle[0].createdAt = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.actions == this.listlang[i]["text"]
        ) {
          UserListTitle[0].actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.filter == this.listlang[i]["text"]
        ) {
          UserListTitle[0].filter = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.listuser.username ==
          this.listlang[i]["text"]
        ) {
          UserListTitle[0].username = this.listlang[i]["translation"];
        }
        // user profile card
        if (
          Constant.sidebarnav.users.profilecard.Address ==
          this.listlang[i]["text"]
        ) {
          UserProfileCardTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.profilecard.Created ==
          this.listlang[i]["text"]
        ) {
          UserProfileCardTitle[0].Created = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.profilecard.Emailaddress ==
          this.listlang[i]["text"]
        ) {
          UserProfileCardTitle[0].Emailaddress = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.users.profilecard.Phone ==
          this.listlang[i]["text"]
        ) {
          UserProfileCardTitle[0].Phone = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.users.profilecard.SocialProfile ==
          this.listlang[i]["text"]
        ) {
          UserProfileCardTitle[0].SocialProfile = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.users.profilecard.joinedat ==
          this.listlang[i]["text"]
        ) {
          UserProfileCardTitle[0].joinedat = this.listlang[i]["translation"];
        }
        // my profile
        if (
          Constant.sidebarnav.myprofile.Firstandlastname ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Firstandlastname = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.myprofile.Pleaseenteruserfirstnameandlastname ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Pleaseenteruserfirstnameandlastname = this.listlang[
            i
            ]["translation"];
        }
        if (Constant.sidebarnav.myprofile.Email == this.listlang[i]["text"]) {
          UserProfileTitle[0].Email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Emailisrequired ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Emailisrequired = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Pleaseenteravalidemailaddress ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Pleaseenteravalidemailaddress = this.listlang[i][
            "translation"
            ];
        }
        if (Constant.sidebarnav.myprofile.Active == this.listlang[i]["text"]) {
          UserProfileTitle[0].Active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Emailverified ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Emailverified = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.Role == this.listlang[i]["text"]) {
          UserProfileTitle[0].Role = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.User == this.listlang[i]["text"]) {
          UserProfileTitle[0].User = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.Admin == this.listlang[i]["text"]) {
          UserProfileTitle[0].Admin = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Phonenumber == this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Phonenumber = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.Address == this.listlang[i]["text"]) {
          UserProfileTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Password == this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Password = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Passwordmustbeatleast6characters ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Passwordmustbeatleast6characters = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.Blanktokeepcurrentpassword ==
          this.listlang[i]["text"]
        ) {
          UserProfileTitle[0].Blanktokeepcurrentpassword = this.listlang[i][
            "translation"
            ];
        }
        if (Constant.sidebarnav.myprofile.Avatar == this.listlang[i]["text"]) {
          UserProfileTitle[0].Avatar = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.Save == this.listlang[i]["text"]) {
          UserProfileTitle[0].Save = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.myprofile.Cancel == this.listlang[i]["text"]) {
          UserProfileTitle[0].Cancel = this.listlang[i]["translation"];
        }
        // my profile--> user history
        if (
          Constant.sidebarnav.myprofile.history.Action ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Action = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.CreatedAt ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].CreatedAt = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.myprofile.history.Description ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Description = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.myprofile.history.Filter ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Filter = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.Username ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Username = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.Time == this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Time = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.Create ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Create = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.Edit == this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Edit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.myprofile.history.Delete ==
          this.listlang[i]["text"]
        ) {
          UserProfileHistoryTitle[0].Delete = this.listlang[i]["translation"];
        }
        //4.shop
        //shop update list
        if (
          Constant.sidebarnav.shops.shopUpdate.list.BasicInfo ==
          this.listlang[i]["text"]
        ) {
          ShopUpdateListTitle[0].BasicInfo = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.list.BusinessInfo ==
          this.listlang[i]["text"]
        ) {
          ShopUpdateListTitle[0].BusinessInfo = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.list.SocialInfo ==
          this.listlang[i]["text"]
        ) {
          ShopUpdateListTitle[0].SocialInfo = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.list.ShippingInfo ==
          this.listlang[i]["text"]
        ) {
          ShopUpdateListTitle[0].ShippingInfo = this.listlang[i]["translation"];
        }
        //shop create
        if (
          Constant.sidebarnav.shops.shopcreate.ShopName ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].ShopName = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseentershop ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseentershop = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Owner == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Owner = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.searching ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].searching = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate
            .Sorrysuggestionscouldnotbeloaded == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Sorrysuggestionscouldnotbeloaded = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Address ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseenteraddress ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseenteraddress = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.City == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].City = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseentercity ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseentercity = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.State == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].State = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Country ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Country = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseentercountry ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseentercountry = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Zipcode ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Zipcode = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseenterzipcode ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseenterzipcode = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Email == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseenteremail ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseenteremail = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Phonenumber ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Phonenumber = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseenterphonenumber ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseenterphonenumber = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.VerificationIssue ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].VerificationIssue = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Save == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Save = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Ward == this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Ward = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.District ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].District = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Pleaseenterstate ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Pleaseenterstate = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopcreate.Cancel ==
          this.listlang[i]["text"]
        ) {
          ShopCreateTitle[0].Cancel = this.listlang[i]["translation"];
        }
        // shop listing
        if (
          Constant.sidebarnav.shops.listing.nameCol == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].nameCol = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Owner == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Owner = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Email == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Address == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Documentissue ==
          this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Documentissue = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Featured == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Featured = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Verified == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Verified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Active == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Featuredto ==
          this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Featuredto = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Createdat ==
          this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Actions == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.searching ==
          this.listlang[i]["text"]
        ) {
          ShopListTitle[0].searching = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Sorrysuggestionscouldnotbeloaded ==
          this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Sorrysuggestionscouldnotbeloaded = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.listing.Filter == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Filter = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Actions == this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.listing.Thereisnoitemsyet ==
          this.listlang[i]["text"]
        ) {
          ShopListTitle[0].Thereisnoitemsyet = this.listlang[i]["translation"];
        }
        // Shop Basic Info
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Activated ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Activated = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Address ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Announcement ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Announcement = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Banner ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Banner = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Cancel ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.City ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].City = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Country ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Country = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Email ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Email = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Featured ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Featured = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Googleanyalyticscode ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Googleanyalyticscode = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.HeaderText ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].HeaderText = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Logo ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Logo = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Owner ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Owner = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Phonenumber ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Phonenumber = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Pleaseentershopname ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Pleaseentershopname = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.ReturnAddress ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].ReturnAddress = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Save ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Save = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.ShopAlias ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].ShopAlias = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.ShopName ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].ShopName = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.State ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].State = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.District ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].District = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Ward ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Ward = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.VerificationIssue ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].VerificationIssue = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Verified ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Verified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.basicInfo.Zipcode ==
          this.listlang[i]["text"]
        ) {
          ShopBasicInfoTitle[0].Zipcode = this.listlang[i]["translation"];
        }
        // shop business Info
        if (
          Constant.sidebarnav.shops.shopUpdate.businessInfo.Address ==
          this.listlang[i]["text"]
        ) {
          ShopBusinessInfoTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.businessInfo.BusinessName ==
          this.listlang[i]["text"]
        ) {
          ShopBusinessInfoTitle[0].BusinessName = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.businessInfo.Cancel ==
          this.listlang[i]["text"]
        ) {
          ShopBusinessInfoTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.businessInfo.Identifier ==
          this.listlang[i]["text"]
        ) {
          ShopBusinessInfoTitle[0].Identifier = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.businessInfo.Save ==
          this.listlang[i]["text"]
        ) {
          ShopBusinessInfoTitle[0].Save = this.listlang[i]["translation"];
        }
        // shop Social info
        if (
          Constant.sidebarnav.shops.shopUpdate.socialInfo.Cancel ==
          this.listlang[i]["text"]
        ) {
          ShopSocialInfoTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.socialInfo.Pleaseentervalidurl ==
          this.listlang[i]["text"]
        ) {
          ShopSocialInfoTitle[0].Pleaseentervalidurl = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.socialInfo.Save ==
          this.listlang[i]["text"]
        ) {
          ShopSocialInfoTitle[0].Save = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.socialInfo.Verified ==
          this.listlang[i]["text"]
        ) {
          ShopSocialInfoTitle[0].Verified = this.listlang[i]["translation"];
        }
        // shop shipping info
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.Address ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].Address = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.Cancel ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.City ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].City = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.District ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].District = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.District ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].Save = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.Save ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].Save = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.Ward ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].Ward = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.shops.shopUpdate.shippingInfo.ZipCode ==
          this.listlang[i]["text"]
        ) {
          ShopShippingInfoTitle[0].ZipCode = this.listlang[i]["translation"];
        }
        //5.Product
        //Listing
        if (
          Constant.sidebarnav.products.listing.Image == this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Image = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Name == this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Category ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Category = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Shop == this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Shop = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Feature ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Feature = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Hot == this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Hot = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.BestSell ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].BestSell = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Type == this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Type = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.DailyDeal ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].DailyDeal = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Active ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.ShopVerified ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].ShopVerified = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Createdat ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Actions ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Search ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Search = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Status ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Status = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Physical ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Physical = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Digital ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Digital = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.SAP == this.listlang[i]["text"]
        ) {
          ProductListTitle[0].SAP = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.listing.Producer ==
          this.listlang[i]["text"]
        ) {
          ProductListTitle[0].Producer = this.listlang[i]["translation"];
        }
        //create
        if (
          Constant.sidebarnav.products.productcreate.Active ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Add ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Add = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Alias ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Alias = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.BestSelling ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].BestSelling = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.BuyerDiscount ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].BuyerDiscount = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Category ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Category = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Cause ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Cause = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Clicktosetmainimage ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Clicktosetmainimage = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.Dailydeal ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Dailydeal = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.DealTo ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].DealTo = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Deny ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Deny = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Description ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Description = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Digital ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Digital = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.DigitalFilePath ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].DigitalFilePath = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.Enterzipcode ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Enterzipcode = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Featured ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Featured = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.FreeShip ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].FreeShip = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.FreeShipCity ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].FreeShipCity = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.FreeShipCountry ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].FreeShipCountry = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.FreeShipState ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].FreeShipState = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.GoldTimeDiscount ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].GoldTimeDiscount = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.HotProduct ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].HotProduct = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Ifthealiasisexist ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Ifthealiasisexist = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.Images ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Images = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Information ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Information = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.MarketingDiscount ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].MarketingDiscount = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.Metadescription ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Metadescription = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.Metakeywords ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Metakeywords = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Name ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Physical ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Physical = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Pleasecreateproduct ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Pleasecreateproduct = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate
            .Pleasecreateproductthenaddvariants == this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Pleasecreateproductthenaddvariants = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Price ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Price = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.RestrictCODareas ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].RestrictCODareas = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.Reviews ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Reviews = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.SalePrice ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].SalePrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Seller ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Seller = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Shortdescription ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Shortdescription = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate
            .Sorrysuggestionscouldnotbeloaded == this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Sorrysuggestionscouldnotbeloaded = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Specifications ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Specifications = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.productcreate.StockQuantity ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].StockQuantity = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Submit ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Submit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Cancel ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.TaxName ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].TaxName = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.TaxValue ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].TaxValue = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.TaxValue ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].TaxValue = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Type ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Type = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Variants ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Variants = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.ZipCode ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].ZipCode = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.isPromotion ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].isPromotion = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.name ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.searching ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].searching = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Weight ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Weight = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.TradeDiscount ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].TradeDiscount = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.WeightCondition ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].WeightCondition = this.listlang[i][
            "translation"
            ];
        }

        if (
          Constant.sidebarnav.products.productcreate.SAP ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].SAP = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.NTDPrice ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].NTDPrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.NTDUnit ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].NTDUnit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.WEPrice ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].WEPrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.WEUnit ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].WEUnit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Lang ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Lang = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.SKU ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].SKU = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.PackageMethod ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].PackageMethod = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Producer ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Producer = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Expiry ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Expiry = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Country ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Country = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcreate.Ingredient ==
          this.listlang[i]["text"]
        ) {
          ProductCreateTitle[0].Ingredient = this.listlang[i]["translation"];
        }

        // category
        if (
          Constant.sidebarnav.products.productcategories.Actions ==
          this.listlang[i]["text"]
        ) {
          ProductCategoryTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcategories.Children ==
          this.listlang[i]["text"]
        ) {
          ProductCategoryTitle[0].Children = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcategories.CreatedAt ==
          this.listlang[i]["text"]
        ) {
          ProductCategoryTitle[0].CreatedAt = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productcategories.namCol ==
          this.listlang[i]["text"]
        ) {
          ProductCategoryTitle[0].namCol = this.listlang[i]["translation"];
        }
        // create category
        if (
          Constant.sidebarnav.products.createnewcategory.Alias ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Alias = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Description ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Description = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Image ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Image = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Metadescription ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Metadescription = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Metakeywords ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Metakeywords = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Noparen ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Noparen = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Parent ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Parent = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Submit ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Submit = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.nameCol ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].nameCol = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewcategory.Cancel ==
          this.listlang[i]["text"]
        ) {
          ProductCreateCategoryTitle[0].Cancel = this.listlang[i][
            "translation"
            ];
        }
        // option
        if (
          Constant.sidebarnav.products.productoption.Actions ==
          this.listlang[i]["text"]
        ) {
          ProductOptionTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productoption.Createdat ==
          this.listlang[i]["text"]
        ) {
          ProductOptionTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productoption.Description ==
          this.listlang[i]["text"]
        ) {
          ProductOptionTitle[0].Description = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.productoption.namCol ==
          this.listlang[i]["text"]
        ) {
          ProductOptionTitle[0].namCol = this.listlang[i]["translation"];
        }
        //create option
        if (
          Constant.sidebarnav.products.createnewoption.Create ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].Create = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewoption.Description ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].Description = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewoption.Displaytext ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].Displaytext = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.createnewoption.Key ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].Key = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewoption.Options ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].Options = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewoption.Submit ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].Submit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.createnewoption.nameCol ==
          this.listlang[i]["text"]
        ) {
          ProductCreateOptionTitle[0].nameCol = this.listlang[i]["translation"];
        }
        //Product Variant
        // variant
        if (
          Constant.sidebarnav.products.variants.Actions ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Add == this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Add = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Addnew ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Addnew = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.DisplayText ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].DisplayText = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Key == this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Key = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Nameofvariant ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Nameofvariant = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.variants.Option ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Option = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Price ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Price = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.SalePrice ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].SalePrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.StockQuantity ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].StockQuantity = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.variants.Thereisnovariant ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Thereisnovariant = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.products.variants
            .Usethesesystemoptionsorcustomitbyyourself ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Usethesesystemoptionsorcustomitbyyourself = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Value ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Value = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.variants.Valueofvariant ==
          this.listlang[i]["text"]
        ) {
          ProductVariantTitle[0].Valueofvariant = this.listlang[i][
            "translation"
            ];
        }
        // update variant
        if (
          Constant.sidebarnav.products.updatevariants.DigitalFile ==
          this.listlang[i]["text"]
        ) {
          UpdateVariantTitle[0].DigitalFile = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.updatevariants.Price ==
          this.listlang[i]["text"]
        ) {
          UpdateVariantTitle[0].Price = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.updatevariants.SalePrice ==
          this.listlang[i]["text"]
        ) {
          UpdateVariantTitle[0].SalePrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.updatevariants.Stockquantity ==
          this.listlang[i]["text"]
        ) {
          UpdateVariantTitle[0].Stockquantity = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.updatevariants.Update ==
          this.listlang[i]["text"]
        ) {
          UpdateVariantTitle[0].Update = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.products.updatevariants.Updatevariant ==
          this.listlang[i]["text"]
        ) {
          UpdateVariantTitle[0].Updatevariant = this.listlang[i]["translation"];
        }

        //5. banner
        if (
          Constant.sidebarnav.banners.listing.Actions ==
          this.listlang[i]["text"]
        ) {
          BannerListTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.listing.Content ==
          this.listlang[i]["text"]
        ) {
          BannerListTitle[0].Content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.listing.Createdat ==
          this.listlang[i]["text"]
        ) {
          BannerListTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.listing.Link == this.listlang[i]["text"]
        ) {
          BannerListTitle[0].Link = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.listing.Position ==
          this.listlang[i]["text"]
        ) {
          BannerListTitle[0].Position = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.listing.Title == this.listlang[i]["text"]
        ) {
          BannerListTitle[0].Title = this.listlang[i]["translation"];
        }
        // Create Banner
        if (
          Constant.sidebarnav.banners.newbanner.Content ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Default ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Default = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Image ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Image = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Link == this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Link = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Position ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Position = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Submit ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Submit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Title ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Title = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.name == this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.Cancel ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.banners.newbanner.isActive ==
          this.listlang[i]["text"]
        ) {
          BannerCreateTitle[0].isActive = this.listlang[i]["translation"];
        }
        // 6. Posts
        if (
          Constant.sidebarnav.posts.listing.Actions == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Alias == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Alias = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Clickedittoviewcontent ==
          this.listlang[i]["text"]
        ) {
          PostListTitle[0].Clickedittoviewcontent = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.posts.listing.Content == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Createdat ==
          this.listlang[i]["text"]
        ) {
          PostListTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Title == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Title = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Category == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Category = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Filter == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Filter = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.listing.Active == this.listlang[i]["text"]
        ) {
          PostListTitle[0].Active = this.listlang[i]["translation"];
        }
        // create Posts
        if (
          Constant.sidebarnav.posts.createPosts.name == this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Alias ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Alias = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Cancel ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Cancel = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Content ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Submit ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Submit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Title ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Title = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Description ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Description = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Active ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.MainSet ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].MainSet = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.posts.createPosts.Category ==
          this.listlang[i]["text"]
        ) {
          PostCreateTitle[0].Category = this.listlang[i]["translation"];
        }
        // if (
        //   Constant.sidebarnav.posts.createPosts.All == this.listlang[i]["text"]
        // ) {
        //   PostCreateTitle[0].All = this.listlang[i]["translation"];
        // }
        // if (
        //   Constant.sidebarnav.posts.createPosts.Notification == this.listlang[i]["text"]
        // ) {
        //   PostCreateTitle[0].Notification = this.listlang[i]["translation"];
        // }
        // 7. Complaint
        if (
          Constant.sidebarnav.complaints.listing.Actions ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Actions = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Clickedittoviewcontent ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Clickedittoviewcontent = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.complaints.listing.Content ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Createdat ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Pending ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Pending = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Rejected ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Rejected = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Resolved ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Resolved = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Seller ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Seller = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.Status ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].Status = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.User ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].User = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.UserType ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].UserType = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.complaints.listing.name ==
          this.listlang[i]["text"]
        ) {
          ComplaintListTitle[0].name = this.listlang[i]["translation"];
        }
        // 8. Report
        //sale
        if (
          Constant.sidebarnav.report.sales.Commission ==
          this.listlang[i]["text"]
        ) {
          ReportSaleTitle[0].Commission = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.sales.Earning == this.listlang[i]["text"]
        ) {
          ReportSaleTitle[0].Earning = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.report.sales.Shop == this.listlang[i]["text"]) {
          ReportSaleTitle[0].Shop = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.report.sales.Tax == this.listlang[i]["text"]) {
          ReportSaleTitle[0].Tax = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.sales.TotalPrice ==
          this.listlang[i]["text"]
        ) {
          ReportSaleTitle[0].TotalPrice = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.sales.TotalProduct ==
          this.listlang[i]["text"]
        ) {
          ReportSaleTitle[0].TotalProduct = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.sales.Totalorder ==
          this.listlang[i]["text"]
        ) {
          ReportSaleTitle[0].Totalorder = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.report.sales.name == this.listlang[i]["text"]) {
          ReportSaleTitle[0].name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.sales.RecieverCommission ==
          this.listlang[i]["text"]
        ) {
          ReportSaleTitle[0].RecieverCommission = this.listlang[i][
            "translation"
            ];
        }
        //Payout
        if (
          Constant.sidebarnav.report.payout.Approved == this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Approved = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Commission ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Commission = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.CurrentCODbalance ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].CurrentCODbalance = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.report.payout.CurrentNonCODbalance ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].CurrentNonCODbalance = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.report.payout.Currentbalancesummary ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Currentbalancesummary = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.report.payout.Paid == this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Paid = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Pendingrequest ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Pendingrequest = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Shop == this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Shop = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Shopearning ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Shopearning = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Shopmustpay ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Shopmustpay = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Siteearning ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Siteearning = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Sitemustpay ==
          this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Sitemustpay = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.Total == this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].Total = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.report.payout.name == this.listlang[i]["text"]
        ) {
          ReportPayOutTitle[0].name = this.listlang[i]["translation"];
        }
        // userId list
        // if (
        //   Constant.sidebarnav.userids.listing.Actions ==
        //   this.listlang[i]["text"]
        // ) {
        //   BannerListTitle[0].Actions = this.listlang[i]["translation"];
        // }
        // if (
        //   Constant.sidebarnav.userids.listing.Content ==
        //   this.listlang[i]["text"]
        // ) {
        //   BannerListTitle[0].userids = this.listlang[i]["translation"];
        // }
        // if (
        //   Constant.sidebarnav.userids.listing.Createdat ==
        //   this.listlang[i]["text"]
        // ) {
        //   BannerListTitle[0].userids = this.listlang[i]["translation"];
        // }
        // if (
        //   Constant.sidebarnav.userids.listing.Link == this.listlang[i]["text"]
        // ) {
        //   BannerListTitle[0].Link = this.listlang[i]["translation"];
        // }
        // if (
        //   Constant.sidebarnav.userids.listing.Position ==
        //   this.listlang[i]["text"]
        // ) {
        //   BannerListTitle[0].Position = this.listlang[i]["translation"];
        // }
        // if (
        //   Constant.sidebarnav.userids.listing.Title == this.listlang[i]["text"]
        // ) {
        //   BannerListTitle[0].Title = this.listlang[i]["translation"];
        // }
        // Create userId
        if (
          Constant.sidebarnav.userids.newuser.Title ==
          this.listlang[i]["text"]
        ) {
          userIdCreateTitle[0].Title = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.userids.newuser.Content ==
          this.listlang[i]["text"]
        ) {
          userIdCreateTitle[0].Content = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.userids.newuser.User ==
          this.listlang[i]["text"]
        ) {
          userIdCreateTitle[0].User = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.userids.newuser.Submit ==
          this.listlang[i]["text"]
        ) {
          userIdCreateTitle[0].Submit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.userids.newuser.Cancel ==
          this.listlang[i]["text"]
        ) {
          userIdCreateTitle[0].Cancel = this.listlang[i]["translation"];
        }
        // kpi
        // list
        if (Constant.sidebarnav.kpi.list.Content == this.listlang[i]["text"]) {
          KpiListTitle[0].Commission = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.Submit == this.listlang[i]["text"]) {
          KpiListTitle[0].Earning = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.Cancel == this.listlang[i]["text"]) {
          KpiListTitle[0].Shop = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.kpi.list.Description == this.listlang[i]["text"]
        ) {
          KpiListTitle[0].Tax = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.MainSet == this.listlang[i]["text"]) {
          KpiListTitle[0].TotalPrice = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.Category == this.listlang[i]["text"]) {
          KpiListTitle[0].TotalProduct = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.Alias == this.listlang[i]["text"]) {
          KpiListTitle[0].Totalorder = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.name == this.listlang[i]["text"]) {
          KpiListTitle[0].name = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.kpi.list.Active == this.listlang[i]["text"]) {
          KpiListTitle[0].RecieverCommission = this.listlang[i]["translation"];
        }

        //9. config
        // Listing
        if (
          Constant.sidebarnav.config.AccountNumber == this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].AccountNumber = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.Cashondelivery == this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Cashondelivery = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.Description == this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Description = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.Displaytext == this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Displaytext = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.Flexformsinglepaymentid ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Flexformsinglepaymentid = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.Flexformsubscriptionid ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Flexformsubscriptionid = this.listlang[i][
            "translation"
            ];
        }
        if (Constant.sidebarnav.config.Icon == this.listlang[i]["text"]) {
          ConfigListTitle[0].Icon = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Keywords == this.listlang[i]["text"]) {
          ConfigListTitle[0].Keywords = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Password == this.listlang[i]["text"]) {
          ConfigListTitle[0].Password = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Salt == this.listlang[i]["text"]) {
          ConfigListTitle[0].Salt = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Sandbox == this.listlang[i]["text"]) {
          ConfigListTitle[0].Sandbox = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Save == this.listlang[i]["text"]) {
          ConfigListTitle[0].Save = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Signature == this.listlang[i]["text"]) {
          ConfigListTitle[0].Signature = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.SubaccountNumber ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].SubaccountNumber = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Title == this.listlang[i]["text"]) {
          ConfigListTitle[0].Title = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Username == this.listlang[i]["text"]) {
          ConfigListTitle[0].Username = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.Value == this.listlang[i]["text"]) {
          ConfigListTitle[0].Value = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.name == this.listlang[i]["text"]) {
          ConfigListTitle[0].name = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.nameCol == this.listlang[i]["text"]) {
          ConfigListTitle[0].nameCol = this.listlang[i]["translation"];
        }
        // config item
        if (
          Constant.sidebarnav.config.item.Contactemail ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Contactemail = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.item.Paymentgatewayconfig ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Paymentgatewayconfig = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.item.Publiccontactemail ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Publiccontactemail = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.item.Publiccontactphonenumber ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Publiccontactphonenumber = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.item.SEOmetadataforhomepage ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].SEOmetadataforhomepage = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.item.Sitecommission ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Sitecommission = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.item.Sitefavicon ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Sitefavicon = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.item.Sitelogo == this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Sitelogo = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.item.Sitename == this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Sitename = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.item.Sociallinks ==
          this.listlang[i]["text"]
        ) {
          ConfigListTitle[0].Sociallinks = this.listlang[i]["translation"];
        }
        // language
        if (
          Constant.sidebarnav.config.languages.Active ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].Active = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.Addnew ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].Addnew = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.Createdat ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.Default ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].Default = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.Key == this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].Key = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.name == this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.nameCol ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].nameCol = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.AddNewLanguage ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].AddNewLanguage = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.languages.SelectLanguages ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].SelectLanguages = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.languages.LanguageRequired ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].LanguageRequired = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.config.languages.NameRequired ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].NameRequired = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.languages.Create ==
          this.listlang[i]["text"]
        ) {
          ConfigLanguageTitle[0].Create = this.listlang[i]["translation"];
        }
        // translation
        if (
          Constant.sidebarnav.config.translations.Pulltext ==
          this.listlang[i]["text"]
        ) {
          TranslatetionTitle[0].Pulltext = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.translations.Search ==
          this.listlang[i]["text"]
        ) {
          TranslatetionTitle[0].Search = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.translations.Text ==
          this.listlang[i]["text"]
        ) {
          TranslatetionTitle[0].Text = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.translations.Translation ==
          this.listlang[i]["text"]
        ) {
          TranslatetionTitle[0].Translation = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.translations.Update ==
          this.listlang[i]["text"]
        ) {
          TranslatetionTitle[0].Update = this.listlang[i]["translation"];
        }
        // text
        if (Constant.sidebarnav.config.text.Add == this.listlang[i]["text"]) {
          ConfigTextTitle[0].Add = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.text.Createdat == this.listlang[i]["text"]
        ) {
          ConfigTextTitle[0].Createdat = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.config.text.Search == this.listlang[i]["text"]
        ) {
          ConfigTextTitle[0].Search = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.text.Text == this.listlang[i]["text"]) {
          ConfigTextTitle[0].Text = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.config.text.name == this.listlang[i]["text"]) {
          ConfigTextTitle[0].name = this.listlang[i]["translation"];
        }
        // 10. Package
        // Listing
        if (
          Constant.sidebarnav.packages.packgelisting.Action ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].Action = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packgelisting.CreatedAt ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].CreatedAt = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packgelisting.Days ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].Days = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packgelisting.Duration ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].Duration = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packgelisting.Filter ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].Filter = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packgelisting.Name ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].Name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packgelisting.Price ==
          this.listlang[i]["text"]
        ) {
          PackageListingTitle[0].Price = this.listlang[i]["translation"];
        }
        //create package
        if (
          Constant.sidebarnav.packages.packagecreate.Description ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Description = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.Duration ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Duration = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate
            .Durationofthepackageinday == this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Durationofthepackageinday = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagecreate
            .Pleaseenterpackagedescription == this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Pleaseenterpackagedescription = this.listlang[
            i
            ]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate
            .Pleaseenterpackageduration == this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Pleaseenterpackageduration = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.Pleaseenterpackagename ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Pleaseenterpackagename = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.Pleaseenterpackageprice ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Pleaseenterpackageprice = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.Price ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Price = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.Submit ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].Submit = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.name ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagecreate.nameCol ==
          this.listlang[i]["text"]
        ) {
          PackageCreateTitle[0].nameCol = this.listlang[i]["translation"];
        }
        // payment History
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.CreatedAt ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].CreatedAt = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.Packagename ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].Packagename = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.PaymentGateway ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].PaymentGateway = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.Price ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].Price = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.SellerName ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].SellerName = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory
            .Thereisnoitemsyet == this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].Thereisnoitemsyet = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.TransactionId ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].TransactionId = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.packages.packagepaymenthistory.name ==
          this.listlang[i]["text"]
        ) {
          PackagePaymentHistoryTitle[0].name = this.listlang[i]["translation"];
        }
        // Error
        if (Constant.error.delete.sucess == this.listlang[i]["text"]) {
          ErrorTitle[0].deletesucess = this.listlang[i]["translation"];
        }
        if (Constant.error.delete.title == this.listlang[i]["text"]) {
          ErrorTitle[0].deletetitle = this.listlang[i]["translation"];
        }
        if (Constant.error.delete.unsucess == this.listlang[i]["text"]) {
          ErrorTitle[0].deleteunsucess = this.listlang[i]["translation"];
        }
        //Upload Image Title
        if (
          Constant.sidebarnav.upload.image.DropOrClickSelectImage ==
          this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].DropOrClickSelectImage = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.upload.image.MediaManager ==
          this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].MediaManager = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Library == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Library = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Upload == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Upload = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.upload.image.Name == this.listlang[i]["text"]) {
          UploadImageTitle[0].Name = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Description ==
          this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Description = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Search == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Search = this.listlang[i]["translation"];
        }
        if (Constant.sidebarnav.upload.image.URL == this.listlang[i]["text"]) {
          UploadImageTitle[0].URL = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.FileName == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].FileName = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.FileNameRequired ==
          this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].FileNameRequired = this.listlang[i][
            "translation"
            ];
        }
        if (
          Constant.sidebarnav.upload.image.FileDescription ==
          this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].FileDescription = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Update == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Update = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Select == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Select = this.listlang[i]["translation"];
        }
        if (
          Constant.sidebarnav.upload.image.Browse == this.listlang[i]["text"]
        ) {
          UploadImageTitle[0].Browse = this.listlang[i]["translation"];
        }
      }
    });
  }
}
