import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {NgbDate, NgbCalendar, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { PromotionService } from '../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { NgbTime } from '../../../shared/models/time-picker.model';
import { PromotionStatus } from '../../../enums/promotion.enum';
@Component({
  selector: 'program-update',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss']
})
export class ProgramUpdateComponent implements OnInit {
  public item: any = {};
  public code : string;
  public name : string;
  public description : string = "";
  public isActive : boolean = false;
  public fromDate: any;
  public toDate: any;
  public idUpdate : any;
  public checkPrioritize : boolean = false;
  public isEdit : boolean= true;
  public isEditEndDate: boolean = false;
  public fromTime: NgbTime;
  public toTime: NgbTime;
  public isEnded = false;

  hoveredDate: NgbDate | null = null;
  public minDate: any = null;
  constructor(private router: Router,public formatter: NgbDateParserFormatter,private calendar: NgbCalendar, 
    private promotionService: PromotionService, private toasty: ToastrService, private route: ActivatedRoute, 
    private translate: TranslateService){
  }

  ngOnInit() {
    let dateNow = new Date();
    let now = moment(dateNow).format('DD/MM/YYYY');
    let startDateCheck = "";
    let endDateCheck = "";
    let now2 = moment(dateNow).format('YYYY-MM-DD');
    this.minDate = this.setMinDate(now);
    this.idUpdate = this.route.snapshot.params.id;
    this.promotionService.findOne(this.idUpdate).then(resp => {
      this.item = resp.data;
      let startDate = moment(resp.data.startDate).toDate();
      this.fromDate = new NgbDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      this.fromTime = new NgbTime(startDate.getHours(), startDate.getMinutes(), 0);

      let endDate = moment(resp.data.endDate).toDate();
      this.toDate = new NgbDate(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate());
      this.toTime = new NgbTime(endDate.getHours(), endDate.getMinutes(), 0);
      if(this.item?.status == PromotionStatus.new){
        this.isEdit = false
        this.isEnded = false;
      }
      if(this.item?.isPriority){
        this.checkPrioritize = true;
      }
      if(this.item?.status == PromotionStatus.running){
        this.isEditEndDate = true;
      }
      if(this.item?.status == PromotionStatus.finish){
        this.isEnded = true;
      }
      // startDateCheck = moment(resp.data?.startDate).format('YYYY-MM-DD');
      // endDateCheck = moment(resp.data?.endDate).format('YYYY-MM-DD');
      // if (moment(now2).isBefore(startDateCheck)) {
      //   this.isEdit = true;
      // } else if (moment(now2).isAfter(startDateCheck) && moment(now2).isBefore(endDateCheck)) {
      //   this.isEdit = false;
      // } else if (moment(now2).isAfter(endDateCheck)) {
      //   this.isEdit = false;
      // } else if (now2 == endDateCheck || now2 == startDateCheck) {
      //   this.isEdit = false;
      // }
    })
    .catch(err => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }

  setMinDate(data) {
    let dd = data.split("/")[0].padStart(2, "0");
    let mm = data.split("/")[1].padStart(2, "0");
    let yyyy = data.split("/")[2].split(" ")[0];
    dd = parseInt(dd);
    mm = parseInt(mm);
    yyyy = parseInt(yyyy);
    const valueDate: NgbDateStruct = { year: yyyy, month: mm, day: dd };
    return valueDate;
  }

  submit(frm:any){
    if(frm.form.value?.name?.length > 30){
      return this.toasty.error(this.translate.instant('Maximum 30 characters can be entered'));
    }
    // if(!frm.form.value?.ordering && !frm.form.value?.isPriority){
    //   return this.toasty.error(this.translate.instant('Please enter the order of application'));
    // }
    if(!this.fromDate || !this.toDate){
      return this.toasty.error(this.translate.instant('Please select start date and end date'));
    }
    let date = new Date();
    let year = 0;
    let month = 0;
    let day = 0;

    if (this.fromDate) {
      if (this.fromDate.year && this.fromDate.month && this.fromDate.day) {
        year = this.fromDate.year;
        month = this.fromDate.month;
        day = this.fromDate.day;
        month = (month + 11) % 12;
        date = new Date(year, month, day, this.fromTime ? this.fromTime.hour : 0, this.fromTime ? this.fromTime.minute : 0);
        this.item.startDate = moment(date).utc().format('HH:mm DD-MM-YYYY');
      }
    }
    if (this.toDate) {
      if (this.toDate.year && this.toDate.month && this.toDate.day) {
        year = this.toDate.year;
        month = this.toDate.month;
        day = this.toDate.day;
        month = (month + 11) % 12;
        date = new Date(year, month, day, this.toTime ? this.toTime.hour : 23, this.toTime ? this.toTime.minute : 59);
        this.item.endDate = moment(date).utc().format('HH:mm DD-MM-YYYY');
      }
    }
    // let params: object = {
    //   code: this.code,
    //   name: this.name,
    //   description: this.description,
    //   isActive: this.isActive,
    //   startDate: this.startDate,
    //   endDate: this.endDate
    // }
    this.promotionService.update(this.item)
    .then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
      this.router.navigate(['/promotions/program_list']);
    })
    .catch(err => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }

  onChangePrioritize(event:any){
    this.item.isPriority ? this.checkPrioritize = false : this.checkPrioritize = true;
    this.item.isPriority ? "" : this.item.ordering = "";
  }

  onDateSelection(date: NgbDate) {
    if(this.isEditEndDate){
      this.toDate = null;
       if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
        this.toDate = date;
      } 
    }else{
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
      } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
        this.toDate = date;
      } else {
        this.toDate = null;
        this.fromDate = date;
      }
    }
  }
  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  formatTimePickerValue(value: NgbTime){
    if(value){
      return `${String('00' + value.hour).slice(-2)}:${String('00' + value.minute).slice(-2)} `;
    }else{
      return '';
    }
  }
}
