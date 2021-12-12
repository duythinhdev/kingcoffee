import { OrderTrackingComponent } from './../pages/order/components/order-tracking/order-tracking.component';
import { BrowserModule } from '@angular/platform-browser';
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { HTTP } from '@ionic-native/http';

import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { RestangularModule } from 'ngx-restangular';
import { QRScanner } from '@ionic-native/qr-scanner';
import { QrScan } from '../providers/qr-scan/qr-scan';
import {
  NgbModule,
  NgbRatingConfig,
  NgbPaginationConfig,
} from '@ng-bootstrap/ng-bootstrap';
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
  LoginOpt,
  AuthService as SocialLoginService,
} from 'angularx-social-login';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Stripe } from '@ionic-native/stripe';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import {
  IonicImageViewerModule,
  ImageViewerController,
} from 'ionic-img-viewer';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Network } from '@ionic-native/network';

import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { SpinLuckyPage } from '../pages/spin-lucky/spin-lucky';
import { WebviewInappPage } from '../pages/webview-inapp/webview-inapp';
import { ScanQrcodePage } from '../pages/scan-qrcode/scan-qrcode';
import { ScanQRCodeInfo } from '../pages/scan-qrcode-info/scan-qrcode-info';
import { DummyComponent } from '../pages/dummy/dummy';
import { BankInforComponent } from '../pages/bank-infor/bank-infor';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Device } from '@ionic-native/device';
// components + resolvers
import { Modalluckyspinner } from "../pages/modalluckyspinner/modalluckyspinner";
import {
  LoginComponent,
  SignupComponent,
  SignupWeFreeComponent,
  ForgotComponent,
  FacebookLoginButtonComponent,
  GoogleLoginButtonComponent,
} from '../pages/auth';
import { ListTicketComponent } from '../pages/list-ticket/list-ticket'
import { NotificationsPage } from '../pages/notifications/notifications';
import {
  FeaturedProductsComponent,
  ProductCard,
  ProductDetailComponent,
  ProductListingComponent,
  SearchSidebarComponent,
} from '../pages/products';
import { BannerComponent } from '../pages/banner/banner.component';
import { StaticPageComponent } from '../pages/static-page/static-page.component';
import { ContactComponent } from '../pages/contact/contact.component';
import { QrcodeResultComponent } from '../pages/qrcode-result/qrcode-result.Component';
import {
  UpdateComponent,
  RefundListingComponent,
  AddressComponent,
  InsertUpdateAddressComponent,
} from '../pages/profile/components';
import {
  OrderListingComponent,
  OrderViewComponent,
  RefundModalComponent,
} from '../pages/order/components';
import {
  CheckoutComponent,
  CheckoutSuccessComponent,
  CodVerifyModalComponent,
} from '../pages/cart/components';
import {
  SendMessageButtonComponent,
  MessageMessageModalComponent,
  MessagesComponent,
  ConversationsComponent,
} from '../pages/message/components';
import { MediaComponent } from '../pages/media/media.component';
import { TabsPage } from '../pages/tabs/tabs';

