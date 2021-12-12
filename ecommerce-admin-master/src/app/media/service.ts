import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  public config = {
    image: {
        styles: [
            'alignLeft', 'alignCenter', 'alignRight'
        ],
        resizeUnit: "%",
        toolbar: [
            'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
            '|',
            'imageTextAlternative'
        ]
    },
    mediaEmbed: { previewsInData: true },
    extraPlugins: [ this.TheUploadAdapterPlugin ]
  };

  constructor(private restangular: Restangular) {
  }

  TheUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new UploadAdapter(loader);
    };
  }    

  search(params: any): Promise<any> {
    return this.restangular.one('media', 'search').get(params).toPromise();
  }

  upload(base64: string, options: any): Promise<any> {
    return this.restangular.all('media/photos').post(Object.assign(options, {
      base64
    })).toPromise();
  }

  update(id: string, params: any): Promise<any> {
    return this.restangular.one('media', id).customPUT(params).toPromise();
  }

  findOne(id: string): Promise<any> {
    return this.restangular.one('media', id).get().toPromise();
  }
  delete(id: string): Promise<any> {
    return this.restangular.one('media', id).customDELETE().toPromise();
  }
}

class UploadAdapter {
  public loader: any;  // your adapter communicates to CKEditor through this
  public xhr: any;

  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {  
      this._initRequest();
      this._initListeners( resolve, reject, file );
      this._sendRequest( file );
    }));
  }

  _initRequest() {
    const xhr = this.xhr = new XMLHttpRequest();
    xhr.open( 'POST', `${window.appConfig.storageUrl}/storages/files/single`, true );
    xhr.responseType = 'json';
    xhr.setRequestHeader("channelId", "tni-ecom");
  }

  _initListeners( resolve, reject, file ) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${ file.name }.`;

    xhr.addEventListener( 'error', () => reject( genericErrorText ) );
    xhr.addEventListener( 'abort', () => reject() );
    xhr.addEventListener( 'load', () => {
        const response = xhr.response;

        if ( !response || response.error ) {
            return reject( response && response.error ? response.error.message : genericErrorText );
        }

        resolve( {
            default: response.link
        } );
    });

    if ( xhr.upload ) {
        xhr.upload.addEventListener( 'progress', evt => {
            if ( evt.lengthComputable ) {
                loader.uploadTotal = evt.total;
                loader.uploaded = evt.loaded;
            }
        } );
    }
  }

  _sendRequest( file ) {
    const data = new FormData();
    data.append('file', file );

    // Send the request.
    this.xhr.send( data );
}

  abort() {
    console.log('UploadAdapter abort');
  }
}
