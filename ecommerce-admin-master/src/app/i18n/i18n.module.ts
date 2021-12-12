import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LanguagesComponent, NewLanguageModalComponent } from './components/languages/languages.component';
import { LanguageService } from './services/language.service';
import { TextService } from './services/text.service';
import { TranslationService } from './services/translation.service';
import { TextComponent } from './components/text/text.component';
import { TranslationComponent } from './components/translation/translation.component';

const routes: Routes = [{
  path: 'languages',
  component: LanguagesComponent,
  data: {
    title: 'Quản lý ngôn ngữ',
    urls: [{ title: 'Ngôn ngữ', url: '/i18n/languages' }, { title: 'Danh sách' }]
  }
}, {
  path: 'text',
  component: TextComponent,
  data: {
    title: 'Quản lý văn bản',
    urls: [{ title: 'Văn bản', url: '/i18n/text' }, { title: 'Danh sách' }]
  }
}, {
  path: 'translations/:lang',
  component: TranslationComponent,
  data: {
    title: 'Quản lý dịch',
    urls: [{ title: 'Dịch' }, { title: 'Danh sách' }]
  }
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgbModule,
  ],
  declarations: [
    LanguagesComponent,
    NewLanguageModalComponent,
    TextComponent,
    TranslationComponent
  ],
  providers: [
    LanguageService,
    TextService,
    TranslationService
  ],
  exports: [],
  entryComponents: [
    NewLanguageModalComponent
  ]
})
export class I18nModule { }
