import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { LocalStorgeService } from './local-storge.service';
import { MsgService } from './msg-message.service';
import { Observable } from 'rxjs';
import { environment } from '../app/environments/environment';
import { isNil } from 'lodash';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  list_api = [
    `${environment.investUrl}/Account/UpdatePassword`,
    `${environment.investUrl}/Account/UpdateBankInfo`,
    `${environment.tniDSCUrl}/tpl/ListTPLs`,
    `${environment.tniDSCUrl}/tpl/CalculateFeeTPL`,
    `${environment.tniDSCUrl}/tpl/CalculateFeeTPL`,
    `${environment.tniDSCUrl}/Shipment/GetLadingScheduleApi`,
    // `${environment.investUrl}/Account/UpdateProfile`,
  ];

  dsc_key = environment.dsc_key;
  tni_apikey = environment.tni_apikey;

  constructor(
    private localStorgeService: LocalStorgeService,
    private alertService: MsgService
  ) { }
  intercept(
    // tslint:disable-next-line: no-any
    req: HttpRequest<any>,
    next: HttpHandler
  // tslint:disable-next-line: no-any
  ): Observable<HttpEvent<any>> {
    let token = '';
    let apikey = '';
    const find_url = this.list_api.find((x) => x === req.url);
    if (!isNil(find_url)) {
      token = this.localStorgeService.get('social_token');
      apikey = this.dsc_key;
    } else {
      token = this.localStorgeService.get('accessToken');
      apikey = this.tni_apikey;
    }

    if ((req.url === `${environment.investUrl}/Account/ChangeRoleToWeHome`) ||
     (req.url === `${environment.investUrl}/Account/UpdateProfile`) ||
     (req.url === `${environment.investUrl}/Account/ListMemberReferralsF1`)) {
      token = this.localStorgeService.get('tokenIdentity');
    }

    let modReq;
    if (!isNil(token)) {
      const authHeader = 'Bearer ' + token;
      const updUrl = {
        url: req.url,
        headers: req.headers
          .set('Authorization', authHeader)
          .set('x-api-key', apikey),
      };
      //  = (req.headers.append("x-api-key",apikey));
      modReq = req.clone(updUrl);
    } else {
      const url = {
        url: req.url,
        headers: req.headers.set('x-api-key', apikey),
      };
      modReq = req.clone(url);
    }

    return next.handle(modReq).pipe(
      tap(
        // tslint:disable-next-line: no-any
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
          }
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              // this.localStorgeService.clear();
              // this.alertService.error("Hết phiên làm việc");
            } 
            // else {
            //   return this.alertService.error(
            //     'Lỗi bất ngờ, vui lòng thử lại sau'
            //   );
            // }
          }
        }
      )
    );
  }
}
