import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class PromotionService {
  constructor(private restangular: Restangular, private http: HttpClient) { }

  find(params: any): Promise<any> {
    return this.restangular.one('promotionTypes').get(params).toPromise();
  }

  findPromotion(params: any): Promise<any> {
    return this.restangular.one('promotions').get(params).toPromise();
  }

  findOne(id: any): Promise<any> {
    return this.restangular.one('promotionTypes', id).get().toPromise();
  }

  findOnePromotion(id: any): Promise<any> {
    return this.restangular.one('promotions', id).get().toPromise();
  }

  create(data): Promise<any> {
    return this.restangular.all('promotionTypes').post(data).toPromise();
  }

  stop(data): Promise<any> {
    return this.restangular.one('promotionTypes/stop',data).customPUT().toPromise();
  }

  stopPromotion(data): Promise<any> {
    return this.restangular.one('promotions/stop',data).customPUT().toPromise();
  }

  createPromotion(data): Promise<any> {
    return this.restangular.all('promotions').post(data).toPromise();
  }

  update(data: any): Promise<any> {
    return this.restangular.one('promotionTypes', data._id).customPUT(_.pick(data,["code","name","description","startDate","endDate","isActive","isDisplayHomePage"])).toPromise();
  }

  updatePromotion(id,data: any): Promise<any> {
    return this.restangular.one('promotions', id).customPUT(data).toPromise();
  }

  delete(id): Promise<any> {
    return this.restangular.one('promotionTypes', id).customDELETE().toPromise();
  }
  deletePromotion(id): Promise<any> {
    return this.restangular.one('promotions', id).customDELETE().toPromise();
  }
  getPromotionTypes(params: any): Promise<any> {
    return this.restangular.one('promotionTypes').get(params).toPromise();
  }
  getApplyArea(): Promise<any> {
    return this.restangular.one('address/administrative-devisions').get().toPromise();
  }
  getListCustomer(params: any): Promise<any>  {
    return this.http.post(`${window.appConfig.investUrl}/Account/GetListMember`,params).toPromise();
  }

  tree(data:any): Promise<any> {
    return this.restangular.one('products/categories', 'tree').get(data).toPromise();
  }

  prettyPrint(tree: any, char: string = '', results: any = []) {
    tree.forEach(item => {
      item.name = `${char}${item.name}`;
      results.push(item);
      if (item.children && item.children.length) {
        this.prettyPrint(item.children, `${char}__`, results);
      }
    });

    return results;
  }

  search(params: any): Promise<any> {
    return this.restangular.one('products', 'search').get(params).toPromise();
  }
  

}
