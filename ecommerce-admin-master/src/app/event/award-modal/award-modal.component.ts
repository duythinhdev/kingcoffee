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
  selector: 'award-modal',
  templateUrl: './award-modal.html'
})
export class AwardModalComponent implements OnInit {

  @Input() public winnerId;

  public winner = {
    username: '',
    code: '',
    orderNumber: '',
    createdAt: '',
    description: '',
  };
  public isLoading = false;
  private loadingSubscription: Subscription;

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private eventService: EventService,
    private toasty: ToastrService,
    private utilService: UtilService,
    private translate: TranslateService,
  ) {
    this.loadingSubscription = utilService.appLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit() {
    this.getWinnerDetail();
  }

  getWinnerDetail(){
    this.eventService.findWinner(this.winnerId).then(res => {
      if(res){
        this.winner = res.data;
      }
    })
  }

  saveWinner(){
    this.eventService.updateWinner(this.winnerId, {
      description: this.winner.description
    }).then(resp => {
      this.toasty.success(this.translate.instant('Update winner is successfully!'));
      this.utilService.setLoading(false);
      this.activeModal.close(this.winner.description);
    })
    .catch(() => {
      this.toasty.error('Update winner is unsuccessfully!');
      this.utilService.setLoading(false);
    });
  }
}
