import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BannersComponent, BrandCreateComponent, BrandUpdateComponent } from './banners.component';

import { BannerService } from './service';

import { MediaModule } from '../media/media.module';
import { UtilsModule } from '../utils/utils.module';

const routes: Routes = [
  {
    path: '',
    component: BannersComponent,
    data: {
      title: 'Quản lý banner',
      urls: [{ title: 'Banner', url: '/banner' }, { title: 'Danh sách' }]
    }
  },
  {
    path: 'create',
    component: BrandCreateComponent,
    data: {
      title: 'Quản lý banner',
      urls: [{ title: 'Banner', url: '/banner' }, { title: 'Tạo mới' }]
    }
  },
  {
    path: 'update/:id',
    component: BrandUpdateComponent,
    data: {
      title: 'Quản lý banner',
      urls: [{ title: 'Banner', url: '/banner' }, { title: 'Cập nhật' }]
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    MediaModule,
    UtilsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    BannersComponent,
    BrandCreateComponent,
    BrandUpdateComponent
  ],
  providers: [
    BannerService
  ],
  exports: [],
  entryComponents: [
  ]
})
export class BannerModule { }
