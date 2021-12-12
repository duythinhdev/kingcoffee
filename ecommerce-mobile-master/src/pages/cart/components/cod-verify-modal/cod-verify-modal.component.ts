import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { ToastyService, OrderService } from '../../../../services';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty } from 'lodash';

@Component({
  templateUrl: './form.html',
})
export class CodVerifyModalComponent {
  verifyCode: string;

  constructor(
    private toasty: ToastyService,
    public viewCtrl: ViewController,
    private orderService: OrderService,
    private translate: TranslateService
  ) {}

  async confirm() {
    if (!isEmpty(this.verifyCode)) {
      return this.toasty.error(
        this.translate.instant('Please enter verify code!')
      );
    }
    await this.viewCtrl.dismiss({
      verifyCode: this.verifyCode.toUpperCase(),
    });
  }

  async resend() {
    const phoneNumber = this.viewCtrl.data.phoneNumber;
    if (phoneNumber) {
      await this.orderService.checkPhone(phoneNumber);
    }
  }
}
