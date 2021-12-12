import { Component } from '@angular/core';
import { pick } from 'lodash';
import { ReviewService, ToastyService } from '../../../services';
import { TranslateService } from '@ngx-translate/core';
import { ViewController } from "ionic-angular";

@Component({
  selector: 'review-edit',
  templateUrl: './edit.html'
})
export class ReviewEditComponent {
  review : {
    _id
    comment
  };
  hovered: number;

  constructor(private translate: TranslateService, private toasty: ToastyService,
    private reviewService: ReviewService, public viewCtrl: ViewController) {
    const reviewId = this.viewCtrl.data.reviewId;
    this.reviewService.findOne(reviewId).then(resp => {
      this.review = resp.data;
    })
      .catch(() => this.toasty.error('Something went wrong, please try again.'));
  }

  submit() {
    if (!this.review.comment) {
      return this.toasty.error(this.translate.instant('Invalid form, please recheck again.'));
    }

    const data = pick(this.review, ['comment', 'rating']);
    this.reviewService.update(this.review._id, data)
      .then(async resp => {
        await this.toasty.success('Updated successfully!');
        return this.viewCtrl.dismiss(resp.data);
      })
      .catch(() => this.toasty.error(this.translate.instant('Something went wrong, please try again.')));
  }
}
