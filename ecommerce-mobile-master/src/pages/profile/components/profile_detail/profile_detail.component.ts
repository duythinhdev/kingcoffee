import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, Platform } from 'ionic-angular';
import {
  AuthService,
} from '../../../../services';
import { UpdateComponent } from '../update/update.component';
import { AddressComponent } from '../address/address.component';
import { ListBankComponent } from '../listBank/list-bank.component';
import { TermComponent } from '../term/term.component';
import { isNil } from 'lodash';
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { ReferralComponent } from '../referral/referral-component';
import { AboutLinkReferralComponent } from '../term/about-link-referral/about-link-referral';
import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'profile-detail',
  templateUrl: './profile_detail.html',
})
export class ProfileDetailComponent implements OnInit {
  isLoading = false;
  content = '';
  memberId = '';
  isShowPopup = false;
  isMember = false;
  referralCodeLink = '';

  constructor(
    public nav: NavController,
    public viewCtrl: ViewController,
    private authService: AuthService,
    public platform: Platform,
    private inAppBrowser: InAppBrowser,
    private socialSharing: SocialSharing,

  ) {}

  async ngOnInit() {
    await this.load_info();
  }

  async load_info() {
    if (this.authService.isLoggedin()) {
      this.isMember = await this.authService.isMember();
      await this.authService.me_social().then((resp) => {
        if (!isNil(resp.data)) {
          this.memberId = resp.data.socialInfo.MemberId;
          this.referralCodeLink = `${window.appConfig.investWebUrl}/${resp.data.socialInfo.PhoneNumber}/${this.memberId}`;
        }
      });
    }
  }

  goTo(state: string) {
    if (state === 'update') {
      return this.nav.push(UpdateComponent);
    } else if (state === 'listbank') {
      return this.nav.push(ListBankComponent);
    } else if (state === 'address') {
      return this.nav.push(AddressComponent, { flagchange: true });
    } else if (state === 'term') {
      return this.nav.push(TermComponent);
    } else if (state === 'referral') {
      return this.nav.push(ReferralComponent);
    } else if (state === 'aboutReferral') {
      return this.nav.push(AboutLinkReferralComponent);
    }
  }

  showPopup() {
    this.isShowPopup = true;
  }

  close() {
    this.isShowPopup = false;
  }

  goToYoutube() {
    return this.platform.ready().then(() => {
      return this.inAppBrowser.create(
        'https://www.youtube.com/channel/UCBKACaTtGW66JNmdQkHhDlg',
        '_blank'
      );
    });
  }
  
  goToWeb() {
    return this.platform.ready().then(() => {
     return this.inAppBrowser.create(
        'https://elearning.tnicorporation.com/login/index.php',
        '_blank',
      );
    });
  }

  shareSocial() {
    const message = `Bạn tôi ơi...${this.referralCodeLink}`;
    return this.socialSharing.share(
      message,
      undefined,
      undefined
    );
  }
}
