import { Component, OnInit, Input } from '@angular/core';
import { EventService } from '../services/event.service';
import { UtilService } from '../../shared/services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
@Component({
  selector: 'buy-ticket-listing',
  templateUrl: './listing.html'
})
export class BuyTicketListingComponent implements OnInit {

  public isLoading = false;
  private loadingSubscription: Subscription;
  public items = [];
  public page: number = 1;
  public total: number = 0;
  public totalPrice: number = 0;
  public totalCommission: number = 0;
  public searchFields: any = {
    ownerName: '',
    parentName: '',
    sponsorName: '',
    code: '',
    isReward: '',
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public issueDocumentOptions: any;
  public issueDocument: any;

  constructor(
    private router: Router,
    private eventService: EventService,
    private toasty: ToastrService,
    private utilService: UtilService,
    private translate: TranslateService
  ) {
    this.loadingSubscription = utilService.appLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit() {
    this.query();
    this.getTotalInfo();
    this.issueDocumentOptions = {
      url: window.appConfig.apiBaseUrl + '/shops/register/document',
      fileFieldName: 'file',
      hintText: 'Chọn hoặc kéo thả tài liệu xác nhận ở đây',
      onFinish: (resp) => {
        this.issueDocument = resp.data;
      }
    };
  }

  query() {
    this.utilService.setLoading(true);

    this.eventService.search(Object.assign({
      page: this.page,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`
    }, this.searchFields))
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
        this.searchFields = {};
        this.utilService.setLoading(false);
      })
      .catch(() => {
        this.toasty.error('Không thể tìm kiếm danh sách vui lòng thử lại!');
        this.utilService.setLoading(false);
      });
  }

  // remove(itemId: any, index: number) {
  //   if (window.confirm('Bạn có muốn xóa không this item?')) {
  //     this.shopService.remove(itemId)
  //       .then(() => {
  //         this.toasty.success('Xóa thành công!');
  //         this.items.splice(index, 1);
  //       })
  //       .catch((err) => this.toasty.error(err.data.message || 'Có vấn đề hệ thống, Vui lòng thử lại!'));
  //   }
  // }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  exportCSV(){
    this.utilService.setLoading(true);

    var allItems = [];
    var exportData = [];
    var now = new Date();
    this.eventService.search(Object.assign({
      page: this.page,
      take: 10000,
    }, this.searchFields))
      .then(resp => {
        allItems = resp.data.items;

        if(allItems){
          allItems.forEach(item => {
            var data = new Object({
              'Người giới thiệu': item.sponsorName,
              'Cấp cha': item.parentName,
              'Người mua': item.ownerName,
              'Cấp': item.level,
              'Cấp dưới': item.numberChild,
              'Mã vé': item.code,
              'Ngày tạo': this.formatDateToString(item.createdAt)
            });
            exportData.push(data);
          })
          this.eventService.exportAsExcelFile(exportData, 'buy-ticket-list-export-file-' + this.formatDateToString(now.toString()));
        }
        else{
          this.toasty.error(this.translate.instant('Lấy danh sách mua vé bị lỗi, vui lòng thử lại!'));
        }

        this.utilService.setLoading(false);
      })


  }

  formatDateToString(current_datetime){
    current_datetime =  new Date(current_datetime);
    return current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " "
    + this.formatTime(current_datetime.getHours()) + ":" + this.formatTime(current_datetime.getMinutes()) + ":" + this.formatTime(current_datetime.getSeconds())
  }

  formatTime(time){
    var strTime = '0' + time;
    return strTime.slice(strTime.length-2, strTime.length);
  }

  getTotalInfo(){
    this.eventService.getTotalInfo().then(res => {
      if(res){
        this.totalCommission = res.data.totalCommission;
        this.totalPrice = res.data.totalPrice;
      }
    })
  }

  reSendEmail(item){
    if(item){
      this.utilService.setLoading(true);

      this.eventService.sendEmail({
        productId: item.productId,
        ownerName: item.ownerName,
        code: item.code
      })
      .then(resp => {
        if(resp){
          this.toasty.success(this.translate.instant('Gửi lại email thành công!'));
        }
        this.utilService.setLoading(false);
      })
      .catch(() => {
        this.toasty.error(this.translate.instant('Không thể gửi lại email, vui lòng thử lại!'));
        this.utilService.setLoading(false);
      });
    }else{
      this.toasty.error(this.translate.instant('Vui lòng chọn người mua vé để gửi lại email!'));
    }
  }
}
