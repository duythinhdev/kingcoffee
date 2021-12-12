import { Component, OnInit, Input } from '@angular/core';
import { RefundService } from '../../refund.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RefundTitle, RefundTitleModel} from '../../../model/refund.title.model';
@Component({
  selector: 'refund-listing',
  templateUrl: './listing.html'
})
export class ListingComponent implements OnInit {
  public items = [];
  public page: Number = 1;
  public take: Number = 10;
  public total: Number = 0;
  public searchFields: any = {
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  refundTitleModel: RefundTitleModel;
  constructor(private router: Router, private refundService: RefundService, private toasty: ToastrService) {
  }

  ngOnInit() {
    this.refundTitleModel = RefundTitle[0];
    this.query();
  }

  query() {
    this.refundService.search(Object.assign({
      page: this.page,
      take: this.take,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`
    }, this.searchFields))
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

}
