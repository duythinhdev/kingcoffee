import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../app/environments/environment';
import { LocalStorgeService } from './local-storge.service';
import { SystemService } from './system.service';
import { isNil } from 'lodash';
import { ResponseModel } from '../models/response.model';
import { FCM } from '@ionic-native/fcm';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { Platform } from 'ionic-angular';

declare let window: any;

@Injectable()
export class AuthService {
  private accessToken: string;
  private currentUser;
  private userLoaded = new Subject();
  userLoaded$ = this.userLoaded.asObservable();
  isLoggedIn = new Subject();
  isLoggedIn$ = this.isLoggedIn.asObservable();
  // ensure do not load if it is in the promise
  // because many component use get current user function
  private _getUser;

  constructor(
    private restangular: Restangular,
    private http: HttpClient,
    private localStorgeService: LocalStorgeService,
    private systemService: SystemService,
    private googlePlus: GooglePlus,
    private facebook: Facebook,
    private platform: Platform,
  ) { }

  async getCurrentUser() {
    this._getUser = await this.restangular
      .one('users', 'me')
      .get()
      .toPromise()
      .then((resp) => {
        this.currentUser = resp.data;
        this.userLoaded.next(resp.data);

        return resp.data;
      });

    return this._getUser;
  }

  async changeRoleToWeHome() {
    try {
      const res = await this.http
        .get(`${environment.investUrl}/Account/ChangeRoleToWeHome`)
        .toPromise();
      return res;
    } catch (error) {
      console.log(error)
    }


  }
  async changeRoleToWe() {
    try {
      const res = await this.http
        .get(`${environment.investUrl}/Account/ChangeRoleToWeHome`)
        .toPromise();
      return res;
    } catch (error) {
      console.log(error)
    }
  }

  async getWheelResult(param) {
    return this.restangular.all('wheel/result').post(param).toPromise();
  }
  async getWheelResult_test() {
    console.log('spin ')
    return this.restangular.all('wheel/result').post().toPromise();
  }
  async getStartDay() {
    return this.restangular.one('wheel/start-date').get().toPromise();
  }

  async UpdateProfile(profiles) {
    return this.http
      .post(`${environment.investUrl}/Account/UpdateProfile`, profiles)
      .toPromise();
  }
  async login(credentials) {
    return this.restangular
      .all('auth/login')
      .post(credentials)
      .toPromise()
      .then(
        (resp) => {
          localStorage.clear();
          localStorage.setItem('accessToken', resp.data.token);
          if (
            resp.code === 4003 ||
            resp.message === 'Mã xác thực không đúng!'
          ) {
            return resp;
          } else {
            return this.restangular
              .one('users', 'me')
              .get()
              .toPromise()
              .then(async (userMe) => {
                const res = await this.http
                  .post(`${environment.identityUrl}/login`, credentials)
                  .toPromise() as { StatusCode: number, Data: string };
                if (res.StatusCode === 200) {
                  localStorage.setItem('tokenIdentity', res.Data);
                }

                this.currentUser = userMe.data;
                localStorage.setItem('isLoggedin', 'yes');
                this.userLoaded.next(userMe.data);
                return userMe;
              });
          }
        },
        (error) => {
          return error;
        }
      );
  }



