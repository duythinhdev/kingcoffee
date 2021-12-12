import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderListingTitle, OrderListingTitleModel } from '../../../model/orders.listing.title.model';
import * as _ from 'lodash';
import { OrderStatusDescription } from '../../../enums/order.enum';
import * as moment from 'moment';
import { WalletDescription } from '../../../enums/wallet.enum';
import { UserRoles } from '../../../enums/userRoles.enum';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from '../../../shared/services';
import { BravoService } from '../../services/bravo.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DocStatusEnum, DocStatusDesEnum } from '../../../enums/bravo.enum';
interface PeriodicElement {
  id: number;
  code: string;
  name: string;
  phoneNumber: string;
  address: string;
}
@Component({
  selector: 'order-modal',
  templateUrl: './orderModal.html',
})
export class OrderModal implements OnInit {
  radioSelected: string;
  public idHub: any;
  public areaPromotion:any = [];
  public keyword = "";
  dataSource: MatTableDataSource<PeriodicElement>;
  displayedColumns: string[] = ["id",'code', 'name','phoneNumber', 'address'];
  @ViewChild('paginatorPos') paginator: MatPaginator;

  @Input() public orderId;
  @Input() public cityId;
  @Input() public detailOrder;
  @Input() public promotions;
  @Input() public checkAssign;
  constructor(private orderService: OrderService, private toasty: ToastrService,
    private modalService: NgbModal, private translate: TranslateService, private utilService: UtilService) {
  }

  ngOnInit() {
    this.query();
  }

  query(){
    this.orderService.getListHub(this.keyword).then((res) => {
      this.dataSource = new MatTableDataSource<PeriodicElement>(res.data);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.paginator.pageIndex = 0;
      }, 0);
    })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  closeRefreshOrder() {
    this.modalService.dismissAll();
  }

  onItemChange(item) {
    if (item) {
      this.idHub = item;
    }
  }

  refreshOrder() {
    if (!this.idHub?.id || !this.orderId) {
      this.toasty.error(this.translate.instant('Please choose HUBs code'));
    } else {
      this.utilService.setLoading(true);
      const param = {
        toHubId: this.idHub?.id
      }
      const paramAssign = {
        fromHubId: this.idHub?.id.toString()
      }
      const checkDetailOrder = this.detailOrder.find(x => x.promotions?.length > 0);
      if(this.promotions && this.promotions.length !=0){
        for (let x = 0; x < this.promotions.length; x++) {
          if(this.promotions[x].promotionOrder && this.promotions[x].promotionOrder.areaApply){
            for (let y = 0; y < this.promotions[x].promotionOrder.areaApply.length; y++) {
              this.areaPromotion.push(this.promotions[x].promotionOrder.areaApply[y].id);
            }
          };
        }
      }

      for (let x = 0; x < this.detailOrder.length; x++) {
        if(this.detailOrder[x]?.promotions && this.detailOrder[x]?.promotions.length != 0){
          for (let y = 0; y < this.detailOrder[x]?.promotions.length; y++) {
            for (let z = 0; z < this.detailOrder[x]?.promotions[y]?.promotionOrder?.areaApply.length; z++) {
                this.areaPromotion.push(this.detailOrder[x]?.promotions[y]?.promotionOrder?.areaApply[z]?.id);
            }
          }
        }
      }
      const getUnique = Array.from(new Set(this.areaPromotion));
      const checkProvinceAll = getUnique.find(x=>x == -1);
      const findProvince = getUnique.find(x=>x== this.idHub?.provinceId)
      if (this.promotions && this.promotions.length || checkDetailOrder) {
        if (findProvince || this.idHub.code == "HUB-TNI" || checkProvinceAll) {
          if(this.checkAssign){
            this.orderService.assignHub(this.orderId, paramAssign).then((res) => {
              if (res.code === 200) {
                this.toasty.success(this.translate.instant('Order successfully transferred.'));
              }
              window.location.reload();
              this.modalService.dismissAll();
              this.utilService.setLoading(false);
            })
              .catch((err) => {
                this.toasty.error(this.translate.instant(err.data.message));
                this.modalService.dismissAll();
                this.utilService.setLoading(false);
              });
          }else{
            this.orderService.reassignHub(this.orderId, param).then((res) => {
              if (res.data.isSuccess == 1) {
                this.toasty.success(this.translate.instant('Order successfully transferred.'));
              }
              window.location.reload();
              this.modalService.dismissAll();
              this.utilService.setLoading(false);
            })
              .catch((err) => {
                this.toasty.error(this.translate.instant(err.data.message));
                this.modalService.dismissAll();
                this.utilService.setLoading(false);
              });
          }
        }
        else {
          this.modalService.dismissAll();
          this.utilService.setLoading(false);
          return this.toasty.error(this.translate.instant('HUB is not in the promotion area!'));
        }
      }
      else {
        if(this.checkAssign){
          this.orderService.assignHub(this.orderId, paramAssign).then((res) => {
            if (res.code === 200) {
              this.toasty.success(this.translate.instant('Order successfully transferred.'));
            }
            window.location.reload();
            this.modalService.dismissAll();
            this.utilService.setLoading(false);
          })
            .catch((err) => {
              this.toasty.error(this.translate.instant(err.data.message));
              this.modalService.dismissAll();
              this.utilService.setLoading(false);
            });
        }else{
          this.orderService.reassignHub(this.orderId, param).then((res) => {
            if (res.data.isSuccess == 1) {
              this.toasty.success(this.translate.instant('Order successfully transferred.'));
            }
            window.location.reload();
            this.modalService.dismissAll();
            this.utilService.setLoading(false);
          })
            .catch((err) => {
              this.toasty.error(this.translate.instant(err.data.message));
              this.modalService.dismissAll();
              this.utilService.setLoading(false);
            });
        }
      }
    }
  }
}

