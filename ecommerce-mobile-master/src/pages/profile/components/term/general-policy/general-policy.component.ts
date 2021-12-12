import { Component, OnInit } from '@angular/core';
import { ViewController  } from 'ionic-angular';

@Component({
  selector: 'general-policy',
  templateUrl: 'general-policy.html'
})
export class GeneralPolicyComponent implements OnInit{
  constructor(public viewCtrl: ViewController) {}
  close() {
    this.viewCtrl.dismiss();
  }    
  ngOnInit() {

  }
}
