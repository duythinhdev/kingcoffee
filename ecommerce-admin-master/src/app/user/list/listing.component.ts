import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserListTitle, UserListTitleModel } from '../../model/user.list.title.model';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'user-listing',
  templateUrl: './listing.html'
})
export class UserListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public count: Number = 0;
  public items = [];
  public currentPage: Number = 1;
  public pageSize: Number = 10;
  public searchFields: any = {
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  userListTitleModel : UserListTitleModel;
  constructor(private router: Router, private userService: UserService, private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.userListTitleModel = UserListTitle[0];
    this.query();
  }

  query() {
    let params = Object.assign({
      page: this.currentPage,
      take: this.pageSize,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`
    }, this.searchFields);
    this.userService.search(params)
      .then((resp) => {
        this.count = resp.data.count;
        this.items = resp.data.items;
        this.searchFields.isShop = '';
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  onSearch() {
    this.currentPage = 1;
    this.query();
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  remove(item: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.userService.delete(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch(() => this.toasty.error(this.translate.instant(this.errorTitleModel.deleteunsucess)));
    }
  }
}
