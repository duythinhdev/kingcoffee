import * as $ from 'jquery';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, LocationStrategy, PathLocationStrategy, LOCATION_INITIALIZED } from '@angular/common';
import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { RestangularModule, Restangular } from 'ngx-restangular';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
//import { SortablejsModule } from 'ngx-sortablejs';

import { FullComponent } from './layouts/full/full.component';
import { AuthLayoutComponent } from './layouts/auth/auth.component';

import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { AuthService, LocationService } from './shared/services';
import { AuthGuard } from './shared/guard/auth.guard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ImageCropperModule } from 'ngx-image-cropper';

import { Approutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './shared/spinner.component';

import { MediaModule } from './media/media.module';
import { ConfigResolver } from './shared/resolver';
import { TranslationService } from '../app/i18n/services/translation.service';
import { FileUploadModule } from 'ng2-file-upload';
import { UtilsModule } from './utils/utils.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true,
};

// Function for setting the default restangular configuration
export function RestangularConfigFactory(RestangularProvider) {
  //TODO - change default config
  RestangularProvider.setBaseUrl(window.appConfig.apiBaseUrl);
  RestangularProvider.addFullRequestInterceptor((element, operation, path, url, headers, params) => {
    //Auto add token to header
    headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
    headers.platform = window.appConfig.platform;
    return {
      headers: headers
    }
  });

  RestangularProvider.addErrorInterceptor((response, subject, responseHandler) => {
    //force logout and relogin
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isLoggedin');
      window.location.href = '/auth/login';

      return false; // error handled
    }

    return true; // error not handled
  });
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${window.appConfig.apiBaseUrl}/i18n/`, '.json');
  // return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      const langToSet = 'vi'
      translate.setDefaultLang('vi');
      translate.use(langToSet).subscribe(() => {
        console.info(`Successfully initialized '${langToSet}' language.'`);
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    FullComponent,
    AuthLayoutComponent,
    BreadcrumbComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot(Approutes, { useHash: false }),
    PerfectScrollbarModule,
    // Importing RestangularModule and making default configs for restanglar
    RestangularModule.forRoot(RestangularConfigFactory),
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    NgSelectModule,
    //SortablejsModule.forRoot({ animation: 150 }),
    ImageCropperModule,
    FileUploadModule,
    MediaModule,
    UtilsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),

  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }, {
      provide: LocationStrategy,
      useClass: PathLocationStrategy //HashLocationStrategy
    },
    AuthService,
    AuthGuard,
    LocationService,
    ConfigResolver,
    TranslationService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
