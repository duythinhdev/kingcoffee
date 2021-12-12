import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaleComponent } from './components/sale/sale-report.component';
import { PayoutComponent } from './components/payout/payout-report.component';
import { ListSpinnerComponent } from './components/listspinner/list-spinner.component';
import  { ListOrdersComponent  } from './components/listOrders/list-orders.component';
const routes: Routes = [
  {
    path: 'sales',
    component: SaleComponent,
    data: {
      title: 'Quản lý Sale',
      urls: [{ title: 'Báo cáo', url: '/sales' }, { title: 'Bán hàng' }]
    }
  },
  {
    path: 'payout',
    component: PayoutComponent,
    data: {
      title: 'Quản lý thanh toán dành cho người bán',
      urls: [{ title: 'Báo cáo', url: '/sales' }, { title: 'Thanh toán' }]
    }
  },
  // {
  //   path: 'spinner',
  //   component: ListSpinnerComponent,
  //   data: {
  //     title: 'Quản lý kỳ quay thưởng',
  //     urls: [{ title: 'Báo cáo', url: '/sales' }, { title: 'Bán hàng' }]
  //   }
  // },
  {
    path: 'couponcode',
    component: ListOrdersComponent,
    data: {
      title: 'Quản lý kỳ quay thưởng',
      urls: [{ title: 'Báo cáo', url: '/sales' }, { title: 'Bán hàng' }]
    }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
