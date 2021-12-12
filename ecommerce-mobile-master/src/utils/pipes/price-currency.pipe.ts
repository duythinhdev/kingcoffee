import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../../services';

/*
 * format price with user currency
 */
@Pipe({
  name: 'priceCurrency',
})
export class PriceCurrencyPipe implements PipeTransform {
  constructor(private service: CurrencyService) {}

  transform(price, currency = 'USD') {
    const symbol = this.service.getSymbol(currency);
    const p = (parseFloat(price) || 0)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return `${symbol} ${p}`;
  }
}
