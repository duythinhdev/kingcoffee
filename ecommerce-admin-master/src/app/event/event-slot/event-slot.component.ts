import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../product/services/product.service';
import { EventService } from '../services/event.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { timeout } from 'rxjs/operators';
import { SlotModalComponent } from '../event-slot-modal/event-slot-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'event-slot',
  templateUrl: './event-slot.component.html',
  styleUrls: ['./event-slot.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('out', style({
        overflow: 'hidden',
        height: '500px',
      })),
      state('in', style({
        overflow: 'hidden',
        height: '*',
      })),
      transition('in => out', animate('1000ms ease-in-out')),
      transition('out => in', animate('1000ms ease-in-out'))
    ]),
    trigger('toggleSideBar', [
      state('in', style({
        transform: 'translate3d(0,0,0)',
        width: '100%'
      })),
      state('out', style({
        transform: 'translate3d(105%, 0, 0)',
        width: '100%'
      })),
      transition('in => out', animate('1000ms ease-in-out')),
      transition('out => in', animate('1000ms ease-in-out'))
    ]),
    trigger('toggleContent', [
      state('in', style({
        transform: 'translate3d(0,0,0)',
        width: '100%'
      })),
      state('out', style({
        transform: 'translate3d(50%, 0, 0)',
        width: '100%'
      })),
      transition('in => out', animate('1000ms ease-in-out')),
      transition('out => in', animate('1000ms ease-in-out'))
    ]),
    trigger('rotate180', [
      state('out', style({
        transform: 'rotate(0)'
      })),
      state('in', style({
        transform: 'rotate(180deg)'
      })),
      transition('in => out', animate('800ms ease-in-out')),
      transition('out => in', animate('800ms ease-in-out'))
    ]),
  ],
})
export class EventSlotComponent implements OnInit {

  private SLOTS_PER_REEL = 10;
  private REEL_RADIUS = 123.5;
  private NUMBER_OF_RING = 6;
  private winnerCode: any = '00000';
  private eventProductId: string;
  public slotButtonDisabled = false;
  public awardList: any = [];
  public eventTicket: any;
  public eventProducts: any = [];

  public isExtendPol = 'out';
  public isToogleSideBar = 'in';
  public timer = 500;
  public isStop = true;
  public inter: any;

  constructor(private router: Router, private toasty: ToastrService,
    private translate: TranslateService, private productService: ProductService,
    private eventService: EventService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.init();
    //this.getCurrentEvent();

    // get list event products
    this.getEventProducts();
  }

  getCurrentEvent() {
    this.productService.findFiveElement().then(res => {
      if (res) {
        this.eventTicket = res.data;
      } else {
        this.toasty.error(this.translate.instant('This event has not yet taken place or has ended!'));
      }
    }).catch(err => this.toasty.error(
      this.translate.instant(
        err.error.code == 422 ? err.error.data.details[0].message : err.error.message
          || 'This event has not yet taken place or has ended!'
      ))
    )
  }

  getEventProducts() {
    this.productService.getEventProducts().then(res => {
      if (res) {
        this.eventProducts = res.data;
      }
    });
  }

  createSlots(ring) {
    var slotAngle = 360 / this.SLOTS_PER_REEL;
    var seed = 0;

    for (var i = 0; i < this.SLOTS_PER_REEL; i++) {
      var slot = document.createElement('div');

      slot.className = 'slot';

      // compute and assign the transform for this slot
      var transform = 'rotateX(' + (slotAngle * i) + 'deg) translateZ(' + this.REEL_RADIUS + 'px)';

      slot.style.transform = transform;
      slot.setAttribute('data-i', (i % this.SLOTS_PER_REEL).toString());

      // setup the number to show inside the slots
      // the position is randomized to
      var content = $(slot).append('<p>' + (i % this.SLOTS_PER_REEL) + '</p>');

      // add the poster to the row
      ring.append(slot);
    }
  }

  getSeed(i) {
    var seed = this.winnerCode;
    return parseInt(seed[i - 1]);
  }

