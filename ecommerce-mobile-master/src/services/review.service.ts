import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Injectable()
export class ReviewService {
  constructor(private restangular: Restangular) {}

  create(data) {
    return this.restangular.all('reviews').post(data).toPromise();
  }

  search(params) {
    return this.restangular.one('reviews').get(params).toPromise();
  }

  checkReview(type, id) {
    return this.restangular
      .one('reviews')
      .one(type)
      .one(id)
      .one('current')
      .get()
      .toPromise();
  }

  canReview(data) {
    return this.restangular.all('reviews/canReview').post(data).toPromise();
  }

  update(id, data) {
    return this.restangular.one('reviews', id).customPUT(data).toPromise();
  }

  findOne(id) {
    return this.restangular.one('reviews', id).get().toPromise();
  }
}
