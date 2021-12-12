import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PromotionDetailComponent } from './components/promotion-detail/promotion-detail.component';
import { PromotionUpdateComponent } from './components/promotion-detail/promotion-update.component';
import { PromotionListingComponent } from './components/promotion-listing/promotion-listing.component';
import { ProgramListingComponent } from './components/promotion-type-list/program-listing.component';
import { ProgramUpdateComponent } from './components/promotion-type-detail/program-update.component';
import { ProgramCreateComponent } from './components/promotion-type-detail/program-create.component';

const routes: Routes = [
  {
    path: 'list',
    component: PromotionListingComponent,
    data: {
      title: 'Danh sách khuyến mãi',
      urls: [{ title: 'Chương trình khuyến mãi', url: '/promotion' }]
    }
  },
  {
    path: 'create',
    component: PromotionDetailComponent,
    data: {
      title: 'Tạo mới khuyến mãi',
      urls: [{ title: 'Chương trình khuyến mãi', url: '/promotion' }]
    }
  },
  {
    path: 'update/:id',
    component: PromotionUpdateComponent,
    data: {
      title: 'Chỉnh sửa khuyến mãi',
      urls: [{ title: 'Chương trình khuyến mãi', url: '/promotion' }]
    }
  },
  {
    path: 'program_list',
    component: ProgramListingComponent,
    data: {
      title: 'Danh sách loại chương trình',
      urls: [{ title: 'Danh sách loại chương trình', url: '/promotion' }]
    }
  },
  {
    path: 'program_create',
    component: ProgramCreateComponent,
    data: {
      title: 'Tạo loại chương trình',
      urls: [{ title: 'Tạo loại chương trình', url: '/promotion' }]
    }
  },
  {
    path: 'program_update/:id',
    component: ProgramUpdateComponent,
    data: {
      title: 'Cập nhật chương trình',
      urls: [{ title: 'Cập nhật chương trình', url: '/promotion' }]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionRoutingModule { }
