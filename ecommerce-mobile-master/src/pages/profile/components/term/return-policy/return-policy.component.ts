import { Component, OnInit } from '@angular/core';
import { ViewController  } from 'ionic-angular';

@Component({
  selector: 'return-policy',
  templateUrl: 'return-policy.html'
})
export class ReturnPolicyComponent implements OnInit{
  constructor(public viewCtrl: ViewController) {}
  close() {
    this.viewCtrl.dismiss();
  }    
  ngOnInit() {

  }
}
