import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {  UserIdCreateComponent } from './useridpost.component';

import { UserIdService } from './service';

import { MediaModule } from '../media/media.module';
import { UtilsModule } from '../utils/utils.module';

const routes: Routes = [
  // {
  //   path: '',
  //   component: UseridComponent,
  //   data: {
  //     title: 'Quản lý UserId',
  //     urls: [{ title: 'Banner', url: '/userids' }, { title: 'Danh sách' }]
  //   }
  // },
  {
    path: 'create',
    component: UserIdCreateComponent,
    data: {
      title: 'Quản lý UserId',
      urls: [{ title: 'Banner', url: '/userids/create' }, { title: 'Tạo mới' }]
    }
  },
  // {
  //   path: 'update/:id',
  //   component: BrandUpdateComponent,
  //   data: {
  //     title: 'Quản lý UserId',
  //     urls: [{ title: 'Banner', url: '/userids' }, { title: 'Cập nhật' }]
  //   }
  // }
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
    // UseridComponent,
    UserIdCreateComponent,
    // BrandUpdateComponent
  ],
  providers: [
    UserIdService
  ],
  exports: [],
  entryComponents: [
  ]
})
export class UserIdpostModule { }
