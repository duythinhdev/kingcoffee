import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductCategoriesComponent, ProductCategoryCreateComponent, ProductCategoryUpdateComponent } from './category/category.component';
import { OptionsComponent, OptionCreateComponent, OptionUpdateComponent } from './options/options.component';
import { ProductListingComponent } from './product/listing.component';
import { ProductUpdateComponent } from './product/update.component';
import { ProductCreateComponent } from './product/create.component';
import { ReviewsComponent } from './reviews/listing.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListingComponent,
    data: {
      title: 'Danh sách sản phẩm',
      urls: [{ title: 'Sản phẩm', url: '/products' }, { title: 'Quản lý sản phẩm' }]
    }
  },
  {
    path: 'create',
    component: ProductCreateComponent,
    data: {
      title: 'Tạo sản phẩm mới',
      urls: [{ title: 'Sản phẩm', url: '/products' }, { title: 'Tạo mới' }]
    }
  },
  {
    path: 'update/:id',
    component: ProductUpdateComponent,
    data: {
      title: 'Cập nhật sản phẩm',
      urls: [{ title: 'Sản phẩm', url: '/products' }, { title: 'Cập nhật' }]
    }
  },
  {
    path: 'categories',
    component: ProductCategoriesComponent,
    data: {
      title: 'Quản lý danh mục sản phẩm',
      urls: [{ title: 'Sản phẩm', url: '/products' }, { title: 'Danh mục', url: '/products/categories' }, { title: 'Quản lý danh mục' }]
    }
  },
  {
    path: 'categories/create',
    component: ProductCategoryCreateComponent,
    data: {
      title: 'Quản lý danh mục sản phẩm',
      urls: [{ title: 'Sản phẩm', url: '/products' }, { title: 'Danh mục', url: '/products/categories' }, { title: 'Tạo mới' }]
    }
  },
  {
    path: 'categories/update/:id',
    component: ProductCategoryUpdateComponent,
    data: {
      title: 'Quản lý danh mục sản phẩm',
      urls: [{ title: 'Sản phẩm', url: '/products' }, { title: 'Danh mục', url: '/products/categories' }, { title: 'Cập nhật' }]
    }
  },
  {
    path: 'options',
    component: OptionsComponent,
    data: {
      title: 'Quản lý tùy chọn',
      urls: [{ title: 'Tùy chọn', url: '/products/options' }, { title: 'Quản lý tùy chọn' }]
    }
  },
  {
    path: 'options/create',
    component: OptionCreateComponent,
    data: {
      title: 'Quản lý tùy chọn',
      urls: [{ title: 'Tùy chọn', url: '/products/options' }, { title: 'Tạo mới' }]
    }
  },
  {
    path: 'options/update/:id',
    component: OptionUpdateComponent,
    data: {
      title: 'Quản lý tùy chọn',
      urls: [{ title: 'Tùy chọn', url: '/products/options' }, { title: 'Cập nhật' }]
    }
  },
  {
    path: 'reviews',
    component: ReviewsComponent,
    data: {
      title: 'Quản lý nhận xét',
      urls: [{ title: 'Nhận xét', url: '/reviews' }, { title: 'Quản lý nhận xét' }]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
