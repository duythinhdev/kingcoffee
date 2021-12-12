import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SeoService {
  private seoChanged = new Subject();
  seoChanged$ = this.seoChanged.asObservable();

  update(title: string, meta) {
    this.seoChanged.next({
      title,
      meta,
    });
  }
}
