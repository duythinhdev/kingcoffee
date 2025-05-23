import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PostService {

  public categories = [];
  constructor(private restangular: Restangular) { }

  create(data: any): Promise<any> {
    return this.restangular.all('posts').post(data).toPromise();
  }
  createNotification(data: any): Promise<any> {
    return this.restangular
      .one("/notification/insertNotification")
      .customPOST(data)
      .toPromise();
  }
  update(id, data: any): Promise<any> {
    return this.restangular.one('posts', id).customPUT(data).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('posts').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('posts', id).get().toPromise();
  }

  remove(id): Promise<any> {
    return this.restangular.one('posts', id).customDELETE().toPromise();
  }

  getCategories(params: any): Promise<any> {
    return this.restangular.one('posts', 'categories').get(params).toPromise();
  }
}
