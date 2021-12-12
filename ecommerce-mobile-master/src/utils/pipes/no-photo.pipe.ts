import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash';

/*
 * show default photo if it is not provided
 */
@Pipe({
  name: 'checkPhoto',
})
export class NoPhotoPipe implements PipeTransform {
  transform(value: string) {
    if (!isNil(value)) {
      return value;
    }

    return '/assets/img/noImage.jpg';
  }
}
