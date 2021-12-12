import { Injectable } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';;

@Injectable()
export class MsgService {

  constructor(
    private alertController: AlertController,
    public toastController: ToastController
  ) { }

  async success(message: string) {
    const toast = this.toastController.create({
      message,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: "x"
    });
    return toast.present();
  }

  async warn(message: string) {
    const toast = this.toastController.create({
      message,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: "x"
    });
    return toast.present();
  }

  async error(message: string) {
    const toast = this.toastController.create({
      message,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: "x"
    });
    return toast.present();
  }

  async alertOK(message) {
    const alert = this.alertController.create({
      message,
      buttons: ['Đồng ý']
    });

    await alert.present();
  }

  async alertYesNo(message) {
    return new Promise(async (resolve, reject) => {
      const alert = this.alertController.create({
        message,
        buttons: [
          {
            text: 'Đóng',
            role: 'cancel',
            cssClass: 'color-gray',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Đồng ý',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });
  }

  async alertSuccessOrNot(message) {
    return new Promise(async (resolve, reject) => {
      const alert = this.alertController.create({
        message,
        buttons: [
          {
            text: 'Thất bại',
            role: 'cancel',
            cssClass: 'color-secondary',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Thành công',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });
  }
}
