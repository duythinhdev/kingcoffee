import { Component, OnInit, Input } from '@angular/core';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'featured-products',
  templateUrl: 'featured-products.html'
})
export class FeaturedProductsComponent implements OnInit {
  @Input() options : {
    productId
  };
  items = [];
  page = 1;
  itemsPerPage = 6;
  searchFields = {};
  sort = 'createdAt';
  sortType = 'desc';
  isLoading = false;

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.query();
  }

  ngOnChanges() {
    this.query();
  }

  query() {
    if (this.options.productId) {
      this.relatedQuery();
    } else {
      this.featuredQuery();
    }
  }

  featuredQuery() {
    this.isLoading = true;
    const params = {
      page: this.page,
      take: this.itemsPerPage,
      sort: this.sort,
      sortType: this.sortType, ...this.options};

    this.productService.search(params).then((res) => {
      this.items = res.data.items;
      this.isLoading = false;
    });
  }

  relatedQuery() {
    this.isLoading = true;
    const params = {
      page: this.page,
      take: this.itemsPerPage
    };

    this.productService.related(this.options.productId, params).then((res) => {
      this.items = res.data;
      this.isLoading = false;
    });
  }
}
