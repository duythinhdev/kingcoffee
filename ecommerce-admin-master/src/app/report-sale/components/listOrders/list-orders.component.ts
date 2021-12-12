import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {ReportSaleService} from '../../report.service';
import {ShopService} from '../../../shop/services/shop.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {OrderStatusDescription} from '../../../enums/order.enum';
import {ReportSaleTitle, ReportSaleTitleModel} from '../../../model/report.sale.title.model';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

import {OrderService} from '../../../order/services/order.service';
import {UtilService} from '../../../shared/services';

@Component({
  selector: 'list-orders',
  templateUrl: './list-orders.html',
  styles: [`
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

    .custom-day.range,
    .custom-day:hover {
      background-color: rgb(2, 117, 216);
      color: white;
    }

    .custom-day.faded {
      background-color: rgba(2, 117, 216, 0.5);
    }

    .input-group-append {
      height: 38px;
    }

    .scrollbar {
      height: 15px;
      width: 100%;
      background: #fff;
      overflow-x: scroll;
      overflow-y: hidden;
      position: fixed;
      margin-bottom: 25px;
      bottom: 20px;
      left: 0;
      z-index: 9999;
    }

    .force-overflow {
      width: 25000px;
      height: 1px;
    }

    .scrollbar-primary::-webkit-scrollbar {
      width: 12px;
      background-color: #F5F5F5;
    }

    .scrollbar::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
      background-color: #4285F4;
    }
    .scrollcity{
      height: 300px;
      overflow-y: auto;
    }
  `]
})
export class ListOrdersComponent implements OnInit {
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
  public phoneNumber: any = '';
  public firstName: any = '';
  public sap: any = '';
  public totalShops: Number = 0;
  public searchFields: any = {
    name: ''
  };
  public totalPrice: Number = 0;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public fromDate1: NgbDate;
  public toDate1: NgbDate | null = null;
  public exportList = [];
  hoveredDate: NgbDate | null = null;
  public sort = 'createdAt';
  public desc = 'desc';
  public couponCodes = [];
  public string2 = '';
  public ids = '';
  public formatMoney: any = '';
  public formatDateTime: any = '';
  public RolestatusList: any[] = ['',1, 2, 5];
  public RolesStatus: number = this.RolestatusList[0];
  public rolesNameStatusList: string[] = ["Role All","We", "We Home", "We Member"];
  public rolesNameStatus: string = this.rolesNameStatusList[0];
  public strBuList: string[] = ['',"MT", "GT", "KCF","G7"];
  public strBu: string = this.strBuList[0];
  public strbuStatusList: string[] = ["BU","MT", "GT", "KCF","G7"];
  public strbuStatus: string = this.strbuStatusList[0];
  public citystatusList:any[] = ['',64, 65, 66, 67, 68,69,70,71,72,73,74, 75, 76, 77, 78,79
    ,80, 81, 82, 83, 87, 84, 85, 86 , 88 , 89, 90 ,91,92, 121, 93, 96, 94,95,97,98,99,100,101,
    102, 105, 103, 104, 106 ,107,108,109,111,110, 112, 113, 114,115, 118,119,120,122,116,123,117,124,125,126];
  public citystatus: number = this.citystatusList[0];
  public cityNameStatusList: string[] =
    ['Tỉnh Thành Phố',"An Giang","Bà Rịa – Vũng Tàu","Bạc Liêu","Bắc Giang","Bắc Kạn","Bắc Ninh","Bến Tre","Bình Dương",
    "Bình Định","Bình Phước","Bình Thuận","Cà Mau","Cao Bằng","Cần Thơ","Đà Nẵng",
    "Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp","Hà Nội", "Gia Lai", "Hà Giang",
    "Hà Nam","Hà Tĩnh","Hải Dương","Hải Phòng","Hậu Giang","Hòa Bình",
    "Hồ Chí Minh","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu",
    "Lạng sơn","Lào Cai","Lâm Đồng","Long An","Nam Định","Nghệ An","Ninh Bình",
    "Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La",
    "Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên - Huế","Tiền Giang","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"];
  public cityNameStatus: string = this.cityNameStatusList[0];
  public filter: boolean = false;
  public orderstatus: string = 'scanned';

  @ViewChild('mainScrollBlock', {static: false}) mainScrollBlock: ElementRef;
  @ViewChild('simulatorScrollBlock', {static: false}) simulatorScrollBlock: ElementRef;

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