import { AutoCompleteModule } from 'ionic2-auto-complete';
import {
  AppHeader,
  DialCodeComponent,
  ReviewComponent,
  ReviewEditComponent,
  ReviewListComponent,
  StarRating,
} from '../utils/components';
import {
  NoPhotoPipe,
  CurrencyPipe,
  PriceCurrencyPipe,
  FilterPipe,
  EnumToArrayPipe,
  ShopBannerPipe,
  ShopLogoPipe,
} from '../utils/pipes';
import {
  ProductService,
  ProductVariantService,
  CartService,
  WishlistService,
  ComplainService,
  CategoryService,
  SeoService,
  ReviewService,
  SystemService,
  AuthService,
  StaticPageService,
  RefundService,
  ShopService,
  ReportService,
  BannerService,
  OrderService,
  TransactionService,
  CurrencyService,
  ContactService,
  MessageService,
  PusherService,
  ToastyService,
  CouponService,
  LocationService,
  CheckoutService,
  PromotionService,
  QrcodeService,
  SpinService
} from '../services';
import { CommonModule } from '@angular/common';
import { AccountService } from '../services/account.service';
import { MsgService } from '../services/msg-message.service';
import { HttpInterceptorService } from '../services/http-interceptor.service';
import { LocalStorgeService } from '../services/local-storge.service';
import { ReCaptchaService } from '../services/captcha.service';
import { ReCaptchaComponent } from '../utils/components/reCaptCha/captcha.component';
import { RegisterComponent } from '../pages/auth/register/register.component';
import { AccountComponent } from '../pages/auth/account/account.component';
import { InfomationService } from '../services/information.service';
import { PopoversComponent } from '../pages/auth/popovers/popovers.component';
import { ConfirmOTPComponent } from '../pages/auth/confirmOTP/confirmOTP.component';
import { ConfirmOtpSocialComponent } from '../pages/auth/confirm-otp-social/confirm-otp-social.component';
import { SurveyComponent } from '../pages/auth/survey/survey.component';
import { ProfileDetailComponent } from '../pages/profile/components/profile_detail/profile_detail.component';
import { ListBankComponent } from '../pages/profile/components/listBank/list-bank.component';
import { ChangePasswordComponent } from '../pages/profile/components/changePassword/changePassword.component';
import { UserInvestService } from '../services/userInvest.service';
import { CreateOrderComponent } from '../pages/order/components/create_order/create_order.component';
import { TPLService } from '../services/tpl.service';
import { TPLTypeComponent } from '../pages/order/components/TPLType/tplType.component';
import { PaymentTypeComponent } from '../pages/order/components/paymentType/paymentType.component';
import { ResultOrderComponent } from '../pages/order/components/result_order/result_order.component';
import { TabsService } from '../services/tabs.service';
import { PaymentService } from '../services/payment.service';
import { Deeplinks } from '@ionic-native/deeplinks';
import { TPLShipmentService } from '../services/tplShipment.service';
import { ProductListService } from '../services/productList.service';
import { PaymentGatewayNamePipe } from '../utils/pipes/paymentGatewayName.pipe';
import { KPIListComponent } from '../pages/list-kpi/list-kpi.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ListKpiService } from '../services/listkpi.service';
import { ChangeDate } from '../pages/list-kpi/pipeDate';
import { PreferentialProducts } from '../pages/cart/components/preferential-products/preferential-products.component';
import { UpdateProfileComponent } from '../pages/profile/components/update_profile/update-profile.component';
import { WeErrorHandler } from '../services/error.service';
import { GiftNewMemberComponent } from '../pages/cart/components/gift-newmember/gift-newmember.component';
import { CheckoutDiscountOrderQuantityComponent } from '../pages/cart/components/checkout-discount-order-quantity/checkout-discount-order-quantity';
import { PromotionBannerComponent } from '../pages/promotion-banner/promotion-banner.component';
import { PopupPromotionComponent } from '../pages/popup/popup-promotion';
import { NotificationComponent } from '../pages/notification/notification.component';
import { NotificationService } from '../services/notification.service';
import { NotificationDetailComponent } from '../pages/notification-detail/notification-detail.component';
import { ReferralComponent } from '../pages/profile/components/referral/referral-component';
import { ReferralBannerComponent } from '../pages/profile/components/referral/components/promotion-referral/referral-banner';
import { Clipboard } from '@ionic-native/clipboard';
import { GiftForOrderComponent } from '../pages/cart/components/give-for-order/gift-for-order';
import { FCM } from '@ionic-native/fcm';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { PromotionPage } from '../pages/promotion-tab/promotion-tab.component';

