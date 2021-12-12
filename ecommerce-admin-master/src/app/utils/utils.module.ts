import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { PriceCurrencyPipe } from './pipes/price-currency.pipe';
import { NoImagePipe } from './pipes/no-image.pipe';
import { SafeHtmlPipe } from './pipes/safeHtml.pipe';

import { NewsletterService } from './services/newsletter.service';
import { CurrencyService } from './services/currency.service';

import { LocationHrefDirective } from './directives/location-href/location-href.directive';
import { OneDecimaDirective } from './directives/one-decimal/one-decimal.directive';
import { OrderStatusPipe } from './pipes/order.status.pipe';
import { TranslatePipe } from './pipes/translate.pipe';
import { PlusMinusButtonComponent } from './plus-minus-button/plus-minus-button.component';
import { ComonService } from './services/comon.service';
import { CommonService } from './services/common.service';
import { ItemSelectComponent } from './item-select/item-select.component';
import { PaymentGatewayNamePipe } from './pipes/paymentGatewayName.pipe';
import { EnumToArrayPipe } from './pipes/enumToArray.pipe';

@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    NgbModule,
  ],
  declarations: [
    PriceCurrencyPipe, NoImagePipe,
    LocationHrefDirective,
    OneDecimaDirective,
    SafeHtmlPipe,
    OrderStatusPipe,
    TranslatePipe,
    PaymentGatewayNamePipe,
    EnumToArrayPipe,
    PlusMinusButtonComponent,
    ItemSelectComponent,
  ],
  exports: [
    PriceCurrencyPipe,
    NoImagePipe, SafeHtmlPipe,
    LocationHrefDirective,
    OneDecimaDirective,
    OrderStatusPipe,
    TranslatePipe,
    PlusMinusButtonComponent,
    ItemSelectComponent,
    PaymentGatewayNamePipe,
    EnumToArrayPipe,
  ],
  providers: [
    NewsletterService,
    CurrencyService,
    CommonService,
    ComonService
  ],
  entryComponents: []
})
export class UtilsModule { }
