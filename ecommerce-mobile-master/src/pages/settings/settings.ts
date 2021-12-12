import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { AuthService, StaticPageService, SystemService } from '../../services';
import { LoginComponent } from '../auth/login/login.component';
import { StaticPageComponent } from '../static-page/static-page.component';
import {
  RefundListingComponent,
  AddressComponent,
} from '../profile/components';
import { OrderListingComponent } from '../../pages/order/components';
import { ConversationsComponent } from '../../pages/message/components';
import { HomePage } from '../home/home';
import { TranslateService } from '@ngx-translate/core';
import { RegisterComponent } from '../auth/register/register.component';
import { ProfileDetailComponent } from '../profile/components/profile_detail/profile_detail.component';
import { UserRoles } from '../../app/enums';
import { KPIListComponent } from '../list-kpi/list-kpi.component';
import { isNil } from 'lodash';
import { QrcodeResultComponent } from '../qrcode-result/qrcode-result.Component';
import { ListTicketComponent } from '../list-ticket/list-ticket';
import { BankInforComponent } from '../bank-infor/bank-infor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../app/environments/environment'

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  currentUser = {
    address: '',
    avatarUrl: '',
    city: { id: 0, name: '' },
    createdAt: '',
    district: { id: 0, name: '' },
    email: '',
    emailVerified: false,
    inventoryId: undefined,
    isActive: true,
    isMember: '',
    isShop: false,
    name: '',
    phoneNumber: '',
    phoneVerified: false,
    provider: '',
    role: '',
    shippingAddress: [],
    shopId: '',
    type: 'user',
    updatedAt: '',
    userRoles: [],
    username: '',
    ward: { id: 0, name: '' },
    zipCode: '',
    __v: 0,
    _id: '',
    
  };
  url ="http://online.gov.vn/Home/WebDetails/78019?AspxAutoDetectCookieSupport=1";
  isLoggedIn = false;
  staticPage = StaticPageComponent;
  pages = [];
  userLang = 'en';
  languages = [];
  isLoading = false;
  amountMoney;
  isShowKPls = false;

  constructor(
    public nav: NavController,
    private auth: AuthService,
    private pageService: StaticPageService,
    private translate: TranslateService,
    private systemService: SystemService,
    private cd: ChangeDetectorRef,
    private navParams: NavParams,
    private app: App,
    private http: HttpClient,
  ) {}

  async ionViewWillEnter(){
    const isRefresh = this.navParams.data;
    if (isRefresh) {
      await this.loadUserInfo();
    }
    const token = this.auth.getAccessToken();
    if (!isNil(token)) {
      this.isLoggedIn = true;
      this.isLoading = true;
      await this.loadUserInfo();
    }

    await this.systemService.configs().then((resp) => {
      if (resp) {
        this.languages = resp.i18n.languages;
        const userLangCache = localStorage.getItem('userLang');
        !isNil(userLangCache)
          ? (this.userLang = userLangCache)
          : (this.userLang = resp.userLang);
      }
    });
    if(!this.isLoggedIn && this.currentUser) {
      return this.nav.setRoot(LoginComponent);
    }
    await this.pageService
      .list({ take: 10 })
      .then((res) => (this.pages = res.data.items));
    if (this.auth.isLoggedin()) {
      await this.auth.getAmountMoney().then((res) => {
        this.amountMoney = res;
      });
    }
  }

  async loadUserInfo() {
    const token = this.auth.getAccessToken();
    if (!isNil(token)) {
      this.auth
        .getCurrentUser()
        .then(async (res) => {
          this.currentUser = res;
          const checkRole = this.currentUser.userRoles.find(
            (x) =>
              x.Role === UserRoles.HUB ||
              x.Role === UserRoles.WE ||
              x.Role === UserRoles.Admin ||
              x.Role === UserRoles.GENERALCONTRACTOR||
              x.Role === UserRoles.WE_FREE
          );
          if (checkRole) {
            const check = this.currentUser.userRoles.find(
              (x) => x.Role === UserRoles.WE_HOME
            );
            !isNil(check)
              ? (this.currentUser.role = 'WE HOME')
              : (this.currentUser.role = checkRole.RoleName);
          }
          if (
            this.currentUser.role === 'WE HOME' ||
            this.currentUser.role === 'WE'
          ) {
            this.isShowKPls = true;
          }
          this.isLoading = false;

          await this.auth.me_social().then(() => {
            this.currentUser.avatarUrl = res.data.socialInfo.Avatar;
          });
        })
        .catch(() => (this.isLoading = false));
    }
  }

  refresh() {
    this.cd.detectChanges();
  }

  goTo(state: string) {
    if (state === 'login') {
      return this.nav.push(LoginComponent);
    } else if (state === 'profile_detail') {
      return this.nav.push(ProfileDetailComponent, this.currentUser);
    } else if (state === 'orders') {
      return this.nav.push(OrderListingComponent);
    } else if (state === 'messages') {
      return this.nav.push(ConversationsComponent);
    } else if (state === 'refund') {
      return this.nav.push(RefundListingComponent);
    } else if (state === 'address') {
      return this.nav.push(AddressComponent);
    } else if (state === 'register') {
      return this.nav.push(RegisterComponent, false);
    } else if (state === 'kpi') {
      return this.nav.push(KPIListComponent, false);
    }
    else if (state === 'paper') {
      return this.nav.push(QrcodeResultComponent);
    }
    else if (state === 'list-box') {
      return this.nav.push(ListTicketComponent);
    }
    else if (state === 'card') {
      return this.nav.push(BankInforComponent);
    }
  }

  changeLang() {
    const userLangCache = localStorage.getItem('userLang');
    if (!isNil(userLangCache)) {
      this.systemService.setUserLang(this.userLang);
      this.translate.use(this.userLang);
    }
    if (isNil(userLangCache)) {
      localStorage.setItem('userLang', this.userLang);
      this.systemService.setUserLang(this.userLang);
      this.translate.use(this.userLang);
    }
  }
  // logout
  logout() {
    this.auth.logout();
    this.refresh();
    this.nav.setRoot(LoginComponent);
    return this.app.getActiveNav().parent.select(0);
  }

  async getListUSer(){
    let page = 1;
    let pageSize =20;
    let status = 9999;
    let fromDate = '01/01/2020%2000:00:00';
    let toDate = '08/06/2021%2023:59:59';
    let filterId=2;
    let IsMember= 9999;
    let RoleId = 9999;
    try {
      const res = await this.http
      .get(`https://we40-web-invest.fdssoft.com/Admin/GetListMemberV2?page=${page}&pageSize=${pageSize}&status=${status}&keys=&fromDate=${fromDate}&toDate=${toDate}&filterId=${filterId}&IsMember=${IsMember}&RoleId=${RoleId}`)
      .toPromise();
      console.log(res)
      return res;
      
    } catch (error) {
      console.log(error)
    }
  }
}