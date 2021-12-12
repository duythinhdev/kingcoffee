import { Component, OnDestroy } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { AuthService, ToastyService } from '../../../../services';
import { MediaComponent } from '../../../media/media.component';
import { HomePage } from '../../../home/home';
import { TranslateService } from '@ngx-translate/core';
import { ChangePasswordComponent } from '../changePassword/changePassword.component';
import { UpdateProfileComponent } from '../update_profile/update-profile.component';

@Component({
  selector: 'update-component',
  templateUrl: './update.html',
})
export class UpdateComponent implements OnDestroy {
  isSubmitted = false;
  private userLoadedSubscription: Subscription;
  info = {};
  data_info:{
    socialInfo: {
      IsMember: boolean,
      Avatar: string
    }
  };
  isMenber = false;
  avatarOptions = {};
  private homePage;
  roleName = 'WE';
  avartar = '';

  constructor(
    private authService: AuthService,
    private toasty: ToastyService,
    private nav: NavController,
    private translate: TranslateService
  ) {
    this.userLoadedSubscription = authService.userLoaded$.subscribe(
      (data) => (this.info = data)
    );
    this.homePage = HomePage;
    this.load_info();
  }

  async load_info() {
    if (this.authService.isLoggedin()) {
      this.roleName = localStorage.getItem('roleName');
      if(this.roleName == 'WE'){
        this.roleName = 'WE đại lý';
      }
      if(this.roleName == 'we_free' || this.roleName == '5'){
        this.roleName = 'WE thành viên';
      }
      await this.authService.me_social().then((resp) => {
        this.data_info = resp.data;
      });
      if (this.data_info) {
        this.isMenber = this.data_info.socialInfo.IsMember;
        this.avartar = this.data_info.socialInfo.Avatar;
      }
    }
  }

  ngOnDestroy() {
    this.userLoadedSubscription.unsubscribe();
  }

  async submit(frm) {
    this.isSubmitted = true;
    this.authService
      .updateMe(this.info)
      .then(async (resp) => {
        await this.toasty.success(
          this.translate.instant('Updated successfully!')
        );
        return this.nav.goToRoot(this.homePage);
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(
            'Something occurred wrong, please check and retry again.'
          )
        );
      });
  }

  selectMedia() {
    return this.nav.push(MediaComponent);
  }

  goTo(state: string) {
    if (state === 'changepass') {
      return this.nav.push(ChangePasswordComponent);
    }
    else if (state === 'update-profile') {
      return this.nav.push(UpdateProfileComponent, this.data_info);
    }
  }

  updateBank(){

  }
}
