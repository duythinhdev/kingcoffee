import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserCreateTitle, UserCreateTitleModel} from '../../model/user.create.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'user-update',
  templateUrl: './update.html'
})
export class UserUpdateComponent implements OnInit {
  userCreateTitleModel : UserCreateTitleModel;
  public info: any = {};
  public avatarUrl = '';
  public isSubmitted = false;
  public avatarOptions: any = {};
  public user: any = {};
  private userId: string;

  constructor(private router: Router, private userService: UserService, private toasty: ToastrService,
    private route: ActivatedRoute, private translate: TranslateService) { }

  ngOnInit() {
    this.userCreateTitleModel = UserCreateTitle[0];
    this.userId = this.route.snapshot.paramMap.get('id');
    this.avatarOptions = {
      url: window.appConfig.apiBaseUrl + '/users/' + this.userId + '/avatar',
      fileFieldName: 'avatar',
      onFinish: resp => this.avatarUrl = resp.data.url
    }

    this.userService.findOne(this.userId).then(resp => {
      this.user = resp.data;
      this.info = _.pick(resp.data, [
        'name', 'email', 'isActive', 'emailVerified', 'address', 'role', 'emailNotification', 'type', 'phoneNumber'
      ]);
      this.avatarUrl = resp.data.avatarUrl;
    });
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error('Lỗi hệ thống, vui lòng kiểm tra và thử lại!');
    }

    this.userService.update(this.userId, this.info).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
      this.router.navigate(['/users/list']);
    }).catch((err) => this.toasty.error(this.translate.instant(err.data.data.message || err.data.data.email)));
  }
}
