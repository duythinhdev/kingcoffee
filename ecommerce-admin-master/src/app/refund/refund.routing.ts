import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListingComponent } from './components/listing/listing.component';

const routes: Routes = [
  {
    path: '',
    component: ListingComponent,
    data: {
      title: 'Quản lý hoàn trả',
      urls: [{ title: 'Hoàn trả', url: '/refunds' }, { title: 'Danh sách' }]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefundRoutingModule { }
