import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigsComponent } from './list/configs.component';

const routes: Routes = [
  { 
    path: '', 
    component: ConfigsComponent,
    data: {
      title: 'Cấu hình hệ thống',
      urls: [{ title: 'Cấu hình hệ thống', url: '/configs' }, { title: 'Cập nhật' }]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