import { TermComponent } from '../pages/profile/components/term/term.component';
import { GeneralPolicyComponent } from '../pages/profile/components/term/general-policy/general-policy.component';
import { PrivacyPolicyComponent } from '../pages/profile/components/term/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '../pages/profile/components/term/terms-of-use/terms-of-use.component';
import { MembershiRegistrationProcessComponent } from '../pages/profile/components/term/membership-registration-process/membership-registration-process.component';
import { RefundRefundProcessComponent } from '../pages/profile/components/term/refund-refund-process/refund-refund-process.component';
import { DeliveryProcessComponent } from '../pages/profile/components/term/delivery-process/delivery-process.component';
import { PurchaseProcessComponent } from '../pages/profile/components/term/purchase-process/purchase-process.component';
import { PaymentPolicyComponent } from '../pages/profile/components/term/payment-policy/payment-policy.component';
import { ReturnPolicyComponent } from '../pages/profile/components/term/return-policy/return-policy.component';
import { OtherPoliciesComponent } from '../pages/profile/components/term/other-policies/other-policies.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AboutLinkReferralComponent } from '../pages/profile/components/term/about-link-referral/about-link-referral';
import { PromotionCard } from '../pages/products/poromotion-card/promotion-card';
import { PromotionDetailsPage } from '../pages/promotion-detail-list/promotion-detail-list.component';
import { Keyboard } from '@ionic-native/keyboard';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { IRoot } from '../../plugins/cordova-plugin-iroot/www/iroot';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

declare var IRoot: IRoot;

// Function for setting the default restangular configuration
export function RestangularConfigFactory(RestangularProvider, acc) {
  // TODO - change default config
  RestangularProvider.setBaseUrl(window.appConfig.apiBaseUrl);
  RestangularProvider.addFullRequestInterceptor(
    (element, operation, path, url, headers) => {
      // Auto add token to header
      headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
      headers.platform = window.appConfig.platform;
      return {
        headers,
      };
    }
  );
  RestangularProvider.addErrorInterceptor((response) => {
    // force logout and relogin
    if (
      response.status === 401 ||
      (response.status === 400 && response.data.message === 'Unauthorized') ||
      (response.status === 400 &&
        response.data.message === 'User infomation is not exist') ||
      (response.status === 400 && response.message === 'Unauthorized')
    ) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isLoggedin');
      // TODO - handle me with nav and set nav to login page
      // window.location.reload();
      acc.logout();
      return false; // error handled
    }

    return true; // error not handled
  });
}

// config social connection
export function provideConfig() {
  const googleLoginOptions: LoginOpt = {
    scope: 'profile email',
  }; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

  const fbLoginOptions: LoginOpt = {
    scope: 'email',
    return_scopes: true,
    enable_profile_selector: true,
  }; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

  return new AuthServiceConfig([
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(
        window.appConfig.googleClientId,
        googleLoginOptions
      ),
    },
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider(
        window.appConfig.facebookAppId,
        fbLoginOptions
      ),
    },
  ]);
}

