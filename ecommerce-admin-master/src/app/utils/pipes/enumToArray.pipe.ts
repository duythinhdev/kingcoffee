import { Pipe, PipeTransform } from '@angular/core';

/*
* show default photo if it is not provided
*/
@Pipe({
  name: 'enumToArray'
})
export class EnumToArrayPipe implements PipeTransform {
  transform(data: Object) {
    return Object.keys(data);
  }
}
