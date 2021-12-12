import { Component, OnInit } from '@angular/core';
import {NgbDate, NgbCalendar, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { PromotionService } from '../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { NgbTime } from '../../../shared/models/time-picker.model';

@Component({
  selector: 'program-create',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss']
})
export class ProgramCreateComponent implements OnInit {
  public item: any = {
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
    description: '',
    // isPriority: false,
    // ordering: ''
  };
  public checkPrioritize : boolean = false;
  public isEdit : boolean= false;
  public isEnded : boolean= false;
  // public code : string;
  // public name : string;
  // public description : string = "";
  // public isActive : boolean = false;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public fromTime: NgbTime;
  public toTime: NgbTime;
  public isEditEndDate: boolean = false;

  hoveredDate: NgbDate | null = null;
    public minDate: any = null;
  constructor(private router: Router,public formatter: NgbDateParserFormatter,private calendar: NgbCalendar, 
    private promotionService: PromotionService, private toasty: ToastrService, private translate: TranslateService){
  }

  ngOnInit() { 
    let dateNow = new Date();
    let now = moment(dateNow).format('DD/MM/YYYY');
    this.minDate = this.setMinDate(now);
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
    if(frm.form.value?.name.length > 30){
      return this.toasty.error(this.translate.instant('Maximum 30 characters can be entered'));
    }
    // if(!frm.form.value?.ordering && !frm.form.value?.isPriority){
    //   return this.toasty.error(this.translate.instant('Please enter the order of application'));
    // }
    if(!this.fromDate || !this.toDate){
      return this.toasty.error(this.translate.instant('Please select start date and end date'));
    }
    let date = new Date();
    let startDate = "";
    let endDate = "";
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
    this.promotionService.create(this.item)
    .then(resp => {
      // this.items = resp.data.items;
      // this.total = resp.data.count;
      this.toasty.success(this.translate.instant('Created successfully!'));
      this.router.navigate(['/promotions/program_list']);

    })
    .catch(err => this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message)));
  }

  onChangePrioritize(event:any){
    this.item.isPriority ? this.checkPrioritize = false : this.checkPrioritize = true;
    this.item.isPriority ? "" : this.item.ordering = "";
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
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
