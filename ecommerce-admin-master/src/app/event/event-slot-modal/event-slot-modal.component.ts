import { Component, OnInit, Input } from '@angular/core';
import { EventService } from '../services/event.service';
import { UtilService } from '../../shared/services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'event-slot-modal',
  templateUrl: './event-slot-modal.html',
  styleUrls: ['./event-slot-modal.scss']
})
export class SlotModalComponent implements OnInit {

  @Input() public winner;

  constructor(
    public activeModal: NgbActiveModal,
    private toasty: ToastrService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    if(this.winner){
      this.winner.code = parseInt(this.winner.code).toString();
    }
  }
}
