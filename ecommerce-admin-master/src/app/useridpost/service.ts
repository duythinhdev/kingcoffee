import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import * as _ from 'lodash';

@Injectable()
export class UserIdService {
  private allowFields = [
    'title', 'content', 'mediaId', 'link', 'position','isActive'
  ];
  constructor(private restangular: Restangular) { }

  create(data: any): Promise<any> {
    console.log("123123",data);
    return this.restangular.all('/notification/insertNotification').post(data).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('banners').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('banners', id).get().toPromise();
  }

  update(id,data): Promise<any> {
    return this.restangular.one('banners', id).customPUT(_.pick(data, this.allowFields)).toPromise();
  }

  remove(id): Promise<any> {
    return this.restangular.one('banners', id).customDELETE().toPromise();
  }
}
