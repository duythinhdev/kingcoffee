import { Component, OnInit, Input } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ErrorTitle, ErrorTitleModel } from '../../model/error.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'reviews-listing',
  templateUrl: './listing.html'
})
export class ReviewsComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  @Input() product: any;
  public items = [];
  public page: number = 1;
  public total: number = 0;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };

  constructor(private router: Router, private reviewService: ReviewService,
    private toasty: ToastrService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.errorTitleModel =  ErrorTitle[0];
    this.query();
  }

  query() {
    this.reviewService.search({
      productId: this.product._id,
      page: this.page,
      sort: `${this.sortOption.sortBy}`,
      sortType:  `${this.sortOption.sortType}`
    })
      .then(resp => {
        this.items = resp.data.items;
        this.total = resp.data.count;
      })
      .catch(() => alert('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  remove(itemId: any, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      this.reviewService.remove(itemId)
        .then(() => {
          this.toasty.success(this.translate.instant(this.errorTitleModel.deletesucess));
          this.items.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

}
