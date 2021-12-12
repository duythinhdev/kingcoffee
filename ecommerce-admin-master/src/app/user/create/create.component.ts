import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserCreateTitle, UserCreateTitleModel} from '../../model/user.create.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'user-create',
  templateUrl: './create.html'
})
export class UserCreateComponent implements OnInit {
  public info: any = {
    type: 'user',
    username: '',
    password: '',
    name: '',
    email: '',
    address: '',
    role: 'user',
    emailVerified: true,
    isActive: true
  };
  public isSubmitted: any = false;
  userCreateTitleModel : UserCreateTitleModel;
  constructor(private router: Router, private userService: UserService,
    private toasty: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
     this.userCreateTitleModel = UserCreateTitle[0];
  }
  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error('Lỗi hệ thống, vui lòng kiểm tra và thử lại!');
    }

    this.userService.create(frm.value)
      .then((resp) => {
        this.toasty.success(this.translate.instant('Created successfully!'));
        this.router.navigate(['/users/update/' + resp.data._id]);
      })
      .catch((err) => {
        if (err.data.code === 11000) {
          return this.toasty.error(this.translate.instant('Email ID already exist.'));
        }
        this.toasty.error(this.translate.instant(err.data.message || err.data.data.message || err.data.data.email));
      });
  }
}
