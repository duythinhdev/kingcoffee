import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ReportSaleService } from '../../report.service';
import { ShopService } from '../../../shop/services/shop.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderStatusDescription } from '../../../enums/order.enum';
import { ReportSaleTitle, ReportSaleTitleModel} from '../../../model/report.sale.title.model';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';

import * as async from 'async';
import { PromotionForm } from '../../../enums/promotion.enum';
import { OrderService } from '../../../order/services/order.service';
import { UtilService } from '../../../shared/services';

@Component({
  selector: 'report-sale',
  templateUrl: './sale-report.html',
  styles: [`
  :host ::ng-deep .dropdown-menu {
    transform: translate( 9%, 0) !important;
  }
  .date-input-disable{
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
  .input-group-append{
    height: 38px;
  }
  .short-text{
    text-overflow: ellipsis;
    max-width: 150px;
    display: inline-block;
    vertical-align: bottom;
    overflow: hidden;
    white-space: nowrap;
  }
`]
})
export class SaleComponent implements OnInit {
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
  public memberId : any = "";
  public totalShops: Number = 0;
  public searchFields: any = {
    name: ''
  };
  public totalPrice: Number = 0;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public exportSaleList = [];
  hoveredDate: NgbDate | null = null;

  constructor(private router: Router, private reportService: ReportSaleService, 
    private toasty: ToastrService, public formatter: NgbDateParserFormatter, 
    private calendar: NgbCalendar, private orderService: OrderService,
    private utilService: UtilService) {
      let getCurrentDay = calendar.getToday().day;
      if(getCurrentDay == 1){
        getCurrentDay = 0
      }else{
        getCurrentDay = getCurrentDay - 1
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
    if(!isGetAll){
      this.shops = [];
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
        if (month == 1) {
          month = 0;
        } else {
          month = month - 1;
        }
        date = new Date(year, month, day);
        startDate = moment(date).format('YYYY-MM-DD');
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
        endDate = moment(date).format('YYYY-MM-DD');
      }
    }
    let param = {
      page: this.page,
      take: this.take,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`,
      memberId: this.memberId ? this.memberId : "",
      startDate: this.fromDate ? startDate : "",
      endDate: this.toDate ? endDate : "",
      isGetAll: isGetAll
    };
    this.reportService.saleStat(param).then(async (res) => {
      if(!isGetAll){
        for(const element of res.data.items){
          let index = 0;
          for(const detail of element.details){
            if (detail.promotions && detail.promotions.length > 0) {
              if (detail.promotions.length > 0) {
                detail.priceAfterPromo = 0;
                for (const itemPromo of detail.promotions) {
                  detail.priceAfterPromo += itemPromo.discountPrice;
                }
              }
              //Tách sản phẩm mua ưu đãi khỏi order detail
              let prom = detail.promotions.find(x => x.promotion ? x.promotion.promotionForm == PromotionForm.BuyGoodPriceProduct : false);
              element.totalExtraProduct = 0;
              if(prom){
                element.details.splice(index, 1);
                if(!element.extraProducts){
                  element.extraProducts = [];
                  element.extraProducts.push(detail);
                  element.totalExtraProduct = detail.totalPrice;
                }else{
                  element.extraProducts.push(detail);
                  element.totalExtraProduct += detail.totalPrice;
                }
              }
            }
  
            let totalShippingDiscountPrice = 0;
            if(!_.isEmpty(element.promotions)){
              element.freeShipList = element.promotions.filter(x => x.promotionOrder?.promotionForm === PromotionForm.FreeShip);
              totalShippingDiscountPrice = await  element.freeShipList.reduce((total, e) => total + (e.discountPrice ? e.discountPrice : 0), 0);
              element.promotions = element.promotions.filter(x => x.promotionOrder?.promotionForm !== PromotionForm.FreeShip);
            }
  
            element.shippingPrice +=  totalShippingDiscountPrice;
            
            index++;
          }
          this.shops.push(element);
        }
        this.totalShops = res.data?.count;
        this.totalPrice = res.data?.total;
      }
      else{
        this.utilService.setLoading(true);
        this.exportSaleList = res.data.items;
        this.exportExcel();
      }
    })
    .catch((err) => {
      return this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');
    });
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
      mywindow.document.write(document.getElementById(elem).innerHTML);
      mywindow.document.write('</body></html>');

      mywindow.document.close(); // necessary for IE >= 10
      mywindow.focus(); // necessary for IE >= 10*/

      mywindow.print();
      // mywindow.close();

      return true;
  }

  async exportExcel(){
    var now = new Date();
    let day: any;
    let month: any;
    let year: any;
    var allItems: any;
    var listProduct = [];
    var exportData = [];
    let totalPrice = 0;
    let vat = window.appConfig.vat;
    let priceWithoutVat = 0;
    for (let index = 0; index < this.exportSaleList.length; index++) {
      allItems = this.exportSaleList[index];
      listProduct = this.exportSaleList[index].details;
      if (listProduct && allItems) {
        let getRole = allItems?.customer?.userRoles.find(x => x.Role == 2);
        day = moment(allItems?.createdAt).date();
        month = moment(allItems?.createdAt).month();
        year = moment(allItems?.createdAt).year();
        listProduct.forEach(item => {
          totalPrice = item?.quantity * item?.unitPrice;
          priceWithoutVat = totalPrice / vat;
          if (item.promotions?.length > 0) {
            item.promotions.forEach(promotion => {
              if(promotion && promotion.promotionOrder){
                var data = new Object({
                  'Năm': year,
                  'Tháng': month == 12 ? month = 1 : month + 1,
                  'Ngày': day,
                  'Tỉnh/Thành': allItems?.city?.name,
                  'Mã HUBs': allItems?.senderId ? allItems?.senderId : "",
                  'Tên HUBs': allItems?.senderName ? allItems?.senderName : "",
                  'Trạng thái HUBs': allItems?.senderId ? "Hoạt động" : "",
                  'Mã Khách hàng': allItems?.customer?.memberId,
                  'Tên Khách hàng': allItems?.customer?.name,
                  'Loại khách hàng': getRole ? getRole?.RoleName : allItems?.customer?.userRoles[0]?.RoleName,
                  'Địa chỉ': allItems?.streetAddress,
                  'Điện thoại': allItems?.phoneNumber,
                  'Ngày đặt hàng': allItems?.createdAt ? moment(allItems?.createdAt).format('DD-MM-YYYY') : "",
                  'Ngày giao hàng': allItems?.expectedDeliveryDate ? moment(allItems?.expectedDeliveryDate).format('DD-MM-YYYY') : "",
                  'Mã đơn hàng': allItems?.orderCode,
                  'Mã sản phẩm': item?.product?.sap,
                  'Tên sản phẩm': item?.product?.name,
                  'Ngành hàng': item?.product?.category?.parentCategory?.name,
                  'Nhóm hàng': item?.product?.category?.name,
                  'Số lượng': item?.quantity,
                  'Đơn giá': item?.unitPrice,
                  'Tổng tiền (chưa VAT)': Math.round(priceWithoutVat * 100) / 100,
                  'Tổng tiền': totalPrice,
                  'Tiền khuyến mãi': promotion.discountPrice,
                  'CTKM': promotion?.promotionOrder?.code
                });
                exportData.push(data);
              }
            });
          } else {
            var data = new Object({
              'Năm': year,
              'Tháng': month == 12 ? month = 1 : month + 1,
              'Ngày': day,
              'Tỉnh/Thành': allItems?.city?.name,
              'Mã HUBs': allItems?.senderId ? allItems?.senderId : "",
              'Tên HUBs': allItems?.senderName ? allItems?.senderName : "",
              'Trạng thái HUBs': allItems?.senderId ? "Hoạt động" : "",
              'Mã Khách hàng': allItems?.customer?.memberId,
              'Tên Khách hàng': allItems?.customer?.name,
              'Loại khách hàng': getRole ? getRole?.RoleName : allItems?.customer?.userRoles[0]?.RoleName,
              'Địa chỉ': allItems?.streetAddress,
              'Điện thoại': allItems?.phoneNumber,
              'Ngày đặt hàng': allItems?.createdAt ? moment(allItems?.createdAt).format('DD-MM-YYYY') : "",
              'Ngày giao hàng': allItems?.expectedDeliveryDate ? moment(allItems?.expectedDeliveryDate).format('DD-MM-YYYY') : "",
              'Mã đơn hàng': allItems?.orderCode,
              'Mã sản phẩm': item?.product?.sap,
              'Tên sản phẩm': item?.product?.name,
              'Ngành hàng': item?.product?.category?.parentCategory?.name,
              'Nhóm hàng': item?.product?.category?.name,
              'Số lượng': item?.quantity,
              'Đơn giá': item?.unitPrice,
              'Tổng tiền (chưa VAT)': Math.round(priceWithoutVat * 100) / 100,
              'Tổng tiền': totalPrice,
              'Tiền khuyến mãi': "",
              'CTKM': "",
            });
            exportData.push(data);
          }
        })
        if (allItems.promotions?.length > 0) {
          allItems.promotions.forEach(promotion => {
            var data = new Object({
              'Năm': year,
              'Tháng': month == 12 ? month = 1 : month + 1,
              'Ngày': day,
              'Tỉnh/Thành': allItems?.city?.name,
              'Mã HUBs': allItems?.senderId ? allItems?.senderId : "",
              'Tên HUBs': allItems?.senderName ? allItems?.senderName : "",
              'Trạng thái HUBs': allItems?.senderId ? "Hoạt động" : "",
              'Mã Khách hàng': allItems?.customer?.memberId,
              'Tên Khách hàng': allItems?.customer?.name,
              'Loại khách hàng': getRole ? getRole?.RoleName : allItems?.customer?.userRoles[0]?.RoleName,
              'Địa chỉ': allItems?.streetAddress,
              'Điện thoại': allItems?.phoneNumber,
              'Ngày đặt hàng': allItems?.createdAt ? moment(allItems?.createdAt).format('DD-MM-YYYY') : "",
              'Ngày giao hàng': allItems?.expectedDeliveryDate ? moment(allItems?.expectedDeliveryDate).format('DD-MM-YYYY') : "",
              'Mã đơn hàng': allItems?.orderCode,
              'Mã sản phẩm': "",
              'Tên sản phẩm': "",
              'Ngành hàng': "",
              'Nhóm hàng': "",
              'Số lượng': "",
              'Đơn giá': "",
              'Tổng tiền (chưa VAT)': Math.round(priceWithoutVat * 100) / 100,
              'Tổng tiền': totalPrice,
              'Tiền khuyến mãi': promotion.discountPrice,
              'CTKM': promotion?.promotionOrder?.code
            });
            exportData.push(data);
          });
        }
      }
    }
    this.orderService.exportAsExcelFile(exportData, 'Danh-sách-bán-hàng' + this.formatDateToString(now.toString()));

    this.utilService.setLoading(false);
  }

  formatDateToString(current_datetime) {
    current_datetime = new Date(current_datetime);
    return current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " "
      + this.formatTime(current_datetime.getHours()) + ":" + this.formatTime(current_datetime.getMinutes()) + ":" + this.formatTime(current_datetime.getSeconds())
  }
  
  formatTime(time) {
    var strTime = '0' + time;
    return strTime.slice(strTime.length - 2, strTime.length);
  }
}