export function createTranslateLoader(http: HttpClient) {
  const translateLoader = new TranslateHttpLoader(
    http,
    `${window.appConfig.apiBaseUrl}/i18n/`,
    '.json'
  );
  return translateLoader;
  // return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

// import pages
// end import pages

@NgModule({
  declarations: [
    MyApp,
    SettingsPage,
    HomePage,
    AppHeader,
    LoginComponent,
    NotificationsPage,
    SignupComponent,
    SignupWeFreeComponent,
    ForgotComponent,
    TabsPage,
    FeaturedProductsComponent,
    ProductCard,
    ProductDetailComponent,
    NoPhotoPipe,
    CurrencyPipe,
    StarRating,
    ReviewComponent,
    ReviewListComponent,
    UpdateComponent,
    MediaComponent,
    FacebookLoginButtonComponent,
    GoogleLoginButtonComponent,
    BannerComponent,
    CheckoutComponent,
    PriceCurrencyPipe,
    FilterPipe,
    CheckoutSuccessComponent,
    CodVerifyModalComponent,
    ProductListingComponent,
    SearchSidebarComponent,
    ContactComponent,
    OrderListingComponent,
    OrderViewComponent,
    RefundModalComponent,
    SendMessageButtonComponent,
    MessageMessageModalComponent,
    MessagesComponent,
    ConversationsComponent,
    RefundListingComponent,
    StaticPageComponent,
    ReviewEditComponent,
    DialCodeComponent,
    AddressComponent,
    InsertUpdateAddressComponent,
    ReCaptchaComponent,
    RegisterComponent,
    AccountComponent,
    PopoversComponent,
    ConfirmOTPComponent,
    ConfirmOtpSocialComponent,
    SurveyComponent,
    ProfileDetailComponent,
    ListBankComponent,
    ChangePasswordComponent,
    CreateOrderComponent,
    TPLTypeComponent,
    PaymentTypeComponent,
    ResultOrderComponent,
    ConfirmOTPComponent,
    ConfirmOtpSocialComponent,
    SurveyComponent,
    ProfileDetailComponent,
    ListBankComponent,
    ChangePasswordComponent,
    CreateOrderComponent,
    TPLTypeComponent,
    OrderTrackingComponent,
    PaymentTypeComponent,
    ResultOrderComponent,
    EnumToArrayPipe,
    PaymentGatewayNamePipe,
    KPIListComponent,
    ChangeDate,
    PreferentialProducts,
    ShopBannerPipe,
    ShopLogoPipe,
    UpdateProfileComponent,
    GiftNewMemberComponent,
    CheckoutDiscountOrderQuantityComponent,
    PromotionBannerComponent,
    PopupPromotionComponent,
    NotificationComponent,
    NotificationDetailComponent,
    ReferralComponent,
    ReferralBannerComponent,
    GiftForOrderComponent,
    PromotionPage,
    PaymentTypeComponent,
    ResultOrderComponent,
    EnumToArrayPipe,
    PaymentGatewayNamePipe,
    KPIListComponent,
    ChangeDate,
    PreferentialProducts,
    TermComponent,
    GeneralPolicyComponent,
    PrivacyPolicyComponent,
    TermsOfUseComponent,
    MembershiRegistrationProcessComponent,
    RefundRefundProcessComponent,
    DeliveryProcessComponent,
    PurchaseProcessComponent,
    PaymentPolicyComponent,
    ReturnPolicyComponent,
    OtherPoliciesComponent,
    AboutLinkReferralComponent,
    PromotionCard,
    PromotionDetailsPage,
    SpinLuckyPage,
    WebviewInappPage,
    ScanQrcodePage,
    ScanQRCodeInfo,
    ListTicketComponent,
    QrcodeResultComponent,
    DummyComponent,
    Modalluckyspinner,
    BankInforComponent
  ],
  imports: [
    BrowserModule,
    AutoCompleteModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    CommonModule,
    IonicModule,
    SocialLoginModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false,
      mode: 'md',
    }),
    IonicStorageModule.forRoot({
      name: 'genstore-v1',
      driverOrder: ['indexeddb', 'sqlite', 'websql'],
    }),
    RestangularModule.forRoot([AccountService], RestangularConfigFactory),
    IonicImageViewerModule,
    NgCircleProgressModule.forRoot({
      radius: 50,
      space: -10,
      outerStrokeWidth: 0,
      // outerStrokeColor: '#d11287',
      // innerStrokeColor: '#e7e8ea',
      innerStrokeWidth: 0,
      title: 'KPIs',
      animateTitle: false,
      animationDuration: 1000,
      showSubtitle: true,
      showUnits: false,
      showBackground: false,
      clockwise: true,
      responsive: true,
    }),
  ],
  exports: [
    NoPhotoPipe,
    AppHeader,
    SearchSidebarComponent,
    CurrencyPipe,
    StarRating,
    BannerComponent,
    PriceCurrencyPipe,
    DialCodeComponent,
    MediaComponent,
    FacebookLoginButtonComponent,
    GoogleLoginButtonComponent,
    SendMessageButtonComponent,
    MessageMessageModalComponent,
    ReCaptchaComponent,
    FilterPipe,
    EnumToArrayPipe,
    PaymentGatewayNamePipe,
    ShopBannerPipe,
    ShopLogoPipe,
    ReferralComponent,
    PromotionDetailsPage,
    DummyComponent
    // Modalluckyspinner
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SettingsPage,
    HomePage,
    NotificationsPage,
    StaticPageComponent,
    LoginComponent,
    SignupComponent,
    SignupWeFreeComponent,
    ForgotComponent,
    TabsPage,
    FeaturedProductsComponent,
    ProductCard,
    ProductListingComponent,
    ProductDetailComponent,
    ReviewComponent,
    ReviewListComponent,
    UpdateComponent,
    MediaComponent,
    CheckoutComponent,
    OrderListingComponent,
    CheckoutSuccessComponent,
    CodVerifyModalComponent,
    ContactComponent,
    OrderViewComponent,
    RefundModalComponent,
    MessagesComponent,
    MessageMessageModalComponent,
    ConversationsComponent,
    RefundListingComponent,
    ReviewEditComponent,
    AddressComponent,
    InsertUpdateAddressComponent,
    DialCodeComponent,
    ReCaptchaComponent,
    RegisterComponent,
    AccountComponent,
    PopoversComponent,
    ConfirmOTPComponent,
    ConfirmOtpSocialComponent,
    SurveyComponent,
    ProfileDetailComponent,
    ListBankComponent,
    ChangePasswordComponent,
    CreateOrderComponent,
    TPLTypeComponent,
    PaymentTypeComponent,
    ResultOrderComponent,
    TPLTypeComponent,
    OrderTrackingComponent,
    TPLTypeComponent,
    PaymentTypeComponent,
    ResultOrderComponent,
    KPIListComponent,
    PreferentialProducts,
    UpdateProfileComponent,
    GiftNewMemberComponent,
    CheckoutDiscountOrderQuantityComponent,
    PromotionBannerComponent,
    PopupPromotionComponent,
    NotificationComponent,
    NotificationDetailComponent,
    ReferralComponent,
    ReferralBannerComponent,
    GiftForOrderComponent,
    PromotionPage,
    TermComponent,
    GeneralPolicyComponent,
    PrivacyPolicyComponent,
    TermsOfUseComponent,
    MembershiRegistrationProcessComponent,
    RefundRefundProcessComponent,
    DeliveryProcessComponent,
    PurchaseProcessComponent,
    PaymentPolicyComponent,
    ReturnPolicyComponent,
    OtherPoliciesComponent,
    AboutLinkReferralComponent,
    PromotionCard,
    PromotionDetailsPage,
    SpinLuckyPage,
    WebviewInappPage,
    ScanQrcodePage,
    ScanQRCodeInfo,
    ListTicketComponent,
    QrcodeResultComponent,
    DummyComponent,
    Modalluckyspinner,
    BankInforComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ImageViewerController,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler,
    },
    NgbRatingConfig,
    NgbPaginationConfig,
    RefundService,
    GoogleAnalytics,
    ProductVariantService,
    ProductService,
    StaticPageService,
    CartService,
    WishlistService,
    ComplainService,
    SocialSharing,
    SeoService,
    ReviewService,
    SystemService,
    AuthService,
    Geolocation,
    FileTransfer,
    FileTransferObject,
    Camera,
    FilePath,
    File,
    LocationService,
    TPLService,
    TranslateService,
    Network,
    AccountService,
    MsgService,
    LocalStorgeService,
    ReCaptchaService,
    InfomationService,
    UserInvestService,
    TabsService,
    SocialLoginService,
    PaymentService,
    TPLShipmentService,
    ProductListService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig,
    },
    ShopService,
    ReportService,
    BannerService,
    CurrencyService,
    OrderService,
    TransactionService,
    CategoryService,
    CouponService,
    Stripe,
    ContactService,
    MessageService,
    PusherService,
    ToastyService,
    PhotoViewer,
    Deeplinks,
    ListKpiService,
    WeErrorHandler,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    PromotionService,
    CheckoutService,
    NotificationService,
    Clipboard,
    FCM,
    LocalNotifications,
    InAppBrowser,
    Keyboard,
    QRScanner,
    QrScan,
    QrcodeService,
    HTTP,
    SpinService,
    UniqueDeviceID,
    Device,
    SafariViewController,
    Facebook,
    GooglePlus,
  ],
})
export class AppModule {}
