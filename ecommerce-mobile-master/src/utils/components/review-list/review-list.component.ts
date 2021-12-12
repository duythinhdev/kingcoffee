import { Component, Input, OnInit } from '@angular/core';
import { ReviewService, AuthService } from '../../../services';
import { ReviewEditComponent } from '../../components';
import { ModalController } from 'ionic-angular';

@Component({
  selector: 'review-list',
  templateUrl: './list.html',
})
export class ReviewListComponent implements OnInit {
  @Input() options;
  page = 1;
  pageSize = 10;
  items = [];
  total = 0;
  loading = true;
  currentUserId = '';
  constructor(
    private reviewService: ReviewService,
    private modalService: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.query();
    if (this.authService.isLoggedin()) {
      return this.authService.getCurrentUser().then((res) => {
        this.currentUserId = res._id;
      });
    }
  }

  query() {
    this.reviewService
      .search({
        page: this.page,
        take: this.pageSize,
        ...this.options,
      })
      .then((res) => {
        this.loading = false;
        this.items = res.data.items;
        this.total = res.data.count;
      });
  }

  loadMore() {
    this.page = this.page + 1;
    this.reviewService
      .search({
        page: this.page,
        take: this.pageSize,
        ...this.options,
      })
      .then((res) => {
        this.items = this.items.concat(res.data.items);
      });
  }
  
  onRating(event) {
    this.items.unshift(event);
    this.total += 1;
  }

  update(item, i) {
    const modalRef = this.modalService.create(ReviewEditComponent, {
      reviewId: item._id,
    });
    modalRef.present();
    modalRef.onDidDismiss((result) => {
      if (result._id) {
        this.items[i] = result;
      }
    });
  }
}
