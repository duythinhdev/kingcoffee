import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PromotionStatus } from '../../../enums/promotion.enum';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PromotionService } from '../../services/promotion.service';
import {NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ErrorTitle, ErrorTitleModel } from '../../../model/error.title.model';
import * as moment from 'moment';
import { NgbTime } from '../../../shared/models/time-picker.model';

@Component({
  selector: 'program-listing',
  templateUrl: './program-listing.component.html',
  styleUrls: ['./program-listing.component.scss']
})
export class ProgramListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public items = [];
  public page: any = 1;
  public take: any = 10;
  public total: any = 0;
  public code: any = '';
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };

  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public fromTime: NgbTime;
  public toTime: NgbTime;

  hoveredDate: NgbDate | null = null;
  constructor(private router: Router,private toasty: ToastrService, private translate: TranslateService, 
    private promotionService: PromotionService,public formatter: NgbDateParserFormatter,private calendar: NgbCalendar ) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    this.query();
  }

  query() {
    let date = new Date();
    let startDate = "";
    let endDate = "";
    let year = 0;
    let month = 0;
    let day = 0;
    let dateNow = new Date();
    let now = moment(dateNow).format('YYYY-MM-DD')
    if (this.fromDate) {
      if (this.fromDate.year && this.fromDate.month && this.fromDate.day) {
        year = this.fromDate.year;
        month = this.fromDate.month;
        day = this.fromDate.day;
        month == 1 ? month = 0 : month = month-1;
        date = new Date(year, month, day, this.fromTime ? this.fromTime.hour : 0, this.fromTime ? this.fromTime.minute : 0);
        startDate = moment(date).utc().format('HH:mm DD-MM-YYYY');
      }
    }
    if (this.toDate) {
      if (this.toDate.year && this.toDate.month && this.toDate.day) {
        year = this.toDate.year;
        month = this.toDate.month;
        day = this.toDate.day;
        month == 1 ? month = 0 : month = month-1;
        date = new Date(year, month, day, this.toTime ? this.toTime.hour : 23, this.toTime ? this.toTime.minute : 59);
        endDate = moment(date).utc().format('HH:mm DD-MM-YYYY');
      }
    }
    const params: object = {
      page: this.page,
      take: this.take,
      code: this.code,
      startDate: this.fromDate ? startDate : '',
      endDate: this.toDate ? endDate : '',
      // sort: `${this.sortOption.sortBy}`,
      // sortType: `${this.sortOption.sortType}`,
    }
    this.promotionService.find(params)
      .then(resp => {
        this.items = resp.data.items;
        // this.items.map((value,idx)=>{
        //   if(value?.isPriority){
        //     this.items[idx].ordering = 'Prioritize';
        //   }
        // })
        // this.items.map((value,idx)=>{
        //   if(value?.startDate && value?.endDate){
        //     startDate = moment(value?.startDate).format('YYYY-MM-DD');
        //     endDate = moment(value?.endDate).format('YYYY-MM-DD');
        //     if(moment(now).isBefore(startDate)){
        //       this.items[idx].status = PromotionStatus.new;
        //     }else if(moment(now).isAfter(startDate) && moment(now).isBefore(endDate)){
        //       this.items[idx].status = PromotionStatus.running;
        //     }else if(moment(now).isAfter(endDate)){
        //       this.items[idx].status = PromotionStatus.finish;
        //     }else if(now == endDate || now == startDate){
        //       this.items[idx].status = PromotionStatus.running;
        //     }
        //   }
        // })
        this.total = resp.data.count;
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  remove(itemId: any, status: string, active: boolean ,index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      if(status == PromotionStatus.running && active) return alert("Chương trình đang hoạt động. Bạn không được phép xóa")
      this.promotionService.delete(itemId)
        .then(() => {
          this.query()
          this.toasty.success(this.translate.instant('Delete Success'));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }
  edit(status : string, id: any){
    // if(status == PromotionStatus.running) return alert("Chương trình đang hoạt động. Bạn không được phép sửa")
    this.router.navigate(['promotions/program_update/'+id]);
  }
  stop(id:any){
    if (window.confirm(this.translate.instant('Do you want to stop running programs?'))) {
      this.promotionService.stop(id)
      .then(() => {
        this.toasty.success(this.translate.instant('Stop success'));
        this.query();
      })
      .catch((err) => this.toasty.error(this.translate.instant(err.data.message)));
    }
  }
  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  onSearch() {
    this.page = 1;
    this.query();
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


