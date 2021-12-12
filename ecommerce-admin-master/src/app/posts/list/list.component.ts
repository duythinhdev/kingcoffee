import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PostListTitle, PostListTitleModel } from '../../model/post.listing.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './list.html'
})
export class PostListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  postListTitleModel: PostListTitleModel;
  public items = [];
  public page = 1;
  public total = 0;

  public searchActiveList: string[] = ["Tất cả", "Kích hoạt", "Chưa kích hoạt"];
  public searchActive: string = this.searchActiveList[0];
  public searchActiveVal: number = 0;
  public searchText: string = '';

  public isPage = false;
  public categories = [];
  public categoriesParam: object = {
    page: 1,
    take: 10000
  }
  public selectedCategory = '';

  constructor(private router: Router, private postService: PostService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.postListTitleModel = PostListTitle[0];
    if(this.router.url.includes('page')) {
      this.isPage = true;
    }
    if(this.postService.categories.length > 0) {
      this.categories = this.postService.categories;
    } else {
      this.postService.getCategories(this.categoriesParam).then(resp => {
        this.categories = resp.data.items;
        this.postService.categories = resp.data.items;
      })
    }
    this.query();
  }

  query() {
    let params: object = {
      page: this.page,
      title: this.searchText
    }
    if(this.isPage) {
      params['type'] = 'page';
    } else {
      params['type'] = 'post';
    }
    if(this.searchActiveVal !== 0) {
      params['isActive'] = (this.searchActiveVal === 1) ? true : false;
    }
    if(this.selectedCategory !== '') {
      params['categoryIds'] = this.selectedCategory;
    }
    this.postService.search(params)
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  remove(item: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.postService.remove(item._id)
        .then(() => {
          this.query();
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }

  onSearch() {
    console.log('search');
  }

  sortActive(val: number) {
    this.searchActive = this.searchActiveList[val];
    this.searchActiveVal = val;
    this.page = 1;
    this.query();
  }
}
