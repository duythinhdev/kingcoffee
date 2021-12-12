import { Component, OnInit, Input } from '@angular/core';
import { StatTitle, StatTitleModel } from '../model/stat.title.model';
  import { from } from 'rxjs';
@Component({
  selector: 'stat-card',
  templateUrl: './stat-card.html'
})
export class StatCardComponent implements OnInit {
  @Input() stat: any;
  @Input() type: any;

  statTitleModel : StatTitleModel;
  constructor() {
  }

  ngOnInit() { 
    this.statTitleModel = StatTitle[0];
  }
}
