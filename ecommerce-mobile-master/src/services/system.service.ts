import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { LocalStorgeService } from './local-storge.service';

@Injectable()
export class SystemService {
  appConfig;

  private _getConfig;
  constructor(
    private restangular: Restangular,
    private localStorage: LocalStorgeService
  ) {}

  configs() {
    this._getConfig = this.restangular
      .one('system/configs/public')
      .get()
      .toPromise()
      .then(async (resp) => {
        this.appConfig = resp.data;
        // save config to appData (global variable)
        window.appData = resp.data;
        // load user lang here
        const userLang =
          localStorage.getItem('userLang') ||
          resp.data.i18n.defaultLanguage ||
          'en';
        this.appConfig.userLang = userLang;

        return this.appConfig;
      });
    return this._getConfig;
  }

  setUserLang(lang: string) {
    localStorage.setItem('userLang', lang);
  }
}
