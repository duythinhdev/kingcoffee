import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserCreateComponent } from './create/create.component';
import { UserListingComponent } from './list/listing.component';
import { UserUpdateComponent } from './update/update.component';
import { ProfileUpdateComponent } from './profile/profile-update.component';
import { LogoutComponent } from './profile/logout.component';
import { UserHistoryComponent } from './history/userhistory.component';
const routes: Routes = [
  {
    path: 'profile/update', component: ProfileUpdateComponent,
    data: {
      title: 'Cập nhật hồ sơ',
      urls: [{ title: 'Cập nhật hồ sơ' }]
    }
  },
  { path: 'create', component: UserCreateComponent },
  { path: 'profile/logout', component: LogoutComponent },
  {
    path: 'list',
    component: UserListingComponent,
    data: {
      title: 'Quản lý người dùng',
      urls: [{ title: 'Người dùng', url: '/users/list' }, { title: 'Danh sách' }]
    }
  },
  {
    path: 'update/:id', component: UserUpdateComponent,
    data: {
      title: 'Quản lý người dùng',
      urls: [{ title: 'Người dùng', url: '/users/list' }, { title: 'Cập nhật' }]
    }
  },
  {
    path: 'profile/history', component: UserHistoryComponent,
    data: {
      title: 'Lịch sử hoạt động',
      urls: [{ title: 'Tài khoản của tôi' }, { title: 'Lịch sử hoạt động' }]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
