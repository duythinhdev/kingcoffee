import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserProfileTitle, UserProfileTitleModel } from '../../model/user.profile.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'profile-update',
  templateUrl: './form.html'
})
export class ProfileUpdateComponent implements OnInit {
  public info: any = {};
  public avatarUrl = '';
  public isSubmitted = false;
  public avatarOptions: any = {};
  public user: any = {};
  private userId: string;
  userProfileTitleModel: UserProfileTitleModel;
  constructor(private router: Router, private userService: UserService, private toasty: ToastrService,
    private route: ActivatedRoute, private translate: TranslateService){ }

  ngOnInit() {
    this.userProfileTitleModel = UserProfileTitle[0];
    this.avatarOptions = {
      url: window.appConfig.apiBaseUrl + '/users/avatar',
      fileFieldName: 'avatar',
      onFinish: (resp) => {
        this.avatarUrl = resp.data.url;
        this.user.avatarUrl = resp.data.url;
      }
    }

    this.userService.me().then(resp => {
      this.user = resp.data;
      this.info = _.pick(resp.data, [
        'name', 'email', 'address', 'phoneNumber'
      ]);
      this.avatarUrl = resp.data.avatarUrl;
    });
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error('Lỗi hệ thống, vui lòng kiểm tra lại !');
    }

    this.userService.update(this.userId, this.info).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
    }).catch ((err) => this.toasty.error(this.translate.instant(err.data.data.message || err.data.data.email)));
  }
}
