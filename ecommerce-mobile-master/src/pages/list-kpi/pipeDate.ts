import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changeDate',
})
export class ChangeDate implements PipeTransform {
  transform(value) {
    let newDate;
    const month = value.substring(0, 2);
    const year = value.substring(3);
    newDate = `${month}/${year}`;
    return newDate;
  }
}
