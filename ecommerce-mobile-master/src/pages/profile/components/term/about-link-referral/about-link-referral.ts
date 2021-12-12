import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'about-link-referral',
  templateUrl: 'about-link-referral.html',
})
export class AboutLinkReferralComponent implements OnInit {
  constructor(public viewCtrl: ViewController) {}
  aboutReferralLink = '';
  close() {
    return this.viewCtrl.dismiss();
  }
  ngOnInit() {
    this.aboutReferralLink = `${window.appConfig.investWebUrl}/Home/GetguideIntroductionEcom`
  }
}
