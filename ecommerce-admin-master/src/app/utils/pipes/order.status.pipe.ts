import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({name: 'orderStatus'})
export class OrderStatusPipe implements PipeTransform {

  constructor(private translate: TranslateService){}

  transform(value: string): string {
    const captitalize = value.replace(/^\w/, c => c.toUpperCase());
    return this.translate.instant(captitalize);
  }
}
