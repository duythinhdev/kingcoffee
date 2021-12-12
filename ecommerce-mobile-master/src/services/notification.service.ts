import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NotificationService {
  private numberNotifications = new Subject();
  numberNotifications$ = this.numberNotifications.asObservable();
  constructor(private restangular: Restangular) {}

  getListNotification(params) {
    return this.restangular.one('notification','getListNotification').get(params).asObservable();
  }
  readNotification(params) {
    this.numberNotifications.next();
    return this.restangular.one('notification','readNotification').get(params).toPromise();
  }
  readNewsNotification(params) {
    this.numberNotifications.next();
    return this.restangular.one('notification','readNewsNotification').get(params).toPromise();
  }
  countUnReadNotification() {
    return this.restangular.one('notification','countUnReadNotification').get().toPromise();
  }
}
