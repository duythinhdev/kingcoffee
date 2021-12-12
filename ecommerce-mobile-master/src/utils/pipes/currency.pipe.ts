import { Pipe, PipeTransform } from '@angular/core';
import { SystemService } from '../../services';
import * as Currency from 'format-currency';
/*
 * format price with user currency
 */
@Pipe({
  name: 'currency',
})
export class CurrencyPipe implements PipeTransform {
  constructor(private systemService: SystemService) {}

  transform(value: number) {
    if (isNaN(value)) {
      return Promise.resolve('N/A');
    }
    return this.systemService.configs().then((resp) => {
      if (resp.customerCurrency === 'VND') {
        const opts = {
          format: '%v%s',
          code: resp.customerCurrency,
          symbol: resp.customerCurrencySymbol,
        };
        const formatCurrency = Currency(value, opts);
        return formatCurrency.replace('.00', '');
      } else {
        const opts = {
          format: '%s%v',
          code: resp.customerCurrency,
          symbol: resp.customerCurrencySymbol,
        };
        return Currency(value, opts);
      }
    });
  }
}
