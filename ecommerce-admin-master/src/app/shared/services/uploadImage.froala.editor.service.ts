import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UploadImageFroalaEditorService {
  public options : any = {};

  constructor(private authService: AuthService) {
    this.options = {
      requestHeaders: {
        Authorization: 'Bearer ' + this.authService.getAccessToken(),
      },
      // Set the image upload URL.
      imageUploadURL: window.appConfig.imageStorage,
      events:  {
        'froalaEditor.image.error': function (e, editor, error, response) {
          console.log(error);
          console.log(response);
        },
        'froalaEditor.image.uploaded': function (e, editor, response) {
          var jsonRes = JSON.parse(response);
          var img_url = jsonRes.data.fileUrl;
          editor.image.insert(img_url, false, null, editor.image.get(), jsonRes);
          return false;
        },
        'froalaEditor.image.inserted': function (e, editor, $img, response) {
          // Do something here.
          // this is the editor instance.
          console.log(this);
        }
      }
    };
  }
}


