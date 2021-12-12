import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NotFoundComponent } from './not-found.component';

import { MediaModule } from '../media/media.module';
import { UtilsModule } from '../utils/utils.module';

const routes: Routes = [
  {
    path: '',
    component: NotFoundComponent,
    data: {
      title: '404',
      urls: [{ title: '404', url: '/not-found' }, { title: 'Không tìm thấy' }]
    }
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
    NotFoundComponent,
  ],
  exports: [],
  entryComponents: [
  ]
})
export class NotFoundModule { }
