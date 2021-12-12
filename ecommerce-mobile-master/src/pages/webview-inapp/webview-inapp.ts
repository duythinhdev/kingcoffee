import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
/**
 * Generated class for the WebviewInappPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-webview-inapp',
  templateUrl: 'webview-inapp.html',
})
export class WebviewInappPage {
  variable_name
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private dom: DomSanitizer) {
    // variable_name=this.dom.bypassSecurityTrustResourceUrl(url); 
  }


  async ngOnInit() {
    let url = this.navParams.get('url');
    url = url+"&output=embed";
    this.variable_name = this.dom.bypassSecurityTrustResourceUrl(url);
  }

}
