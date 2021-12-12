import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportRoutingModule } from './report.routing';

import { SaleComponent } from './components/sale/sale-report.component';
import { PayoutComponent } from './components/payout/payout-report.component';

import { ReportSaleService } from './report.service';
import { ShopService } from '../shop/services/shop.service';
import { RequestPayoutService } from '../request-payout/request-payout.service';
import { UtilsModule } from '../utils/utils.module';
import { NgbDateCustomParserFormatter } from './formatdate.service';
import { OrderService } from '../order/services/order.service';
import { ListSpinnerComponent } from './components/listspinner/list-spinner.component';
import { ListOrdersComponent } from './components/listOrders/list-orders.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //our custom module
    ReportRoutingModule,
    NgbModule,
    UtilsModule
  ],
  declarations: [
    SaleComponent,
    PayoutComponent,
    ListSpinnerComponent,
    ListOrdersComponent
  ],
  providers: [
    ReportSaleService,
    ShopService,
    RequestPayoutService,
    OrderService,
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter}
  ],
  exports: []
})
export class ReportModule { }
