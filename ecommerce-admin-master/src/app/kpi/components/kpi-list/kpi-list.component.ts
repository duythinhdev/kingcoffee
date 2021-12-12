import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderStatusDescription } from '../../../enums/order.enum';
import { ReportSaleTitle, ReportSaleTitleModel} from '../../../model/report.sale.title.model';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { KpiService } from '../../kpi.service';
import { TranslateService } from '@ngx-translate/core';
import { IDatePickerConfig } from 'ng2-date-picker';

@Component({
  selector: 'kpi-list',
  templateUrl: './kpi-list.html',
  styles: [`
  :host ::ng-deep .dropdown-menu {
    transform: translate( 50%, 0) !important;
  }
  .form-group.hidden {
    width: 0;
    margin: 0;
    border: none;
    padding: 0;
  }
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  }
  .input-group-append{
    height: 38px;
  }
`]
})
export class KpiListComponent implements OnInit {
  reportSaleTitleModel: ReportSaleTitleModel;
  public createdAt: any = '';
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public OrderStatusDescription = OrderStatusDescription;
  public memberId : string = "";
  public orders: any = [];
  public page: number = 1;
  public take: number = 10;
  public total: number = 0;
  public startMonth: any = "";
  public endMonth: any = "";
  public searchFields: any = {
    name: ''
  };
  public dateFormat: string = 'MM-YYYY';
  public monthFormat: string = 'MM';
  public totalKPIMonth : number;
  public totalKPIReward : number;
  public totalPrice: number = 0;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public endMonthConfig: IDatePickerConfig = {
    format: this.dateFormat,
    monthBtnFormat:this.monthFormat,
    showGoToCurrent: true,
  };
  public startMonthConfig: IDatePickerConfig = {
    format: this.dateFormat,
    monthBtnFormat:this.monthFormat,
    showGoToCurrent: true,
  };
  hoveredDate: NgbDate | null = null;

  constructor(private router: Router, private toasty: ToastrService,public formatter: NgbDateParserFormatter,
    private calendar: NgbCalendar, private kpiService: KpiService, private translate: TranslateService) {
    // let getCurrentDay = calendar.getToday().day;
    //   if(getCurrentDay == 1){
    //     getCurrentDay = 0
    //   }else{
    //     getCurrentDay = getCurrentDay - 1
    //   }
      // this.fromDate = calendar.getPrev(calendar.getToday(), 'd', getCurrentDay);
      // this.toDate = calendar.getToday();
  }

  ngOnInit() {
    this.reportSaleTitleModel = ReportSaleTitle[0];
    this.query();
  }
  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }
  changePage() {
    // this.shops = this.shops.map((item, i) => ({id: i + 1, ...item}))
    // .slice((this.page - 1) * this.take, (this.page - 1) * this.take + this.take);

  }
  query() {
    // let date = new Date();
    // let startDate = "";
    // let endDate = "";
    // let year = 0;
    // let month = 0;
    // let day = 0;
    // if (this.fromDate) {
    //   if (this.fromDate.year && this.fromDate.month && this.fromDate.day) {
    //     year = this.fromDate.year;
    //     month = this.fromDate.month;
    //     day = this.fromDate.day;
    //     if (month == 1) {
    //       month = 12;
    //     } else {
    //       month = month - 1;
    //     }
    //     date = new Date(year, month, day)
    //     startDate = moment(date).format('YYYY-MM-DD');
    //   }
    // }
    // if (this.toDate) {
    //   if (this.toDate.year && this.toDate.month && this.toDate.day) {
    //     year = this.toDate.year;
    //     month = this.toDate.month;
    //     day = this.toDate.day;
    //     if (month == 1) {
    //       month = 12;
    //     } else {
    //       month = month - 1;
    //     }
    //     date = new Date(year, month, day)
    //     endDate = moment(date).format('YYYY-MM-DD');
    //   }
    // }
    const params = Object.assign({
      page: this.page,
      take: this.take,
      memberId:this.memberId,
      startMonth:this.startMonth,
      endMonth:this.endMonth,
    });
    this.kpiService.find(params).then((res) => {
      this.orders = res?.data?.items;
      this.total = res?.data?.count;
      this.totalKPIMonth = res?.data?.total?.totalKPIMonth;
      this.totalKPIReward = res?.data?.total?.totalKPIReward;
      this.orders.map((value,idx)=>{
        if(value?.month){
          value.month = value.month.replace("-", "/");
        }
      })
    })
      .catch(() => {
        this.toasty.error(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  getMinStartMonth(){
    this.endMonthConfig = {
      format: this.dateFormat,
      monthBtnFormat:this.monthFormat,
      min: moment().format(this.startMonth),
      showGoToCurrent: true,
    };
  }

  onSearch() {
    this.page = 1;
    this.query();
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
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

  printElem(elem:any)
{
    var mywindow = window.open('', 'PRINT', 'height=600,width=800');
    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body style="-webkit-print-color-adjust: exact;" >');
    mywindow.document.write('<h1>' + 'Cảm ơn quý khách đã đặt hàng tại WCD'  + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    // mywindow.close();

    return true;
}
}
