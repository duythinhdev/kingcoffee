import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {ReportSaleService} from '../../report.service';
import {ShopService} from '../../../shop/services/shop.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {OrderStatusDescription} from '../../../enums/order.enum';
import {ReportSaleTitle, ReportSaleTitleModel} from '../../../model/report.sale.title.model';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';

import * as async from 'async';
import {PromotionForm} from '../../../enums/promotion.enum';
import {OrderService} from '../../../order/services/order.service';
import {UtilService} from '../../../shared/services';

@Component({
  selector: 'list-spinner',
  templateUrl: './list-spinner.html',
  styles: [`
    :host ::ng-deep .dropdown-menu {
      transform: translate(9%, 0) !important;
    }

    .date-input-disable {
      background-color: #ffffff;
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

    .input-group-append {
      height: 38px;
    }

    .short-text {
      text-overflow: ellipsis;
      max-width: 150px;
      display: inline-block;
      vertical-align: bottom;
      overflow: hidden;
      white-space: nowrap;
    }
  `]
})
export class ListSpinnerComponent implements OnInit {
  reportSaleTitleModel: ReportSaleTitleModel;
  public createdAt: any = '';
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public OrderStatusDescription = OrderStatusDescription;
  public shops: any = [];
  public itemsData: any = [];
  public page: any = 1;
  public take: any = 10;
  public memberId: any = '';
  public totals: Number = 0;
  public searchFields: any = {
    name: ''
  };
  public totalPrice: Number = 0;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public exportSaleList = [];
  hoveredDate: NgbDate | null = null;
  public sort = 'createdAt';
  public desc = 'desc';
  constructor(private router: Router, private reportService: ReportSaleService,
              private toasty: ToastrService, public formatter: NgbDateParserFormatter,
              private calendar: NgbCalendar, private orderService: OrderService,
              private utilService: UtilService) {
    let getCurrentDay = calendar.getToday().day;
    if (getCurrentDay == 1) {
      getCurrentDay = 0;
    } else {
      getCurrentDay = getCurrentDay - 1;
    }
    this.fromDate = calendar.getPrev(calendar.getToday(), 'd', getCurrentDay);
    this.toDate = calendar.getToday();
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
  async handlePageChange(isGetAll: any = false) {
    let paramsuser: any = {
      page: this.page,
      take: this.take
    };
    this.reportService.getAllUser(paramsuser).then((res) => {
      console.log('res.data.count', res.data);
      if (!isGetAll) {
        this.itemsData = res.data.items;
        this.totals = res.data.count;
      } else {
        this.reportService.getAllUserExportExcel().then(response=>{
          this.utilService.setLoading(true);
          this.exportSaleList = response.data.items;
          this.exportExcel();
        })
      }
    }).catch((err) => {
      return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');
    });
  }

  async query(isGetAll: any = false) {
    let paramsuser: any = {
      page: this.page,
      take: this.take
    };
      this.reportService.getAllUser(paramsuser).then((res) => {
        console.log('res.data.count', res.data);
        if (!isGetAll) {
          this.itemsData = res.data.items;
          this.totals = res.data.count;
        } else {
          this.reportService.getAllUserExportExcel().then(response =>{
            this.utilService.setLoading(true);
            this.exportSaleList = response.data.items;
            this.exportExcel();
          }).catch((err) => {
            return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');

          })
        }
      }).catch((err) => {
        return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');
      })
  }

  async exportExcel() {
    var now = new Date();
    let day: number;
    let month: number;
    let year: number;
    var allItems: any;
    var exportData = [];
    let vat = window.appConfig.vat;
    let wheelSpinnedResult = '';
    for (let index = 0; index < this.exportSaleList.length; index++) {
      allItems = this.exportSaleList[index];
      let userRoles: string = '';
      var userRolesWeMember: string = '';
      allItems.userRoles.map(res =>{
        if(res.RoleName === '5')
        {
          userRoles = 'We Member';
          userRolesWeMember += userRoles;
        }
        userRoles += res.RoleName + `,`
      })
      if (allItems) {
        day = moment(allItems?.createdAt).date();
        month = moment(allItems?.createdAt).month();
        year = moment(allItems?.createdAt).year();
        switch (allItems?.wheelSpinned)
        {
          case 'QT1':
          case 'QT2':
          case 'QT3':
            wheelSpinnedResult = 'Xe máy điện Vinfast Impes';
            break;
          case 'QT5':
            // balo
            wheelSpinnedResult = 'Balo';
            break;
          case 'QT4':
            // quat
            wheelSpinnedResult = 'Mũ Bảo Hiểm';
            break;
          case 'QT6':
            // tui xach
            wheelSpinnedResult = 'Túi xách';
            break;
          case 'QT7':
            // voucher 500k
            wheelSpinnedResult = 'Voucher WE4.0 500k';
            break;
          case 'QT8':
            // voucher 100k
            wheelSpinnedResult = 'Voucher WE4.0 100k';
            break;
          case 'QT10':
            // chuc ban may man
            wheelSpinnedResult = 'Chúc Bạn May Mắn lần sau';
            break;
          default :
              wheelSpinnedResult = "không có"
            break;
        }
        var data = new Object({
          'Năm': year,
          'Tháng': month == 12 ? month = 1 : month + 1,
          'Ngày': day,
          'Mã Thành Viên': allItems?.memberId ?  allItems?.memberId  : "",
          'Tên Tài Khoản': allItems?.username ? allItems?.username  : "",
          'Số Điện Thoại': allItems?.phoneNumber ? allItems?.phoneNumber : "",
          'Địa Chỉ': allItems?.address ? allItems?.address : "",
          'Tên Người Dùng': allItems?.name ? allItems?.name : '',
          'Email Người Dùng ': allItems?.email ? allItems?.email : '',
          'Ngày Tạo ': allItems?.createdAt ? moment(allItems?.createdAt).format('DD-MM-YYYY') : '',
          'Role ': userRolesWeMember ?  userRolesWeMember :  userRoles ,
          'Kết Quả Quay Thưởng': wheelSpinnedResult ? wheelSpinnedResult : "",
          'Coupon Codes': allItems.couponCodes.length > 0 ?  allItems.couponCodes[0].code : "không có"
        });
        exportData.push(data);
      }
    }
    this.orderService.exportAsExcelFile(exportData, 'Danh-sách-mã-dự-thưởng' + this.formatDateToString(now.toString()));

    this.utilService.setLoading(false);
  }

  formatDateToString(current_datetime) {
    current_datetime = new Date(current_datetime);
    return current_datetime.getDate() + '/' + (current_datetime.getMonth() + 1) + '/' + current_datetime.getFullYear() + ' '
      + this.formatTime(current_datetime.getHours()) + ':' + this.formatTime(current_datetime.getMinutes()) + ':' + this.formatTime(current_datetime.getSeconds());
  }

  formatTime(time) {
    var strTime = '0' + time;
    return strTime.slice(strTime.length - 2, strTime.length);
  }
}
