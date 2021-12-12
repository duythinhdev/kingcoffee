import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SelectModel } from '../models/select.model';
import { MsgService } from './msg-message.service';
import { isNil } from 'lodash';

export class GeneralService extends BaseService {
  constructor(
    protected http: HttpClient,
    protected alertService: MsgService,
    protected apiUrl: string,
    protected apiName: string
  ) {
    super(http, alertService, apiUrl, apiName);
  }

  async getAll(cols?: string) {
    if (!isNil(cols)) {
      cols = '';
    }

    const res = await this.get(`GetAll?cols=${cols}`);
    if (!this.isValidResponse(res)) {
      return;
    }
    return res.data;
  }

  async getPaging(model) {
    const res = await this.post('GetPaging', model);
    if (!this.isValidResponse(res)) {
      return;
    }
    return res.data;
  }

  async getAllSelectModel() {
    const data = await this.getAll();

    const selectModel: SelectModel[] = [
      { value: undefined, label: 'Tất cả', data: undefined },
    ];

    data.forEach((item) => {
      selectModel.push({ value: item.id, label: item.name, data: item });
    });

    return selectModel;
  }

  async getAllSelectModelWithoutSelectAll() {
    const data = await this.getAll();

    const selectModel: SelectModel[] = [];

    data.forEach((item) => {
      selectModel.push({ value: item.id, label: item.name, data: item });
    });

    return selectModel;
  }

  async getByID(id, cols = '') {
    let params = new HttpParams();
    params = params.append('id', id);
    params = params.append('cols', cols);

    const res = await this.getWithParams('Get', params);
    if (!this.isValidResponse(res)) {
      return;
    }
    return res.data;
  }

  async create(model) {
    const res = await this.post('Create', model);
    if (!this.isValidResponse(res)) {
      return;
    }
    return res.data;
  }

  async update(model) {
    const res = await this.post('Update', model);
    if (!this.isValidResponse(res)) {
      return;
    }
    return res.data;
  }

  async delete(model) {
    const res = await this.post('Delete', model);
    if (!this.isValidResponse(res)) {
      return;
    }
    return res.data;
  }
}
