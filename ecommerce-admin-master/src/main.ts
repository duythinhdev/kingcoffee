import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

declare global {
  interface Window { appConfig: any; }
}

//export version and build number to global
// window.appConfig = {
//   version: environment.version,
//   build: environment.build,
//   apiBaseUrl: environment.apiBaseUrl,
//   platform: environment.platform,
//   imageStorage: environment.apiBaseUrl + '/media/photos',
//   storageUrl: environment.storageUrl,
//   mainStore: environment.mainStore,
  
// };

window.appConfig = environment;
window.appConfig.imageStorage = environment.apiBaseUrl + '/media/photos';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
