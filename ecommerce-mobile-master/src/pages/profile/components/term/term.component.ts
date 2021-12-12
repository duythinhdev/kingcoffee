import { Component, OnInit } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { GeneralPolicyComponent } from '../term/general-policy/general-policy.component';
import { PrivacyPolicyComponent } from '../term/privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from '../term/terms-of-use/terms-of-use.component';
import { MembershiRegistrationProcessComponent } from '../term/membership-registration-process/membership-registration-process.component';
import { RefundRefundProcessComponent } from '../term/refund-refund-process/refund-refund-process.component';
import { DeliveryProcessComponent } from '../term/delivery-process/delivery-process.component';
import { PurchaseProcessComponent } from '../term/purchase-process/purchase-process.component';
import { PaymentPolicyComponent } from '../term/payment-policy/payment-policy.component';
import { ReturnPolicyComponent } from '../term/return-policy/return-policy.component';
import { OtherPoliciesComponent } from '../term/other-policies/other-policies.component';
@Component({
  selector: 'term',
  templateUrl: 'term.html'
})
export class TermComponent implements OnInit{
  constructor(
    public modalCtrl: ModalController,
    ) {
     
  }
  presentModal(state: string) {    
    if (state === 'general-policy') {
      let profileModal = this.modalCtrl.create(GeneralPolicyComponent);
      profileModal.present();
    } else if (state === 'privacy-policy') {
      let profileModal = this.modalCtrl.create(PrivacyPolicyComponent);
      profileModal.present();
    } else if (state === 'terms-of-use') {
      let profileModal = this.modalCtrl.create(TermsOfUseComponent);
      profileModal.present();
    }else if (state === 'membership-registration-process') {
      let profileModal = this.modalCtrl.create(MembershiRegistrationProcessComponent);
      profileModal.present();
    }else if (state === 'refund-refund-process') {
      let profileModal = this.modalCtrl.create(RefundRefundProcessComponent);
      profileModal.present();
    }else if (state === 'delivery-process') {
      let profileModal = this.modalCtrl.create(DeliveryProcessComponent);
      profileModal.present();
    }else if (state === 'purchase-process') {
      let profileModal = this.modalCtrl.create(PurchaseProcessComponent);
      profileModal.present();
    }else if (state === 'payment-policy') {
      let profileModal = this.modalCtrl.create(PaymentPolicyComponent);
      profileModal.present();
    }else if (state === 'return-policy') {
      let profileModal = this.modalCtrl.create(ReturnPolicyComponent);
      profileModal.present();
    }else if (state === 'other-policies') {
      let profileModal = this.modalCtrl.create(OtherPoliciesComponent);
      profileModal.present();
    }
  }
  ngOnInit() {
    // this.http.get('https://womencando.com.vn/assets/files/html/chinh-sach-bao-mat',{responseType:'text'}).subscribe(res=>{
    //   this.KisshtHtml = this.sanitizer.bypassSecurityTrustHtml(res);
    //   console.log(this.KisshtHtml);
    // })
  }
}
