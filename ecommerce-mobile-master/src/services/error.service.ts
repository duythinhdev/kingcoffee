import { ErrorHandler, Inject } from '@angular/core';
import { AlertController } from 'ionic-angular';

export class WeErrorHandler implements ErrorHandler {
  constructor(@Inject(AlertController) private alerts: AlertController) {}

  async handleError(error) {
    const alert = this.alerts.create({
      title: 'Xảy ra lỗi',
      subTitle: 'Đã có lỗi xảy ra, vui lòng thử lại.',
      enableBackdropDismiss: false,
      buttons: ['Got it!'],
    });
    return alert.present();
  }
}
