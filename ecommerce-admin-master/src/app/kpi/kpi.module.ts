import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiRoutingModule } from './kpi.routing';
import { ConfigKpiComponent } from './components/config-kpi/config-kpi.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DpDatePickerModule } from 'ng2-date-picker';
import { KpiListComponent } from './components/kpi-list/kpi-list.component';
import { KpiService } from './kpi.service';
import { RequestPayoutService } from '../request-payout/request-payout.service';
import { UtilsModule } from '../utils/utils.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //our custom module
    KpiRoutingModule,
    UtilsModule,
    NgbModule,
    DpDatePickerModule
  ],
  providers: [
    NgbModule,
    UtilsModule,
    KpiService,
    RequestPayoutService
  ],
  declarations: [
    KpiListComponent,
    ConfigKpiComponent,
  ],
  exports: []
})
export class KpiModule { }
