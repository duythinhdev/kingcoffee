import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash';

/*
 * show default cover photo if it is not provided
 */
@Pipe({
  name: 'shopBanner',
})
export class ShopBannerPipe implements PipeTransform {
  transform(value: string) {
    if (!isNil(value)) {
      return value;
    }

    return '/assets/img/shop-cover.jpg';
  }
}