  spin(timer) {
    //var txt = 'seeds: ';
    for (var i = 1; i <= this.NUMBER_OF_RING; i++) {
      var oldSeed = -1;
  		/*
  		checking that the old seed from the previous iteration is not the same as the current iteration;
  		if this happens then the reel will not spin at all
  		*/
      var oldClass = $('#ring' + i).attr('class');

      if (oldClass.length > 4) {
        oldSeed = parseInt(oldClass.slice(10));
        //$('#ring'+i).removeClass('spin-' + oldSeed);
      }

      var seed = this.getSeed(i);
      var strSeed = seed.toString();
      if (oldSeed == seed) {
        if (seed > 10)
          strSeed = Math.round(seed / 10) + '';
        else
          strSeed = strSeed + '10';
      }

      $('#ring' + i)
        .css('animation', 'back-spin 1s, spin-' + strSeed + ' ' + (timer + i * 0.5) + 's')
        .attr('class', 'ring spin-' + strSeed);
    }
  }

  wheelingEnd() {
    if (this.isStop) {
      this.slotButtonDisabled = false;
    }
  }

  // hook start button
  go() {
    if (!this.eventProductId) {
      return this.toasty.error(this.translate.instant('Vui lòng chọn sản phẩm quay thưởng'));
    }
    this.slotButtonDisabled = true;
    this.isStop = false;
    this.wheeling();
    this.end();
  }

  end() {
    this.eventService.getAwardCode({ productId: this.eventProductId }).then(res => {
      if (res) {
        clearInterval(this.inter);
        this.winnerCode = res.data.code.toString();
        this.spin(this.timer / 1000);
        setTimeout(() => {
          this.isStop = true;
        }, this.timer);

        if (res.data) {
          setTimeout(() => {
            this.openWinnerNotificationModal(res.data);
          }, this.timer + 3000);
        }
      }
    }).catch(err => {
      clearInterval(this.inter);
      this.isStop = true;
      this.slotButtonDisabled = false;
      this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message))
    });
  }

  wheeling() {
    this.inter = setInterval(function () {
      var timer = 2;
      for (var i = 1; i <= 6; i++) {
        var oldSeed = -1;
        /*
        checking that the old seed from the previous iteration is not the same as the current iteration;
        if this happens then the reel will not spin at all
        */
        var oldClass = $('#ring' + i).attr('class');

        if (oldClass.length > 4) {
          oldSeed = parseInt(oldClass.slice(10));
          //$('#ring'+i).removeClass('spin-' + oldSeed);
        }

        var seed = 0;
        var strSeed = seed.toString();
        if (oldSeed == seed) {
          if (seed > 10)
            strSeed = Math.round(seed / 10) + '';
          else
            strSeed = strSeed + '10';
        }

        $('#ring' + i)
          .css('animation', 'back-spin 1s, spin-' + strSeed + ' ' + (timer + i * 0.5) + 's')
          .attr('class', 'ring spin-' + strSeed);
      }
    }, this.timer);
    this.timer = 2000;
  }

  init() {
    // initiate slots
    this.createSlots($('#ring1'));
    this.createSlots($('#ring2'));
    this.createSlots($('#ring3'));
    this.createSlots($('#ring4'));
    this.createSlots($('#ring5'));
    this.createSlots($('#ring6'));
    //this.renderCenterRetangle();
  }

  renderCenterRetangle() {
    $('#rotate').append('<div class="center-retangle"></div>')
  }

  togglePolicy() {
    this.isExtendPol = (this.isExtendPol == 'in') ? 'out' : 'in';
  }

  toggleSideBar() {
    this.isToogleSideBar = (this.isToogleSideBar == 'in') ? 'out' : 'in';
  }

  openWinnerNotificationModal(winner) {
    if (winner != null) {
      const modalRef = this.modalService.open(SlotModalComponent, {
        size: 'lg',
        windowClass: 'modal-winner'
      });

      modalRef.componentInstance.winner = winner;
    }
  }

  onChange(item) {
    if (item) {
      this.eventProductId = item;
    }
  }
}
