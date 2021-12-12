import { Component, OnInit, Input } from '@angular/core';
import { EventService } from '../services/event.service';
import { UtilService } from '../../shared/services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment/moment';
import { AwardModalComponent } from '../award-modal/award-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'award-listing',
  templateUrl: './listing.html'
})
export class AwardListingComponent implements OnInit {

  public isLoading = false;
  private loadingSubscription: Subscription;
  public items = [];
  public itemsInPage = [];
  /*maximum number items per page*/
  public number = 10;
  public page: number = 1;
  public total: number = 0;
  public searchFields: any = {
    username: '',
    code: '',
    startDate: '',
    toDate: '',
    productName: ''
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };

  public startTemDate: any;
  public toTemDate: any;

  constructor(
    private router: Router,
    private eventService: EventService,
    private toasty: ToastrService,
    private utilService: UtilService,
    private translate: TranslateService,
    private modalService: NgbModal
  ) {
    this.loadingSubscription = utilService.appLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit() {
    this.query();
  }

  query() {
    if (this.searchFields.startDate !== '' && this.searchFields.toDate !== '') {
      if (this.changeUTCDate() === 0) {
        return this.toasty.error(this.translate.instant('Start date must be less than end date!'));
      }
    }

    this.utilService.setLoading(true);

    this.eventService.getAwardList(Object.assign({
      page: this.page,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`
    }, this.searchFields))
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
        this.utilService.setLoading(false);
        this.settingDate();
        this.pageChange();
      })
      .catch(() => {
        this.toasty.error('Không thể tìm kiếm danh sách vui lòng thử lại!');
        this.utilService.setLoading(false);
        this.settingDate();
      });
  }

  settingDate() {
    if (this.startTemDate && this.toTemDate && this.searchFields.startDate && this.searchFields.toDate) {
      this.searchFields.startDate = { year: this.startTemDate.year(), month: this.startTemDate.month() + 1, day: this.startTemDate.date() };
      this.searchFields.toDate = { year: this.toTemDate.year(), month: this.toTemDate.month() + 1, day: this.toTemDate.date() };
    }
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

  changeUTCDate() {
    if (!this.startTemDate && !this.toTemDate) {
      this.startTemDate = moment().utc();
      this.toTemDate = moment().utc();
    }
    if (this.searchFields.startDate) {
      this.startTemDate
        .year(this.searchFields.startDate.year)
        .month(this.searchFields.startDate.month - 1)
        .date(this.searchFields.startDate.day);

      this.searchFields.startDate = this.startTemDate.startOf('day').toISOString();
    }

    if (this.searchFields.toDate) {
      this.toTemDate
        .year(this.searchFields.toDate.year)
        .month(this.searchFields.toDate.month - 1)
        .date(this.searchFields.toDate.day);

      this.searchFields.toDate = this.toTemDate.startOf('day').toISOString();
    }

    if (this.startTemDate > this.toTemDate) {
      return 0;
    }

    if (!this.searchFields.startDate || !this.searchFields.toDate) {
      this.searchFields.startDate = "";
      this.searchFields.toDate = ""
    }
  }

  exportCSV() {
    var exportData = [];
    var now = new Date();

    this.items.forEach(item => {
      var data = new Object({
        'Người trúng giải': item.username,
        'Mã vé': item.code,
        'Thứ tự trúng': item.orderNumber,
        'Miêu tả': item.description,
        'Ngày tạo': this.formatDateToString(item.createdAt),

      });
      if (item.shippingInfo) {
        data['Địa chỉ email'] = item.shippingInfo.email;
        data['Họ và tên'] = item.shippingInfo.name;
        data['Số điện thoại'] = item.shippingInfo.phoneNumber;
      }

      data['Sản phẩm'] = item.eventVoucher.eventProduct.product.name;
      
      if (item.shippingInfo) {
        data['Địa điểm giao hàng'] = item.shippingInfo.shippingType;
        data['Địa chỉ giao hàng'] = item.shippingInfo.streetAddress;
      }
      exportData.push(data);
    })
    this.eventService.exportAsExcelFile(exportData, 'winners-list-export-file-' + this.formatDateToString(now.toString()));
  }

  formatDateToString(current_datetime) {
    current_datetime = new Date(current_datetime);
    return current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear();
  }

  openDescriptionModal(winnerId) {
    if (winnerId != null) {
      const modalRef = this.modalService.open(AwardModalComponent, {
        size: 'lg',
        windowClass: 'modal-winner'
      });

      modalRef.componentInstance.winnerId = winnerId;
      modalRef.result.then(result => {
        if (result) {
          var updatedWinner = this.items.find(x => x._id == winnerId);
          updatedWinner.description = result;
        }
      });
    }
  }

  pageChange() {
    this.itemsInPage = this.items.slice((this.page - 1) * this.number, this.page * this.number);
  }
}
