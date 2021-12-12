import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

/*
 * format price with user currency
*/
@Pipe({
  name: 'priceCurrency'
})
export class PriceCurrencyPipe implements PipeTransform {
  constructor(private service: CurrencyService) { }

  transform(price: any, currency = 'VND'): any {
    const symbol = this.service.getSymbol(currency);
    const p = (parseFloat(price) || 0).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return `${p} ${symbol}`;
  }
}
