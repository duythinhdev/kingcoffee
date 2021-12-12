import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'discount-first',
  templateUrl: './discount-first.html',
  styleUrls: ['./discount-first.scss']
})
export class DiscountFirstComponent implements OnInit {
  @Input() discountData: Object;
  @Output() removeRowData: any = new EventEmitter<any>();
  constructor() {
  }

  ngOnInit() {
    console.log(this.discountData);
  }
  onRemove(v: any) {
    this.removeRowData.emit(v);
  }
}

