import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UtilsModule } from '../utils/utils.module';

import { PostListingComponent } from './list/list.component';
import { PostCreateComponent } from './details/create.component';
import { PostUpdateComponent } from './details/update.component';

import { PostService } from './services/service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MediaModule } from '../media/media.module';

const routes: Routes = [
  {
    path: 'posts-list',
    component: PostListingComponent,
    data: {
      title: 'Quản lý bài viết',
      urls: [{ title: 'Bài viết', url: '/cms' }, { title: 'Danh sách bài viết' }]
    }
  },
  {
    path: 'pages-list',
    component: PostListingComponent,
    data: {
      title: 'Quản lý trang',
      urls: [{ title: 'Trang', url: '/cms' }, { title: 'Danh sách trang' }]
    }
  },
  {
    path: 'create',
    component: PostCreateComponent,
    data: {
      title: 'Quản lý bài viết',
      urls: [{ title: 'Bài viết', url: '/cms' }, { title: 'Tạo bài viết' }]
    }
  },
  {
    path: 'update/:id',
    component: PostUpdateComponent,
    data: {
      title: 'Quản lý bài viết & trang',
      urls: [{ title: 'Bài viết', url: '/cms' }, { title: 'Cập nhật' }]
    }
  }
];

@NgModule({
  imports: [
    UtilsModule,
    CommonModule,
    FormsModule,
    NgbModule,
    MediaModule,
    RouterModule.forChild(routes),
    CKEditorModule
  ],
  declarations: [
    PostListingComponent,
    PostCreateComponent,
    PostUpdateComponent
  ],
  providers: [
    PostService
  ],
  exports: [],
  entryComponents: [
  ]
})
export class PostModule { }
