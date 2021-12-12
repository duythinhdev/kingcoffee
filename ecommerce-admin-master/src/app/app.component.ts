import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services';
import { Router, NavigationEnd } from '@angular/router';
import { SystemService } from './shared/services';
import { TranslationService } from '../app/i18n/services/translation.service';
import { TranslateService } from '@ngx-translate/core';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'Seller';
  public items = [];
  public total = 0;
  public sidebarnavItems: any[];
  public search: any = {
    text: '',
    translation: ''
  };
  private lang = 'vi';
  constructor(private router: Router, private authService: AuthService, private systemService: SystemService, private translationService: TranslationService,
    private translate: TranslateService) {

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        $('html, body').animate({ scrollTop: 0 });
      }
    });
    this.systemService.configs().then(resp => {
      // change favicon
      // $('#favicon').attr('href', resp.siteFavicon);
    });

    const defaultLang = 'vi';
    this.translate.setDefaultLang(defaultLang);
  }
  ngOnInit() {
    if (this.authService.isLoggedin()) {
      this.translationService.setLanguage();
      this.authService.getCurrentUser();
    }
  }
}
