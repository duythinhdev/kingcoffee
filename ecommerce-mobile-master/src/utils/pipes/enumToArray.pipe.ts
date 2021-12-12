import { Pipe, PipeTransform } from '@angular/core';

/*
 * show default photo if it is not provided
 */
@Pipe({
  name: 'enumToArray',
})
export class EnumToArrayPipe implements PipeTransform {
  transform(data: object, limit) {
    const keys = Object.keys(data);
    return keys.slice(limit ? keys.length / 2 + limit : keys.length / 2);
  }
}
