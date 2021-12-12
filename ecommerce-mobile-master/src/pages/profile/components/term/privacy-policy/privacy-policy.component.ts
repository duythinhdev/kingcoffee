import { Component, OnInit } from '@angular/core';
import { ViewController  } from 'ionic-angular';

@Component({
  selector: 'privacy-policy',
  templateUrl: 'privacy-policy.html'
})
export class PrivacyPolicyComponent implements OnInit{
  constructor(public viewCtrl: ViewController) {}
  close() {
    this.viewCtrl.dismiss();
  }    
  ngOnInit() {

  }
}
