import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services';
import { LoginModel, loginData } from '../../model/login.model';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../../shared/services/utils.service';

@Component({
	templateUrl: 'login.component.html'
})
export class LoginComponent {
  public istwoFaCode: Boolean = false;
	Auth: AuthService;
	credentials = {
    username: '',
    password: ''
  };

	constructor(auth: AuthService, public router: Router, private translate: TranslateService,
		private toasty: ToastrService, private utilService: UtilService) {
    this.Auth = auth;

		if (auth.isLoggedin()) {
			this.router.navigate(['/home']); // Chỉnh lại starter khi cần
		}
  }
	login() {
    this.utilService.setLoading(true);
		this.Auth.login(this.credentials).then(() =>{
      // if(loginData[0].code == '4003'){
      //   this.istwoFaCode = true;
      //   this.utilService.setLoading(false);
      //   this.toasty.error(this.translate.instant('Vui lòng Nhập TwoFacode!'));
      //   return;
      // }
      //this.router.navigate(['/products']); // Chỉnh lại starter khi cần
      window.location.reload();
		} )
	.catch((err) => {
    this.utilService.setLoading(false);
    this.toasty.error(this.translate.instant(err.error.data.message));
  });
	}
}
