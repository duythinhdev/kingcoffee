import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash';

/*
 * show default cover photo if it is not provided
 */
@Pipe({
  name: 'shopLogo',
})
export class ShopLogoPipe implements PipeTransform {
  transform(value: string) {
    if (!isNil(value)) {
      return value;
    }

    return '/assets/img/shop-logo-default.png';
  }
}
