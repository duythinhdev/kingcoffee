import { Component, OnInit } from '@angular/core';
import { ViewController  } from 'ionic-angular';

@Component({
  selector: 'terms-of-use',
  templateUrl: 'terms-of-use.html'
})
export class TermsOfUseComponent implements OnInit{
  constructor(public viewCtrl: ViewController) {}
  close() {
    this.viewCtrl.dismiss();
  }    
  ngOnInit() {

  }
}
