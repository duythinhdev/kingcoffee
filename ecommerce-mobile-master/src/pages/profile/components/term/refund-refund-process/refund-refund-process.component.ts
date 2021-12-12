import { Component, OnInit } from '@angular/core';
import { ViewController  } from 'ionic-angular';

@Component({
  selector: 'refund-refund-process',
  templateUrl: 'refund-refund-process.html'
})
export class RefundRefundProcessComponent implements OnInit{
  constructor(public viewCtrl: ViewController) {}
  close() {
    this.viewCtrl.dismiss();
  }    
  ngOnInit() {

  }
}
