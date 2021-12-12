import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigKpiComponent } from './components/config-kpi/config-kpi.component'
import { KpiListComponent } from './components/kpi-list/kpi-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: KpiListComponent,
    data: {
      title: 'Danh sách thanh toán KPIs',
      urls: [{ title: 'Danh sách thanh toán KPIs', url: '/kpi' }]
    }
  },
  {
    path: 'config-kpi',
    component: ConfigKpiComponent,
    data: {
      title: 'Cấu hình KPIs',
      urls: [{ title: 'Cấu hình KPIs', url: '/kpi' }]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KpiRoutingModule { }
