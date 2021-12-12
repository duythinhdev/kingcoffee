import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReviewService, AuthService } from '../../../services';
import { AlertController } from 'ionic-angular';
import { isNil, pick } from 'lodash';

@Component({
  selector: 'review-card',
  templateUrl: './review.html'
})
export class ReviewComponent implements OnInit {
  @Input() options;
  @Output() onRating = new EventEmitter();
  hovered: number;
  review = {
    comment: '',
    rating: 3
  };
  params;
  currentUser;
  isLoggedin = false;
  submitted = false;
  canReview = false;
  checkReview = false;

  constructor(private reviewService: ReviewService, private auth: AuthService, private alertCtrl: AlertController) {
    if (auth.isLoggedin()) {
      this.isLoggedin = true;
    }
  }

  ngOnInit() {
    // check review allowable or not
    const query = pick(this.options, ['type', 'productId', 'shopId']);
    if (this.auth.isLoggedin()) {
    this.reviewService.canReview(query)
      .then(resp => this.canReview = resp.data.canReview);
      this.reviewService.checkReview(this.options.type, (this.options.shopId ? this.options.shopId : this.options.productId))
        .then(resp => {
          if (resp.data) {
            this.checkReview = true;
          }
        });
      }
  }

  submit(frm) {
    this.submitted = true;

    if (frm.invalid || !isNil(this.review.comment)) {
      const alert = this.alertCtrl.create({
        title: '',
        subTitle: 'Vui lòng viết bình luận',
        buttons: [{
          text: 'Ok',
          cssClass: 'confirm-btn'
        }]
      });
      return alert.present();
    }
    if (!this.auth.isLoggedin()) {
      const alert = this.alertCtrl.create({
        title: '',
        subTitle: 'Hãy đăng nhập để đánh giá sản phẩm này.',
        buttons: [{
          text: 'Ok',
          cssClass: 'confirm-btn'
        }]
      });
      return alert.present();
    }

    this.reviewService.create({...this.review, ...this.options}).then((resp) => {
      this.review = {
        comment: '',
        rating: 3
      };
      this.onRating.emit(resp.data);
      this.submitted = false;
      this.checkReview = true;
    })
      .catch(err => {
        throw err;
      });
  }
}
