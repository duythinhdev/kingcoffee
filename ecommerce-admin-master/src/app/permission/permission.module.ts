import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PermissionComponent } from './permission.component';

import { MediaModule } from '../media/media.module';
import { UtilsModule } from '../utils/utils.module';

const routes: Routes = [
  {
    path: '',
    component: PermissionComponent,
    // data: {
    //   title: 'Quản lý banner',
    //   urls: [{ title: 'Banner', url: '/banners' }, { title: 'Danh sách' }]
    // }
  },
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
    PermissionComponent
  ],
  exports: [],
  entryComponents: [
  ]
})
export class PermissionModule { }
