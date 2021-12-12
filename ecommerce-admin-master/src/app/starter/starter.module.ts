import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { StarterComponent } from './starter.component';
import { StatCardComponent } from '../stats/stats-card.component';
import { MediaModule } from '../media/media.module';

import { StatService } from '../shared/services';
import { RequestPayoutService } from '../request-payout/request-payout.service';

const routes: Routes = [{
  path: '',
  data: {
    title: 'Bảng điều khiển',
    urls: [{ title: 'Bảng điều khiển', url: '/starter' }, { title: 'Bảng điều khiển quản trị viên' }]
  },
  component: StarterComponent
}];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    MediaModule
  ],
  declarations: [
    StarterComponent,
    StatCardComponent
  ],
  providers: [
    StatService,
    RequestPayoutService
  ]
})
export class StarterModule { }
