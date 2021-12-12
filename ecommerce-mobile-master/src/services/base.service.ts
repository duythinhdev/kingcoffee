import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../app/environments/environment';
import { ResponseModel } from '../models/response.model';
import { MsgService } from './msg-message.service';

export class BaseService {
  constructor(
    protected httpClient: HttpClient,
    protected alertService: MsgService,
    protected apiUrl: string,
    protected apiName: string
  ) {}

  async get(method: string): Promise<ResponseModel> {
    return (await this.httpClient
      .get(`${this.apiUrl}/${this.apiName}/${method}`, {
        headers: { platform: `${environment.platform}` },
      })
      .toPromise()) as ResponseModel;
  }

  async getWithParams(
    method: string,
    params: HttpParams
  ): Promise<ResponseModel> {
    return (await this.httpClient
      .get(`${this.apiUrl}/${this.apiName}/${method}`, {
        params,
        headers: { platform: `${environment.platform}` },
      })
      .toPromise()) as ResponseModel;
  }

  async post(method: string, model): Promise<ResponseModel> {
    return (await this.httpClient
      .post(`${this.apiUrl}/${this.apiName}/${method}`, model, {
        headers: { platform: `${environment.platform}` },
      })
      .toPromise()) as ResponseModel;
  }

  async Post(apiUrl: string, method: string, model): Promise<ResponseModel> {
    return (await this.httpClient
      .post(`${this.apiUrl}/${this.apiName}/${method}`, model, {
        headers: { platform: `${environment.platform}` },
      })
      .toPromise()) as ResponseModel;
  }

  async postBaseApi(method: string, model): Promise<ResponseModel> {
    return (await this.httpClient
      .post(`${environment.apiBaseUrl}/users/updateBankInfo`, model, {
        headers: { platform: `${environment.platform}` },
      })
      .toPromise()) as ResponseModel;
  }

  async isValidResponse(res: ResponseModel) {
    if (res.isSuccess) {
      return res;
    } else {
      await this.alertService.error(
        res.message || 'Có lỗi xảy ra, vui lòng thử lại sau'
      );
      return false;
    }
  }
}
