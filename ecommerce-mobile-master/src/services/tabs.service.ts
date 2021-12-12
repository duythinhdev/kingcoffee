import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TabsService {
  hide() {
    const tabs = document.querySelectorAll('.tabbar.show-tabbar');
    const fixedContent = document.querySelectorAll('.fixed-content');
    const scrollContent = document.querySelectorAll('.scroll-content');
    const footer = document.querySelectorAll('.footer_logo');
    if (tabs !== null) {
      Object.keys(tabs).map((key) => {
        tabs[key].style.transform = 'translate3d(0, 200px, 0)';
      });
    }
    if (fixedContent !== null) {
      Object.keys(fixedContent).map((key) => {
        fixedContent[key].style.marginBottom = '0px';
      });
    }
    if (scrollContent !== null) {
      Object.keys(scrollContent).map((key) => {
        scrollContent[key].style.marginBottom = '0px';
      });
    }
    if (footer !== null) {
      Object.keys(footer).map((key) => {
        footer[key].style.transform = 'translate3d(0, 200px, 0)';
      });
    }
  }

  show() {
    const tabs = document.querySelectorAll('.tabbar.show-tabbar');
    const fixedContent = document.querySelectorAll('.fixed-content');
    const scrollContent = document.querySelectorAll('.scroll-content');
    const footer = document.querySelectorAll('.footer_logo');
    if (tabs !== null) {
      Object.keys(tabs).map((key) => {
        tabs[key].style.transform = 'translate3d(0, 0, 0)';
      });
    }
    if (fixedContent !== null) {
      Object.keys(fixedContent).map((key) => {
        fixedContent[key].style.marginBottom = '56px';
      });
    }
    if (scrollContent !== null) {
      Object.keys(scrollContent).map((key) => {
        scrollContent[key].style.marginBottom = '56px';
      });
    }
    if (footer !== null) {
      Object.keys(footer).map((key) => {
        footer[key].style.transform = 'translate3d(0, 0, 0)';
      });
    }
  }
}
