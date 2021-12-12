import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { isNil } from 'lodash';

@Pipe({
  name: 'filter',
})
@Injectable()
export class FilterPipe implements PipeTransform {
  transform(items: { name: string }[], value: string): { name: string }[] {
    if (isNil(items)) {
      return [];
    }
    if (isNil(value)) {
      return items;
    }

    return items.filter((singleItem) =>
      singleItem.name.toLowerCase().includes(value.toLowerCase())
    );
  }
}
