import { Component, OnInit } from '@angular/core';
import { AuthService, ToastyService } from '../../../../services';
import { isNil } from 'lodash';
import { toDataURL } from 'qrcode';
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';
@Component({
  selector: 'referral-component',
  templateUrl: 'referral-component.html',
})
export class ReferralComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private clipboard: Clipboard,
    private socialSharing: SocialSharing,
    private toasty: ToastyService
  ) { }
  referralCode = '';
  referralCodeLink = '';
  qrCode;
  customerNameSponsor = '';
  listMemberReferralF1;
  totalMemberReferral = 0;


  async ngOnInit() {
    await this.load_info();
  }

  async load_info() {
    if (this.authService.isLoggedin()) {
      await this.authService.me_social().then(async (resp) => {
        if (!isNil(resp.data)) {
          this.referralCode = resp.data.socialInfo.MemberId;
          this.referralCodeLink = `${window.appConfig.investWebUrl}/${resp.data.socialInfo.PhoneNumber}/${this.referralCode}`;
          this.qrCode = await toDataURL(this.referralCodeLink);
          this.customerNameSponsor = resp.data.socialInfo.CustomerNameSponsor;
        }
      });

      await this.authService.listMemberReferralF1().then((response) => {
        this.listMemberReferralF1 = response.Data.ListMember.slice(0, 10);
        this.totalMemberReferral = response.Data.Count;
      }).catch(async error => {
        console.log(error)
        if (error.status == 401) {
          let token = localStorage.getItem('social_token');
          await this.authService.postlistMemberReferralF1(token).then((response) => {
            this.listMemberReferralF1 = response.Data.ListMember.slice(0, 10);
            this.totalMemberReferral = response.Data.Count;
          }).catch(error => {
            console.log(error)
          });
        }
        else {
        }
      });
    }
  }

  async copyReferralLink() {
    await this.clipboard.copy(this.referralCodeLink).then(() => {
      return this.toasty.success('Đã sao chép')
    });
  }

  shareFacebook() {
    const message = `Bạn tôi ơi...${this.referralCodeLink}`;
    return this.socialSharing.shareViaFacebook(
      message,
      undefined,
      this.referralCodeLink
    );
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
