import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class StaticPageService {
  constructor(private restangular: Restangular) {}

  list(params) {
    return this.restangular.one('posts').get(params).toPromise();
  }

  find(alias) {
    return this.restangular.one('posts', alias).get().toPromise();
  }
}
