import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Content } from 'ionic-angular';
import { RefundService } from '../../../../services';

@Component({
  templateUrl: './listing.html'
})
export class RefundListingComponent implements OnInit {
  @ViewChild('top') top: Content;
  public items = [];
  public page = 1;
  public take = 10;
  public total = 0;
  public searchFields = {
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public isLoading = false;
  public scrollHeight = 0;

  constructor(private refundService: RefundService, private zone: NgZone) {
  }

  ngOnInit() {
    this.query();
  }

  query() {
    this.isLoading = true;
    const params = Object.assign({
      page: this.page,
      take: this.take,
      sort: `${this.sortOption.sortBy}`,
      sortType: `${this.sortOption.sortType}`
    }, this.searchFields);

    this.refundService.list(params).then((res) => {
      this.items = res.data.items;
      this.total = res.data.count;
      this.isLoading = false;
    });
  }

  doInfinite(infiniteScroll) {
    this.isLoading = true;
    const params = Object.assign({
      page: this.page + 1,
      take: this.take
    }, this.searchFields);
    this.refundService.list(params).then((res) => {
      this.items = this.items.concat(res.data.items);
      this.total = res.data.count;
      this.isLoading = false;
      infiniteScroll.complete();
    })
  }

  loading(infiniteScroll) {
    setTimeout(function () {
      infiniteScroll.complete();
    }, 1000)
  }

  scrollTop() {
    this.top.scrollToTop();
  }

  onScroll($event) {
    this.zone.run(() => {
      this.scrollHeight = $event.scrollTop;
    });
  }


  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }
}
