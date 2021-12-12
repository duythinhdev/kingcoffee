import { UpdateComponent } from './../profile/components/update/update.component';
import {
  NavController,
  LoadingController,
  ActionSheetController,
  Loading,
  Platform,
} from 'ionic-angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { Component } from '@angular/core';
import { ToastyService, AuthService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { LocalStorgeService } from '../../services/local-storge.service';
import { StatusBar } from '@ionic-native/status-bar';

declare var cordova;

@Component({
  selector: 'select-media',
  templateUrl: './media.html',
})
export class MediaComponent {
  lastImage = {
    name: '',
    url: '',
    data: '',
  };

  loading: Loading;
  authToken = '';

  constructor(
    public navCtrl: NavController,
    private transfer: FileTransfer,
    private camera: Camera,
    public localstore: LocalStorgeService,
    public loadingCtrl: LoadingController,
    public toasty: ToastyService,
    private translate: TranslateService,
    private filePath: FilePath,
    private file: File,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private photoViewer: PhotoViewer,
    private statusBar: StatusBar
  ) {
    this.authToken = this.localstore.get('social_token');
  }

  presentActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Lựa chọn',
      buttons: [
        {
          text: 'Chọn từ thư viện',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          },
        },
        {
          text: 'Chụp hình',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          },
        },
        {
          text: 'Hủy',
          role: 'cancel',
        },
      ],
    });
    return actionSheet.present();
  }

  takePicture(sourceType) {
    // Create options for the Camera Dialog
    const options = {
      quality: 100,
      sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    };

    // Get the data of an image
    this.camera.getPicture(options).then(
      async (imagePath) => {
        // Special handling for Android library
        if (
          this.platform.is('android') &&
          sourceType === this.camera.PictureSourceType.PHOTOLIBRARY
        ) {
          await this.filePath.resolveNativePath(imagePath).then((filePath) => {
            const correctPath = filePath.substr(
              0,
              filePath.lastIndexOf('/') + 1
            );
            const currentName = imagePath.substring(
              imagePath.lastIndexOf('/') + 1,
              imagePath.lastIndexOf('?')
            );
            this.copyFileToLocalDir(
              correctPath,
              currentName,
              this.createFileName()
            );
          });
        } else {
          const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.copyFileToLocalDir(
            correctPath,
            currentName,
            this.createFileName()
          );
        }
        this.statusBar.hide();
        this.statusBar.show();
      },
      (err) => {
        // this.toasty.error(this.translate.instant('Error while selecting image.'));
        this.statusBar.hide();
        this.statusBar.show();
      }
    );
  }

  // Create a new name for the image
  private createFileName() {
    const d = new Date();
    const n = d.getTime();
    const newFileName = n + '.jpg';
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file
      .copyFile(namePath, currentName, cordova.file.cacheDirectory, newFileName)
      .then(
        async (success) => {
          this.lastImage.name = newFileName;
          const dataImg = await this.file.readAsDataURL(
            cordova.file.cacheDirectory,
            newFileName
          );
          this.lastImage.data = dataImg;
        },
        (error) => {
          return this.toasty.error(
            this.translate.instant('Error while storing file.')
          );
        }
      );
  }

  // Always get the accurate path to your apps folder
  preview(img) {
    if (!img) {
      return;
    }
   return this.file
      .readAsDataURL(cordova.file.cacheDirectory, img)
      .then((dataURL: string) => {
        this.photoViewer.show(dataURL);
      });
  }

  async uploadImage() {
    // Destination URL
    const url = window.appConfig.investUrl + '/Account/UpdateAvatar';

    // File for Upload
    const targetPath = cordova.file.cacheDirectory + this.lastImage.name;

    // File name only
    const filename = this.lastImage.name;

    const options = {
      fileKey: 'avatar',
      fileName: filename,
      chunkedMode: false,
      mimeType: 'multipart/form-data',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    };

    const fileTransfer: FileTransferObject = this.transfer.create();

    this.loading = this.loadingCtrl.create({
      content: 'Đang tải...',
    });
    await this.loading.present();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(
      (data) => {
        this.loading.dismissAll();
        return this.navCtrl.setRoot(UpdateComponent);
      },
      (err) => {
        this.loading.dismissAll();
        return this.toasty.error(
          this.translate.instant('Error while uploading file.')
        );
      }
    );
  }
}