@Component({
  selector: 'order-listing',
  templateUrl: './listing.html',
  entryComponents: [OrderModal],
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  public orders = [];
  public excel = [];
  public page: any = 1;
  public pageHub: Number = 1;
  public take: any = 10;
  public total: Number = 0;
  public totalHub: Number = 5;
  public trackingCode: any = '';
  public orderCode: any = '';
  public memberId: any = '';
  public createdAt: any = '';
  public expectedDeliveryDate: any = '';
  public paymentStatusList: string[] = ["All", "success", "pending", "fail"];
  public paymentStatus: string = this.paymentStatusList[0];
  public strPaymentStatusList: string[] = ["Tất cả", "Thành công", "Đang chờ", "Thất bại"];
  public strPaymentStatus: string = this.strPaymentStatusList[0];
  public strSortDocNoList: string[] = ["Tất cả", "Có BravoCode", "Không BravoCode"];
  public strSortDocNo: string = this.strSortDocNoList[0];
  public bravoCode: string = '';
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public cancelId: any = '';
  public reasonCancel: any = '';
  public requiredReason: any = '';
  public modalCancel: any;
  public OrderStatusDescription = OrderStatusDescription;
  public WalletDescription = WalletDescription;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public DocStatusEnum = DocStatusEnum;
  public DocStatusDesEnum = DocStatusDesEnum;

  @ViewChild('mainScrollBlock', {static: false}) mainScrollBlock: ElementRef;
  @ViewChild('simulatorScrollBlock', {static: false}) simulatorScrollBlock: ElementRef;
  // @ViewChild('getDataBravoBtn',{static: false}) getDataBravoBtn!: ElementRef;

  hoveredDate: NgbDate | null = null;
  orderListingTitleModel: OrderListingTitleModel;
  constructor(private router: Router, private orderService: OrderService, private toasty: ToastrService, public formatter: NgbDateParserFormatter,
    private modalService: NgbModal, private utilService: UtilService, private translate: TranslateService, private calendar: NgbCalendar,
    private bravoService: BravoService) {
    let getCurrentDay = calendar.getToday().day;
    if (getCurrentDay == 1) {
      getCurrentDay = 0
    } else {
      getCurrentDay = getCurrentDay - 1
    }
    this.fromDate = calendar.getPrev(calendar.getToday(), 'd', getCurrentDay);
    this.toDate = calendar.getToday();
  }

  ngOnInit() {
    this.orderListingTitleModel = OrderListingTitle[0];
    this.query();
  }


  query() {
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
        date = new Date(year, month, day)
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
        date = new Date(year, month, day)
        endDate = moment(date).format('DD-MM-YYYY');
      }
    }
    // page: this.page,
    // take: this.take,
    let params = {
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`,
      // trackingCode: this.trackingCode,
      orderCode: this.orderCode ? this.orderCode : "",
      memberId: this.memberId ? this.memberId : "",
      startDate: this.fromDate ? startDate : "",
      endDate: this.toDate ? endDate : "",
      docNo: this.bravoCode && this.strSortDocNo !== this.strSortDocNoList[2] ? this.bravoCode: "",
      sortDocNo: this.strSortDocNo == this.strSortDocNoList[0] ? null : (this.strSortDocNo === this.strSortDocNoList[1] ? true : false),
      paymentStatus: this.paymentStatus == 'All' ? '' : this.paymentStatus
    };

    this.orderService.findAll(params).then(async (res) => {
      this.orders = res.data.items.map((item, i) => ({ id: i + 1, ...item }))
        .slice((this.page - 1) * this.take, (this.page - 1) * this.take + this.take);
      this.excel = res.data.items;
      this.total = res.data.count;
      await this.getDataFromBravo();
    })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  async changePage() {
    this.orders = this.excel.map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.page - 1) * this.take, (this.page - 1) * this.take + this.take);

    await this.getDataFromBravo();
  }

  onSearch() {
    this.page = 1;
    this.query();
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

  sortPaymentStatus(paymentStatus, str) {
    this.paymentStatus = paymentStatus;
    this.strPaymentStatus = str;
    this.query();
  }

  sortBravoCode(sortBravoCode, str) {
    this.strSortDocNo = str;
    this.query();
  }

  checkCancel(transaction, orderStatus) {
    if (transaction?.paymentGateway == "cod") {
      if (transaction?.status == "pending") {
        return true;
      }else if (orderStatus == "ordered" || orderStatus == "confirmed" || orderStatus == "processing") {
        return true;
      }
    } else {
      return false;
    }
  }
  checkAccept(roles, isConfirmOrderHub, orderStatus) {
    if (roles && roles.userRoles) {
      let userRole = roles.userRoles.map(x => x.Role);
      if (userRole.includes(UserRoles.HUB) && !isConfirmOrderHub && orderStatus == "ordered") {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  confirmAccept(orderId) {
    const confirmAlert = confirm(this.translate.instant('Do you want to confirm this order ?'));
    if (confirmAlert && orderId) {
      this.utilService.setLoading(true);
      this.orderService.acceptDelivery(orderId).then((res) => {
        if (res.code == 200) {
          this.query();
          this.toasty.success(this.translate.instant('Updated successfully!'));
        }
        this.utilService.setLoading(false);
      })
        .catch((err) => {
          this.toasty.error(this.translate.instant(err.data.message));
          this.utilService.setLoading(false);
        });
    } else {
      return false;
    }
  }
  checkRefresh(isDeliveryReject, senderId, orderStatus) {
    if (orderStatus != "canceled") {
      // if(isDeliveryReject || senderId == null){
      if (isDeliveryReject) {
        return true;
      }
    } else {
      return false;
    }
  }
  checkAsign(isAssignHub,orderStatus){
    if (isAssignHub === false && orderStatus != "failOrdered") {
        return true;
    } else {
      return false;
    }
  }
  showModalCancel(content, id) {
    this.cancelId = id;
    this.modalCancel = this.modalService.open(content, { centered: true });
  }
  cancelOrder() {
    if (!this.reasonCancel) {
      this.requiredReason = "Please enter the reason for the cancellation";
    } else {
      this.utilService.setLoading(true);
      this.orderService.cancel(this.cancelId, { reasonCancel: this.reasonCancel }).then((res) => {
        if (res.code == 200) {
          this.toasty.success(res.message);
          this.query();
        }
        this.reasonCancel = "";
        this.modalCancel.close();
        this.utilService.setLoading(false);
      })
        .catch((err) => {
          this.reasonCancel = "";
          this.modalCancel.close();
          this.toasty.error(this.translate.instant(err.data.message));
          this.utilService.setLoading(false);
        })
    }
  }
  showModalRefresh(orderId, cityId, detailOrder, promotions) {
    const modalRefresh = this.modalService.open(OrderModal, { centered: true,size:'xl' });
    modalRefresh.componentInstance.orderId = orderId;
    modalRefresh.componentInstance.cityId = cityId;
    modalRefresh.componentInstance.detailOrder = detailOrder;
    modalRefresh.componentInstance.promotions = promotions;
    modalRefresh.componentInstance.checkAssign = false;
  }

  showModalAssign(orderId, cityId, detailOrder, promotions){
    const modalRefresh = this.modalService.open(OrderModal, { centered: true,size:'xl' });
    modalRefresh.componentInstance.orderId = orderId;
    modalRefresh.componentInstance.cityId = cityId;
    modalRefresh.componentInstance.detailOrder = detailOrder;
    modalRefresh.componentInstance.promotions = promotions;
    modalRefresh.componentInstance.checkAssign = true;
  }

  checkOrderToExcel() {
    this.utilService.setLoading(true);
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
    for (let index = 0; index < this.excel.length; index++) {
      allItems = this.excel[index];
      listProduct = this.excel[index].details;
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
    this.orderService.exportAsExcelFile(exportData, 'Danh-sách-đơn-hàng-' + this.formatDateToString(now.toString()));

    this.utilService.setLoading(false);
  }

  exportExcel(id) {
    this.utilService.setLoading(true);

    var allItems = [];
    var exportData = [];
    var now = new Date();
    this.orderService.findOne(id).then((resp) => {
      allItems = resp.data.details;
      if (allItems) {
        allItems.forEach(item => {
          var data = new Object({
            'ItemCode (Mặt hàng)': item?.product?.sap,
            'Description (Tên hàng hóa, dịch vụ)': item?.product?.name,
            'Unit (Đơn vị tính)': item?.product?.unitSalePrice,
            'Quy cách (để trống)': "",
            'RequestDate (ngày giao)': moment(resp?.data?.expectedDeliveryDate).format('DD-MM-YYYY'),
            'Kênh bán hàng': "WCD",
            'Loại hình kênh': "",
            'Quantity (số lượng)': item?.quantity,
            'Đơn giá': item.unitPrice,
            'Thành tiền': item.totalPrice,
            'Tỷ lệ chiết khấu': "",
            'Thành tiền chiếc khấu': "",
            'Mã chương trình % ': "",
          });
          exportData.push(data);
        })
        this.orderService.exportAsExcelFile(exportData, 'Chi-tiết-đơn-hàng-' + this.formatDateToString(now.toString()));
      }
      else {
        this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');
      }

      this.utilService.setLoading(false);
    })
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

  sendOrderDataToBravo(order){
    if(!order.docNo){
      if(order){
        this.utilService.setLoading(true);
        this.bravoService.sendOrderDataToBravo({orderId: order._id})
        .then(async res => {
          this.utilService.setLoading(false);
          if(res && res.data){
            order.docNo = res.data.docNo;
            order.bizDocId = res.data.bizDocId;
            await this.getDataFromBravo();
          }
        })
        .catch(err => {
          this.utilService.setLoading(false);
          order.docNo = -1;
          this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message));
        });
      }
      else{
        this.toasty.error(this.translate.instant("Order not found!"));
      }
    }
  }

  async getDataFromBravo(){
    await this.bravoService.clearSession();
    await this.bravoService.getAuth();
    //this.getDataBravoBtn.nativeElement.classList.add('rotate');
    for(const order of this.orders){
      if(order.docNo && order.docNo != -1 && !order.bravo){
        this.bravoService.getDataFromBravo({
          bizDocId: order.bizDocId,
          docNo: order.docNo
        })
        .then(res => {
          // this.getDataBravoBtn.nativeElement.classList.remove('rotate');
          if(res && res.data && !_.isEmpty(res.data.Table)){
            order.bravo = res.data.Table[0];
            const orderInAll = this.excel.find(x => x.docNo === res.data.Table[0].DocNo);
            orderInAll.bravo = res.data.Table[0];
          }
        })
        .catch(err => {
          // this.getDataBravoBtn.nativeElement.classList.remove('rotate');
          // this.toasty.error(this.translate.instant(err.error.message));
        });
      }
    }
  }

  onScroll(event){
    this.mainScrollBlock.nativeElement.scrollLeft =
    this.simulatorScrollBlock.nativeElement.scrollLeft *
    (this.mainScrollBlock.nativeElement.scrollWidth / this.mainScrollBlock.nativeElement.clientWidth) /
    (this.simulatorScrollBlock.nativeElement.scrollWidth / this.simulatorScrollBlock.nativeElement.clientWidth) / 2.75 * (1920 / window.innerWidth);
  }
}

