import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import {UserProfileHistoryTitleModel, UserProfileHistoryTitle} from '../../model/user.profile.history.title.model';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'user-history',
  templateUrl: './listinghistory.html'
})
export class UserHistoryComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public count: Number = 0;
  public items = [];
  public currentPage: Number = 1;
  public pageSize: Number = 10;
  // public username: '';
  // public action: '';
  public searchFields: any = {
    username: '',
    action:''
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  userProfileHistoryTitleModel: UserProfileHistoryTitleModel;
  constructor(private router: Router, private userService: UserService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.userProfileHistoryTitleModel = UserProfileHistoryTitle[0];
    this.searchFields.action= '';
    this.searchFields.username= '';
    this.query();
  }

  query() {
    let params = Object.assign({
      page: this.currentPage,
      take: this.pageSize,
      username: this.searchFields.username,
      action: this.searchFields.action
    });
    this.userService.searchHistory(params)
      .then((resp) => {
        this.count = resp.data.count;
        this.items = resp.data.admin_action_logs;
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
