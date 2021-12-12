import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
	templateUrl: 'forgot.html'
})
export class ForgotComponent {
	email: string = '';
	submitted: boolean = false;
	Auth: AuthService;

	constructor(auth: AuthService, public router: Router, private toasty: ToastrService, private translate: TranslateService) {
		this.Auth = auth;
  }

	forgot() {
		this.submitted = true;
		this.Auth.forgot(this.email).then((resp) => {
			this.toasty.success(this.translate.instant('New password has been sent, please check your email inbox.'));
		})
		.catch((err) => this.toasty.error(this.translate.instant(err.data.data.message)))
	}
}
