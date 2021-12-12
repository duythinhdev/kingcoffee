import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShopListingComponent, ShopUpdateComponent, ShopCreateComponent } from './component';

const routes: Routes = [
  {
    path: '',
    component: ShopListingComponent,
    data: {
      title: 'Quản lý cửa hàng',
      urls: [{ title: 'Cửa hàng',url: '/shops/list' }, { title: 'Danh sách' }]
    }
  },
  {
    path: 'update/:id', component: ShopUpdateComponent,
    data: {
      title: 'Quản lý cửa hàng',
      urls: [{ title: 'Cửa hàng',url: '/shops/update' }, { title: 'Cập nhật' }]
    }
  },
  {
    path: 'create', component: ShopCreateComponent,
    data: {
      title: 'Quản lý cửa hàng',
      urls: [{ title: 'Cửa hàng',url: '/shops/create' }, { title: 'Tạo' }]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
