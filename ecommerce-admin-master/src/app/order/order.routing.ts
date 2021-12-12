import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from './components/view/view.component';
import { ListingComponent } from './components/listing/listing.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListingComponent,
    data: {
      title: 'Quản lý đơn hàng',
      urls: [{ title: 'Đơn hàng', url: '/order' }]
    }
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    data: {
      title: 'Quản lý đơn hàng',
      urls: [{ title: 'Đơn hàng', url: '/order' }, { title: 'Chi tiết', url: ' / orders / view /: id' }]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