  async socialLogin(provider: string, params: {}) {
    return new Promise((resolve, reject) => {
      this.restangular
        .all('auth/login')
        .customPOST(params, provider)
        .toPromise()
        .then((resp) => {
          localStorage.setItem('accessToken', resp.data.token);
          return this.restangular
            .one('users', 'me')
            .get()
            .then((userMe) => {
              this.currentUser = userMe.data;
              localStorage.setItem('isLoggedin', 'yes');
              this.userLoaded.next(userMe.data);
              resolve(true);
              return userMe.data;
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => {
          reject(e);
        })
    });
  }
  async socialLoginFacebook(credentials) {
    return this.restangular
      .all('auth/login/facebook')
      .post(credentials)
      .toPromise()
      .then(
        (resp) => {
          console.log('resp')
          console.log(resp)
          localStorage.clear();
          localStorage.setItem('accessToken', resp.data.token);
          if (
            resp.code === 4003 ||
            resp.message === 'Mã xác thực không đúng!'
          ) {
            return resp;
          } else {
            return this.restangular
              .one('users', 'me')
              .get()
              .toPromise()
              .then(async (userMe) => {
                console.log('userMe')
                console.log(userMe)
                this.currentUser = userMe.data;
                localStorage.setItem('isLoggedin', 'yes');
                this.userLoaded.next(userMe.data);
                console.log(userMe.data)
                return userMe;
              });
          }
        },
        (error) => {
          return error;
        }
      ).catch((e) => {
        console.log(e)
        return(e);
      });
  }
  async socialLoginGoogle(credentials) {
    return this.restangular
      .all('auth/login/google')
      .post(credentials)
      .toPromise()
      .then(
        (resp) => {
          console.log('resp')
          console.log(resp)
          localStorage.clear();
          localStorage.setItem('accessToken', resp.data.token);
          if (
            resp.code === 4003 ||
            resp.message === 'Mã xác thực không đúng!'
          ) {
            return resp;
          } else {
            return this.restangular
              .one('users', 'me')
              .get()
              .toPromise()
              .then(async (userMe) => {
                console.log('userMe')
                console.log(userMe)
                this.currentUser = userMe.data;
                localStorage.setItem('isLoggedin', 'yes');
                this.userLoaded.next(userMe.data);
                console.log(userMe.data)
                return userMe;
              });
          }
        },
        (error) => {
          return error;
        }
      ).catch((e) => {
        console.log(e)
        return(e);
      });;
  }

  async updateProfile(credentials){
    return this.restangular
      .all('users/updateEmailPhone')
      .post(credentials)
      .toPromise()
      .then(
        (resp) => {
          console.log(resp)
        },
        (error) => {
          return error;
        }
      );
  }

  async socialLoginApple(credentials) {
    return this.restangular
      .all('auth/login/apple')
      .post(credentials)
      .toPromise()
      .then(
        (resp) => {
          console.log('resp')
          console.log(resp)
          localStorage.clear();
          localStorage.setItem('accessToken', resp.data.token);
          if (
            resp.code === 4003 ||
            resp.message === 'Mã xác thực không đúng!'
          ) {
            return resp;
          } else {
            return this.restangular
              .one('users', 'me')
              .get()
              .toPromise()
              .then(async (userMe) => {
                console.log('userMe')
                console.log(userMe)
                this.currentUser = userMe.data;
                localStorage.setItem('isLoggedin', 'yes');
                this.userLoaded.next(userMe.data);
                console.log(userMe.data)
                return userMe;
              });
          }
        },
        (error) => {
          return error;
        }
      ).catch((e) => {
        console.log(e)
        return(e);
      });;
  }

  async onGoogleLogin(): Promise<{ accessToken: string }> {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      this.googlePlus.login({}).then((res) => {
        resolve(res);
      }).catch((e) => {
        reject(e);
      });
    })
  }

  async onFacebookLogin(): Promise<FacebookLoginResponse> {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      this.facebook.login(['public_profile', 'email'])
        .then((res: FacebookLoginResponse) => {
          console.log(res)
          resolve(res);
        })
        .catch((e) => {
          console.log(e)
          reject(e);
        })
    });
  }

  async onAppleLogin() {
    if (this.platform.is('ios')) {
      return new Promise(((resolve, reject) => {
        window.cordova.plugins.SignInWithApple.signin(
          { requestedScopes: [0, 1] },
          (res) => {
            resolve(res);
          },
          (e) => {
            reject(e);
          }
        );
      }));
    }
  }

  onGoogleLogout() {
    this.googlePlus.logout().then((res) => {
      console.log('RES__login.component__onGoogleLogout() Res:', res);
    }).catch((e) => {
      console.log('ERROR__login.component__onGoogleLogout() catch:', e);
    });
  }

  onFacebookLogout() {
    this.facebook.logout().then((res) => {
      console.log('RES__login.component__onFacebookLogout() Res:', res);
    }).catch((e) => {
      console.log('ERROR__login.component__onFacebookLogout() catch:', e);
    })
  }

  onSocialLogout() {
    this.onFacebookLogout();
    this.onGoogleLogout();
  }

  register(info) {
    return this.restangular.all('auth/register').post(info).toPromise();
  }

  getAccessToken() {
    if (isNil(this.accessToken)) {
      this.accessToken = localStorage.getItem('accessToken');
    }

    return this.accessToken;
  }

  addDevice(device) {
    return this.restangular.all('devices').post(device).toPromise();
  }

  removeToken() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isLoggedin');
  }

  getRoleId() {
    return localStorage.getItem('role');
  }

  isLoggedin() {
    return localStorage.getItem('isLoggedin') === 'yes';
  }

  async isMember() {
    const userMe = await this.me();
    if (userMe.data) {
      this.localStorgeService.set('isMember', userMe.data.isMember);
      if (userMe.data.userRoles.length > 0) {
        let roleId = userMe.data.userRoles[0].Role;
        let roleName = userMe.data.userRoles[0].RoleName;
        this.localStorgeService.set('role', roleId);
        if (roleName == '5') {
          roleName = 'we_free';
        }
        this.localStorgeService.set('roleName', roleName);
      }
    }
    return localStorage.getItem('role') === '3'
      ? true
      : isNil(localStorage.getItem('isMember'))
        ? false
        : localStorage.getItem('isMember') === 'false'
          ? false
          : true;
  }

  updateMe(data) {
    return this.restangular
      .all('users')
      .customPUT(data)
      .toPromise()
      .then((resp) => {
        this.currentUser = resp.data;
        this.userLoaded.next(resp.data);
      });
  }

  me() {
    const currentVersion = parseInt(window.appConfig.version, 10);
    this.systemService.configs().then(
      res => {
        const appVersion = res.appVersion
        if (currentVersion < appVersion) {
          this.logout();
        }
      }
    );
    return this.restangular.one('users', 'me').get().toPromise();
  }

  me_social() {
    return this.restangular.one('users', 'social').get().toPromise();
  }
  add_couponCodes(list_coupon) {
    return this.restangular.all('users/addCouponCodes').post(list_coupon).toPromise();
  }

  getAmountMoney() {
    return this.restangular
      .one('invest', 'wallet')
      .get()
      .toPromise()
      .then((resp) => {
        return resp.data;
      });
  }
  getShippingAdress() {
    return this.restangular
      .one('users', 'shippingAddress')
      .get()
      .toPromise()
      .then((resp) => {
        return resp.data;
      });
  }

  // logout
  logout() {
    this.removeToken();
    this.accessToken = undefined;
    localStorage.clear();
    this.onSocialLogout();
    this.isLoggedIn.next(false);
  }

  checkReferralUser(referralCode) {
    return this.http
      .post(
        `${environment.investUrl}/Account/CheckCustomerNumberSponsor`,
        {
          customerNumberSponsor: referralCode,
        },
        {
          headers: {
            'x-api-key': `${window.appConfig.investAPIKey}`,
          },
        }
      )
      .toPromise();
  }

  async listMemberReferralF1(): Promise<ResponseModel> {
    return await this.http
      .get(
        `${environment.investUrl}/Account/ListMemberReferralsF1`,
        {
          headers: {
            'x-api-key': `${window.appConfig.investAPIKey}`,
          },
        }
      )
      .toPromise() as ResponseModel;
  }
  async postlistMemberReferralF1(token): Promise<ResponseModel> {
    return await this.http
      .post(
        `${environment.investUrl}/Account/ListMemberReferralsF1`,
        {
          token: token,
        },
        {
          headers: {
            'x-api-key': `${window.appConfig.investAPIKey}`,
          },
        }
      )
      .toPromise() as ResponseModel;
  }

  getDialCodes() {
    return [
      { name: 'Israel', dialCode: '+972', code: 'IL' },
      { name: 'Afghanistan', dialCode: '+93', code: 'AF' },
      { name: 'Albania', dialCode: '+355', code: 'AL' },
      { name: 'Algeria', dialCode: '+213', code: 'DZ' },
      { name: 'AmericanSamoa', dialCode: '+1 684', code: 'AS' },
      { name: 'Andorra', dialCode: '+376', code: 'AD' },
      { name: 'Angola', dialCode: '+244', code: 'AO' },
      { name: 'Anguilla', dialCode: '+1 264', code: 'AI' },
      { name: 'Antigua and Barbuda', dialCode: '+1268', code: 'AG' },
      { name: 'Argentina', dialCode: '+54', code: 'AR' },
      { name: 'Armenia', dialCode: '+374', code: 'AM' },
      { name: 'Aruba', dialCode: '+297', code: 'AW' },
      { name: 'Australia', dialCode: '+61', code: 'AU' },
      { name: 'Austria', dialCode: '+43', code: 'AT' },
      { name: 'Azerbaijan', dialCode: '+994', code: 'AZ' },
      { name: 'Bahamas', dialCode: '+1 242', code: 'BS' },
      { name: 'Bahrain', dialCode: '+973', code: 'BH' },
      { name: 'Bangladesh', dialCode: '+880', code: 'BD' },
      { name: 'Barbados', dialCode: '+1 246', code: 'BB' },
      { name: 'Belarus', dialCode: '+375', code: 'BY' },
      { name: 'Belgium', dialCode: '+32', code: 'BE' },
      { name: 'Belize', dialCode: '+501', code: 'BZ' },
      { name: 'Benin', dialCode: '+229', code: 'BJ' },
      { name: 'Bermuda', dialCode: '+1 441', code: 'BM' },
      { name: 'Bhutan', dialCode: '+975', code: 'BT' },
      { name: 'Bosnia and Herzegovina', dialCode: '+387', code: 'BA' },
      { name: 'Botswana', dialCode: '+267', code: 'BW' },
      { name: 'Brazil', dialCode: '+55', code: 'BR' },
      { name: 'British Indian Ocean Territory', dialCode: '+246', code: 'IO' },
      { name: 'Bulgaria', dialCode: '+359', code: 'BG' },
      { name: 'Burkina Faso', dialCode: '+226', code: 'BF' },
      { name: 'Burundi', dialCode: '+257', code: 'BI' },
      { name: 'Cambodia', dialCode: '+855', code: 'KH' },
      { name: 'Cameroon', dialCode: '+237', code: 'CM' },
      { name: 'Canada', dialCode: '+1', code: 'CA' },
      { name: 'Cape Verde', dialCode: '+238', code: 'CV' },
      { name: 'Cayman Islands', dialCode: '+ 345', code: 'KY' },
      { name: 'Central African Republic', dialCode: '+236', code: 'CF' },
      { name: 'Chad', dialCode: '+235', code: 'TD' },
      { name: 'Chile', dialCode: '+56', code: 'CL' },
      { name: 'China', dialCode: '+86', code: 'CN' },
      { name: 'Christmas Island', dialCode: '+61', code: 'CX' },
      { name: 'Colombia', dialCode: '+57', code: 'CO' },
      { name: 'Comoros', dialCode: '+269', code: 'KM' },
      { name: 'Congo', dialCode: '+242', code: 'CG' },
      { name: 'Cook Islands', dialCode: '+682', code: 'CK' },
      { name: 'Costa Rica', dialCode: '+506', code: 'CR' },
      { name: 'Croatia', dialCode: '+385', code: 'HR' },
      { name: 'Cuba', dialCode: '+53', code: 'CU' },
      { name: 'Cyprus', dialCode: '+537', code: 'CY' },
      { name: 'Czech Republic', dialCode: '+420', code: 'CZ' },
      { name: 'Denmark', dialCode: '+45', code: 'DK' },
      { name: 'Djibouti', dialCode: '+253', code: 'DJ' },
      { name: 'Dominica', dialCode: '+1 767', code: 'DM' },
      { name: 'Dominican Republic', dialCode: '+1 849', code: 'DO' },
      { name: 'Ecuador', dialCode: '+593', code: 'EC' },
      { name: 'Egypt', dialCode: '+20', code: 'EG' },
      { name: 'El Salvador', dialCode: '+503', code: 'SV' },
      { name: 'Equatorial Guinea', dialCode: '+240', code: 'GQ' },
      { name: 'Eritrea', dialCode: '+291', code: 'ER' },
      { name: 'Estonia', dialCode: '+372', code: 'EE' },
      { name: 'Ethiopia', dialCode: '+251', code: 'ET' },
      { name: 'Faroe Islands', dialCode: '+298', code: 'FO' },
      { name: 'Fiji', dialCode: '+679', code: 'FJ' },
      { name: 'Finland', dialCode: '+358', code: 'FI' },
      { name: 'France', dialCode: '+33', code: 'FR' },
      { name: 'French Guiana', dialCode: '+594', code: 'GF' },
      { name: 'French Polynesia', dialCode: '+689', code: 'PF' },
      { name: 'Gabon', dialCode: '+241', code: 'GA' },
      { name: 'Gambia', dialCode: '+220', code: 'GM' },
      { name: 'Georgia', dialCode: '+995', code: 'GE' },
      { name: 'Germany', dialCode: '+49', code: 'DE' },
      { name: 'Ghana', dialCode: '+233', code: 'GH' },
      { name: 'Gibraltar', dialCode: '+350', code: 'GI' },
      { name: 'Greece', dialCode: '+30', code: 'GR' },
      { name: 'Greenland', dialCode: '+299', code: 'GL' },
      { name: 'Grenada', dialCode: '+1 473', code: 'GD' },
      { name: 'Guadeloupe', dialCode: '+590', code: 'GP' },
      { name: 'Guam', dialCode: '+1 671', code: 'GU' },
      { name: 'Guatemala', dialCode: '+502', code: 'GT' },
      { name: 'Guinea', dialCode: '+224', code: 'GN' },
      { name: 'Guinea-Bissau', dialCode: '+245', code: 'GW' },
      { name: 'Guyana', dialCode: '+595', code: 'GY' },
      { name: 'Haiti', dialCode: '+509', code: 'HT' },
      { name: 'Honduras', dialCode: '+504', code: 'HN' },
      { name: 'Hungary', dialCode: '+36', code: 'HU' },
      { name: 'Iceland', dialCode: '+354', code: 'IS' },
      { name: 'India', dialCode: '+91', code: 'IN' },
      { name: 'Indonesia', dialCode: '+62', code: 'ID' },
      { name: 'Iraq', dialCode: '+964', code: 'IQ' },
      { name: 'Ireland', dialCode: '+353', code: 'IE' },
      { name: 'Israel', dialCode: '+972', code: 'IL' },
      { name: 'Italy', dialCode: '+39', code: 'IT' },
      { name: 'Jamaica', dialCode: '+1 876', code: 'JM' },
      { name: 'Japan', dialCode: '+81', code: 'JP' },
      { name: 'Jordan', dialCode: '+962', code: 'JO' },
      { name: 'Kazakhstan', dialCode: '+7 7', code: 'KZ' },
      { name: 'Kenya', dialCode: '+254', code: 'KE' },
      { name: 'Kiribati', dialCode: '+686', code: 'KI' },
      { name: 'Kuwait', dialCode: '+965', code: 'KW' },
      { name: 'Kyrgyzstan', dialCode: '+996', code: 'KG' },
      { name: 'Latvia', dialCode: '+371', code: 'LV' },
      { name: 'Lebanon', dialCode: '+961', code: 'LB' },
      { name: 'Lesotho', dialCode: '+266', code: 'LS' },
      { name: 'Liberia', dialCode: '+231', code: 'LR' },
      { name: 'Liechtenstein', dialCode: '+423', code: 'LI' },
      { name: 'Lithuania', dialCode: '+370', code: 'LT' },
      { name: 'Luxembourg', dialCode: '+352', code: 'LU' },
      { name: 'Madagascar', dialCode: '+261', code: 'MG' },
      { name: 'Malawi', dialCode: '+265', code: 'MW' },
      { name: 'Malaysia', dialCode: '+60', code: 'MY' },
      { name: 'Maldives', dialCode: '+960', code: 'MV' },
      { name: 'Mali', dialCode: '+223', code: 'ML' },
      { name: 'Malta', dialCode: '+356', code: 'MT' },
      { name: 'Marshall Islands', dialCode: '+692', code: 'MH' },
      { name: 'Martinique', dialCode: '+596', code: 'MQ' },
      { name: 'Mauritania', dialCode: '+222', code: 'MR' },
      { name: 'Mauritius', dialCode: '+230', code: 'MU' },
      { name: 'Mayotte', dialCode: '+262', code: 'YT' },
      { name: 'Mexico', dialCode: '+52', code: 'MX' },
      { name: 'Monaco', dialCode: '+377', code: 'MC' },
      { name: 'Mongolia', dialCode: '+976', code: 'MN' },
      { name: 'Montenegro', dialCode: '+382', code: 'ME' },
      { name: 'Montserrat', dialCode: '+1664', code: 'MS' },
      { name: 'Morocco', dialCode: '+212', code: 'MA' },
      { name: 'Myanmar', dialCode: '+95', code: 'MM' },
      { name: 'Namibia', dialCode: '+264', code: 'NA' },
      { name: 'Nauru', dialCode: '+674', code: 'NR' },
      { name: 'Nepal', dialCode: '+977', code: 'NP' },
      { name: 'Netherlands', dialCode: '+31', code: 'NL' },
      { name: 'Netherlands Antilles', dialCode: '+599', code: 'AN' },
      { name: 'New Caledonia', dialCode: '+687', code: 'NC' },
      { name: 'New Zealand', dialCode: '+64', code: 'NZ' },
      { name: 'Nicaragua', dialCode: '+505', code: 'NI' },
      { name: 'Niger', dialCode: '+227', code: 'NE' },
      { name: 'Nigeria', dialCode: '+234', code: 'NG' },
      { name: 'Niue', dialCode: '+683', code: 'NU' },
      { name: 'Norfolk Island', dialCode: '+672', code: 'NF' },
      { name: 'Northern Mariana Islands', dialCode: '+1 670', code: 'MP' },
      { name: 'Norway', dialCode: '+47', code: 'NO' },
      { name: 'Oman', dialCode: '+968', code: 'OM' },
      { name: 'Pakistan', dialCode: '+92', code: 'PK' },
      { name: 'Palau', dialCode: '+680', code: 'PW' },
      { name: 'Panama', dialCode: '+507', code: 'PA' },
      { name: 'Papua New Guinea', dialCode: '+675', code: 'PG' },
      { name: 'Paraguay', dialCode: '+595', code: 'PY' },
      { name: 'Peru', dialCode: '+51', code: 'PE' },
      { name: 'Philippines', dialCode: '+63', code: 'PH' },
      { name: 'Poland', dialCode: '+48', code: 'PL' },
      { name: 'Portugal', dialCode: '+351', code: 'PT' },
      { name: 'Puerto Rico', dialCode: '+1 939', code: 'PR' },
      { name: 'Qatar', dialCode: '+974', code: 'QA' },
      { name: 'Romania', dialCode: '+40', code: 'RO' },
      { name: 'Rwanda', dialCode: '+250', code: 'RW' },
      { name: 'Samoa', dialCode: '+685', code: 'WS' },
      { name: 'San Marino', dialCode: '+378', code: 'SM' },
      { name: 'Saudi Arabia', dialCode: '+966', code: 'SA' },
      { name: 'Senegal', dialCode: '+221', code: 'SN' },
      { name: 'Serbia', dialCode: '+381', code: 'RS' },
      { name: 'Seychelles', dialCode: '+248', code: 'SC' },
      { name: 'Sierra Leone', dialCode: '+232', code: 'SL' },
      { name: 'Singapore', dialCode: '+65', code: 'SG' },
      { name: 'Slovakia', dialCode: '+421', code: 'SK' },
      { name: 'Slovenia', dialCode: '+386', code: 'SI' },
      { name: 'Solomon Islands', dialCode: '+677', code: 'SB' },
      { name: 'South Africa', dialCode: '+27', code: 'ZA' },
      {
        name: 'South Georgia and the South Sandwich Islands',
        dialCode: '+500',
        code: 'GS',
      },
      { name: 'Spain', dialCode: '+34', code: 'ES' },
      { name: 'Sri Lanka', dialCode: '+94', code: 'LK' },
      { name: 'Sudan', dialCode: '+249', code: 'SD' },
      { name: 'Suriname', dialCode: '+597', code: 'SR' },
      { name: 'Swaziland', dialCode: '+268', code: 'SZ' },
      { name: 'Sweden', dialCode: '+46', code: 'SE' },
      { name: 'Switzerland', dialCode: '+41', code: 'CH' },
      { name: 'Tajikistan', dialCode: '+992', code: 'TJ' },
      { name: 'Thailand', dialCode: '+66', code: 'TH' },
      { name: 'Togo', dialCode: '+228', code: 'TG' },
      { name: 'Tokelau', dialCode: '+690', code: 'TK' },
      { name: 'Tonga', dialCode: '+676', code: 'TO' },
      { name: 'Trinidad and Tobago', dialCode: '+1 868', code: 'TT' },
      { name: 'Tunisia', dialCode: '+216', code: 'TN' },
      { name: 'Turkey', dialCode: '+90', code: 'TR' },
      { name: 'Turkmenistan', dialCode: '+993', code: 'TM' },
      { name: 'Turks and Caicos Islands', dialCode: '+1 649', code: 'TC' },
      { name: 'Tuvalu', dialCode: '+688', code: 'TV' },
      { name: 'Uganda', dialCode: '+256', code: 'UG' },
      { name: 'Ukraine', dialCode: '+380', code: 'UA' },
      { name: 'United Arab Emirates', dialCode: '+971', code: 'AE' },
      { name: 'United Kingdom', dialCode: '+44', code: 'GB' },
      { name: 'United States', dialCode: '+1', code: 'US' },
      { name: 'Uruguay', dialCode: '+598', code: 'UY' },
      { name: 'Uzbekistan', dialCode: '+998', code: 'UZ' },
      { name: 'Vanuatu', dialCode: '+678', code: 'VU' },
      { name: 'Wallis and Futuna', dialCode: '+681', code: 'WF' },
      { name: 'Yemen', dialCode: '+967', code: 'YE' },
      { name: 'Zambia', dialCode: '+260', code: 'ZM' },
      { name: 'Zimbabwe', dialCode: '+263', code: 'ZW' },
      { name: 'land Islands', dialCode: '', code: 'AX' },
      { name: 'Antarctica', dialCode: undefined, code: 'AQ' },
      { name: 'Bolivia, Plurinational State of', dialCode: '+591', code: 'BO' },
      { name: 'Brunei Darussalam', dialCode: '+673', code: 'BN' },
      { name: 'Cocos (Keeling) Islands', dialCode: '+61', code: 'CC' },
      {
        name: 'Congo, The Democratic Republic of the',
        dialCode: '+243',
        code: 'CD',
      },
      { name: "Cote d'Ivoire", dialCode: '+225', code: 'CI' },
      { name: 'Falkland Islands (Malvinas)', dialCode: '+500', code: 'FK' },
      { name: 'Guernsey', dialCode: '+44', code: 'GG' },
      { name: 'Holy See (Vatican City State)', dialCode: '+379', code: 'VA' },
      { name: 'Hong Kong', dialCode: '+852', code: 'HK' },
      { name: 'Iran, Islamic Republic of', dialCode: '+98', code: 'IR' },
      { name: 'Isle of Man', dialCode: '+44', code: 'IM' },
      { name: 'Jersey', dialCode: '+44', code: 'JE' },
      {
        name: "Korea, Democratic People's Republic of",
        dialCode: '+850',
        code: 'KP',
      },
      { name: 'Korea, Republic of', dialCode: '+82', code: 'KR' },
      {
        name: "Lao People's Democratic Republic",
        dialCode: '+856',
        code: 'LA',
      },
      { name: 'Libyan Arab Jamahiriya', dialCode: '+218', code: 'LY' },
      { name: 'Macao', dialCode: '+853', code: 'MO' },
      {
        name: 'Macedonia, The Former Yugoslav Republic of',
        dialCode: '+389',
        code: 'MK',
      },
      { name: 'Micronesia, Federated States of', dialCode: '+691', code: 'FM' },
      { name: 'Moldova, Republic of', dialCode: '+373', code: 'MD' },
      { name: 'Mozambique', dialCode: '+258', code: 'MZ' },
      { name: 'Palestinian Territory, Occupied', dialCode: '+970', code: 'PS' },
      { name: 'Pitcairn', dialCode: '+872', code: 'PN' },
      { name: 'Réunion', dialCode: '+262', code: 'RE' },
      { name: 'Russia', dialCode: '+7', code: 'RU' },
      { name: 'Saint Barthélemy', dialCode: '+590', code: 'BL' },
      {
        name: 'Saint Helena, Ascension and Tristan Da Cunha',
        dialCode: '+290',
        code: 'SH',
      },
      { name: 'Saint Kitts and Nevis', dialCode: '+1 869', code: 'KN' },
      { name: 'Saint Lucia', dialCode: '+1 758', code: 'LC' },
      { name: 'Saint Martin', dialCode: '+590', code: 'MF' },
      { name: 'Saint Pierre and Miquelon', dialCode: '+508', code: 'PM' },
      {
        name: 'Saint Vincent and the Grenadines',
        dialCode: '+1 784',
        code: 'VC',
      },
      { name: 'Sao Tome and Principe', dialCode: '+239', code: 'ST' },
      { name: 'Somalia', dialCode: '+252', code: 'SO' },
      { name: 'Svalbard and Jan Mayen', dialCode: '+47', code: 'SJ' },
      { name: 'Syrian Arab Republic', dialCode: '+963', code: 'SY' },
      { name: 'Taiwan, Province of China', dialCode: '+886', code: 'TW' },
      { name: 'Tanzania, United Republic of', dialCode: '+255', code: 'TZ' },
      { name: 'Timor-Leste', dialCode: '+670', code: 'TL' },
      {
        name: 'Venezuela, Bolivarian Republic of',
        dialCode: '+58',
        code: 'VE',
      },
      { name: 'Viet Nam', dialCode: '+84', code: 'VN' },
      { name: 'Virgin Islands, British', dialCode: '+1 284', code: 'VG' },
      { name: 'Virgin Islands, U.S.', dialCode: '+1 340', code: 'VI' },
    ];
  }
}
