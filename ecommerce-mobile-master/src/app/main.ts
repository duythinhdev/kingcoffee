import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app.module';
import { environment } from './environments/environment';

// this is the magic wand
enableProdMode();

declare global {
  interface Window {
    appConfig;
    appData;
  }
}

// export version and build number to global
window.appConfig = environment;

// init data for the app
window.appData = {};

platformBrowserDynamic().bootstrapModule(AppModule);
