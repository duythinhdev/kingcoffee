import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HomeComponent } from './home.component';

import { MediaModule } from '../media/media.module';
import { UtilsModule } from '../utils/utils.module';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Trang chủ',
      urls: [{ title: 'Home', url: '/home' }, { title: 'Trang chủ' }]
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
    HomeComponent,
  ],
  exports: [],
  entryComponents: [
  ]
})
export class HomeModule { }
