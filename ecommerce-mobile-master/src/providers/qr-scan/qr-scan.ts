import {Injectable} from '@angular/core';
import {QRScanner, QRScannerStatus} from '@ionic-native/qr-scanner';

import { ToolBox } from './ToolBox';

@Injectable()
export class QrScan {

  constructor(private qrScanner: QRScanner) {

  }

  scan():Promise<any> {
    return new Promise((resolve, reject) => {
      return this.startScanner()
        .then((data) => {
          if (data) {
            resolve(data);
          } else {
            reject("error");
          }
        })
    });
  }

  private startScanner():Promise<any> {
    // Get the device cam permission.
    return this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        return new Promise((resolve, reject) => {
          if (status.authorized) {
              const scanSub = this.qrScanner.scan().subscribe((code: string) => {
              this.qrScanner.hide();
              scanSub.unsubscribe();
              resolve(code);
            });
            ToolBox.showCamera();
            this.qrScanner.show();
          } else if (status.denied) {
            // camera permission was permanently denied
            if (status.canOpenSettings) {
              this.qrScanner.openSettings();
            }
            reject(new Error('MESSAGES.QRSCANNER.CHANGE_SETTINGS_ERROR'));
          } else {
            // permission was denied, but not permanently. You can ask for permission again at a later time.
            reject(new Error('MESSAGES.QRSCANNER.PERMISSION_DENIED_ERROR'));
          }
        });
      })
  }

  toggleLight() {
    Promise.resolve("proceed")
      .then((k) => {
        return this.qrScanner.getStatus();
      }).then((status: QRScannerStatus) => {
      if (status.authorized) {
        if (status.canEnableLight) {
          if (status.lightEnabled) {
            return this.qrScanner.disableLight();
          } else {
            return this.qrScanner.enableLight();
          }
        }
      } else {
        alert(status)
      }
    }).then((ok) => {
      // OK
    }).catch((error) => {
      // ERROR!
    });
  }

  toggleCamera() {
    Promise.resolve("proceed")
      .then((k) => {
        return this.qrScanner.getStatus()
      }).then((status: QRScannerStatus) => {
      if (status.authorized) {
        if (status.canChangeCamera) {
          if (status.currentCamera == 0) {
            return this.qrScanner.useFrontCamera();
          } else if (status.currentCamera == 1) {
            return this.qrScanner.useBackCamera();
          }
        }
      } else {
        return Promise.reject("denied");
      }
    }).then((ok) => {
      // OK
    }).catch((error) => {
      // ERROR FLASH HANDLE
    });
  }

  destroyCamera() {
    this.qrScanner.destroy();
  }
}
