import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.html'
})
export class StarRating implements OnInit {

  @Input() rate: any = 3;
  @Input() total: any = 0;
  constructor() { }

  ngOnInit() {
  }
}
