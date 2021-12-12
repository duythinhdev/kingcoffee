import { Component } from '@angular/core';
import { StaticPageService, ToastyService } from '../../services';
import { NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'static-page',
  templateUrl: './view.html',
})
export class StaticPageComponent {
  page = {};

  constructor(
    private staticpageService: StaticPageService,
    private toasty: ToastyService,
    private translate: TranslateService,
    private nav: NavParams
  ) {
    this.staticpageService
      .find(this.nav.data.alias)
      .then((res) => {
        this.page = res.data;
      })
      .catch((err) => {
        return this.toasty.error(
          this.translate.instant(err.message || 'Something went wrong!')
        );
      });
  }
}