  query(isGetAll: any = false) {
    if (!isGetAll) {
      this.shops = [];
    }
    this.formatMoney = new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'});
    this.formatDateTime = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    let date = new Date();
    let startDate = '';
    let endDate = '';
    let year = 0;
    let month = 0;
    let day = 0;
    if (this.fromDate) {
      if (this.fromDate.year && this.fromDate.month && this.fromDate.day) {
        year = this.fromDate.year;
        month = this.fromDate.month;
        day = this.fromDate.day;
        if (month == 1) {
          month = 0;
        } else {
          month = month - 1;
        }
        date = new Date(year, month, day);
        startDate = moment(date).format('DD-MM-YYYY');
      }
    }
    if (this.toDate) {
      if (this.toDate.year && this.toDate.month && this.toDate.day) {
        year = this.toDate.year;
        month = this.toDate.month;
        day = this.toDate.day;
        if (month == 1) {
          month = 0;
        } else {
          month = month - 1;
        }
        date = new Date(year, month, day);
        endDate = moment(date).format('DD-MM-YYYY');
      }
    }
    let paramsOrdergetALl: any;
       paramsOrdergetALl = {
         sort: this.sort,
         sortType: this.desc,
         orderCode: '',
         memberId: this.memberId ? this.memberId : "",
         startDate: this.fromDate ? startDate : '',
         endDate: this.toDate ? endDate : '',
         docNo: '',
         sortDocNo: null,
         paymentStatus: '',
         orderStatus: this.orderstatus ? this.orderstatus : '',
         we_id: this.RolesStatus ? this.RolesStatus : '',
         bu: this.strBu ? this.strBu :  '',
         cityId: this.citystatus ?  this.citystatus : '',
         phoneNumber: this.phoneNumber ? this.phoneNumber : '',
         username: this.firstName ?  this.firstName : '',
         sap: this.sap ? this.sap : ''
       }
    this.reportService.getAllOrder(paramsOrdergetALl).then((res) => {
      if (!isGetAll) {
        console.log('resgetAllOrder', res.data);
        this.itemsData = res.data.items.slice((this.page - 1) * this.take, (this.page - 1) * this.take + this.take);
        this.totalShops = res.data.count;
      } else {
        this.utilService.setLoading(true);
        this.exportList = res.data.items;
        this.exportExcel();
      }
    })
      .catch((err) => {
        return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');
      });
  }
  sortRolesStatus(paymentStatus, str) {
    this.RolesStatus = paymentStatus;
    this.rolesNameStatus = str;
    this.query();
  }
  sortBravoCode(sortBravoCode, str) {
    this.strBu = sortBravoCode;
    this.strbuStatus = str;
    this.query();
  }
  sortCity(citystatus,str){
    this.citystatus = citystatus;
    this.cityNameStatus = str;
    this.query();
  }
  onSearch() {
    this.filter = true;
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
    this.query();
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

  printElem(elem: any) {
    var mywindow = window.open('', 'PRINT', 'height=600,width=800');
    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('</head><body style="-webkit-print-color-adjust: exact;" >');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    // mywindow.close();

    return true;
  }
  onFilter(){
    this.query();
  }
  async exportExcel() {
    var now = new Date();
    let day: number;
    let month: number;
    let year: number;
    var allItems: any;
    var exportData = [];
    let indexExcel = 0;
    for (let index = 0; index < this.exportList.length; index++) {
      allItems = this.exportList[index];
      if (allItems) {
        day = moment(allItems?.createdAt).date();
        month = moment(allItems?.createdAt).month();
        year = moment(allItems?.createdAt).year();
        indexExcel = index + 1;
        let userRoles: string = '';
        var userRolesWeMember: string = '';
        let couponCodes: string = '';
        let fullname: string = '';
        let fullAddress: string = '';
        fullname = allItems?.firstName + ' ' + allItems?.lastName;
        fullAddress = allItems?.streetAddress + ',' + allItems?.ward.name + ',' + allItems?.district.name + ',' + allItems?.city.name;
        allItems.customer.userRoles.map(res => {
          if (res.RoleName === '5') {
            userRoles = 'We Member';
            userRolesWeMember += userRoles;
          }
          userRoles += res.RoleName + `,`;
        });
        if (allItems.couponCode) {
          allItems.couponCode.map(res => {
            couponCodes += res.id + ',';
          });
        }
        var data = new Object({
          'Năm': year,
          'Tháng': month == 12 ? month = 1 : month + 1,
          'Ngày': day,
          'STT': indexExcel,
          'Mã Định Danh': allItems?.customer?.memberId ? allItems?.customer?.memberId : '',
          'Loại Hình': userRolesWeMember ? userRolesWeMember : userRoles,
          'Họ Và Tên': fullname ? fullname : '',
          'Ngày Sinh': allItems?.customer?.birthday ? moment(allItems?.customer?.birthday).format('DD-MM-YYYY') : 'Không có',
          'CMT/Passport': 'Không có',
          'Số Điện Thoại': allItems?.phoneNumber ? allItems?.phoneNumber : '',
          'Email': allItems?.customer?.email ? allItems?.customer?.email : '',
          'Tỉnh / Thành Phố': allItems?.city.name ? allItems?.city.name : '',
          'Quận / Huyện': allItems?.district.name ? allItems?.district.name : '',
          'Phường xã': allItems?.ward.name ? allItems?.ward.name : '',
          'Địa Chỉ': fullAddress ? fullAddress : '',
          'Mã Sp(đã quét)': allItems?.details[0].product.sap,
          'Tên Sp(đã quét)': allItems?.details[0].product.name,
          'BU(từ Kênh nào': allItems?.bu ? allItems?.bu : 'Không Có',
          'Tổng đơn hàng': new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(allItems?.totalPrice)
            ? new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(allItems?.totalPrice) : '',
          'Ngày tạo đơn (ngày quét QR)': allItems?.createdAt ? moment(allItems?.createdAt).format('DD-MM-YYYY') : '',
          'Mã Dự Thưởng': couponCodes ? couponCodes : 'Không Có',
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

  onScroll(event) {
    this.mainScrollBlock.nativeElement.scrollLeft =
      this.simulatorScrollBlock.nativeElement.scrollLeft *
      (this.mainScrollBlock.nativeElement.scrollWidth / this.mainScrollBlock.nativeElement.clientWidth) /
      (this.simulatorScrollBlock.nativeElement.scrollWidth / this.simulatorScrollBlock.nativeElement.clientWidth) / 2.75 * (1920 / window.innerWidth);
  }
}
