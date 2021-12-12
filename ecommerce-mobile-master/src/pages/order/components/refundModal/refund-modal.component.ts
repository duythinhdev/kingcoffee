import { Component } from '@angular/core';
import { OrderService, ToastyService } from '../../../../services';
import { ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'refund-modal',
  templateUrl: './form.html'
})
export class RefundModalComponent {
  reason = '';
  private orderDetailId = this.viewCtrl.data.orderDetailId;

  constructor(private orderService: OrderService, private toasty: ToastyService, public viewCtrl: ViewController, private translate: TranslateService) {
  }

  async send() {
    this.orderService.sendRefund({ orderDetailId: this.orderDetailId, reason: this.reason }).then(async () => {
      await this.viewCtrl.dismiss('OK');
      return this.toasty.success(this.translate.instant('Your refund request has been sent. Please check your email for more details.'))
    })
      .catch(async (err) => {
        await this.viewCtrl.dismiss(err);
        return this.toasty.error(this.translate.instant('Something went wrong, please try again!'))
      })
  }
}
