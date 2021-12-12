import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({name: 'translate'})
export class TranslatePipe implements PipeTransform {

  constructor(private translate: TranslateService){}

  transform(value: string): string {
    return this.translate.instant(value);
  }
}
