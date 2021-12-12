import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class ToastyService {
  constructor(private toastCtrl: ToastController) {}
  success(text) {
    const toasty = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top',
      cssClass: 'success',
    });
    return toasty.present();
  }

  error(text) {
    const toasty = this.toastCtrl.create({
      message: text,
      duration: 5000,
      position: 'top',
      cssClass: 'error',
    });
    return toasty.present();
  }
}
