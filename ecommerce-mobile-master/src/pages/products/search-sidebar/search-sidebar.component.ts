import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'search-sidebar',
  templateUrl: './search-sidebar.html',
})
export class SearchSidebarComponent {
  @Output() updateFields = new EventEmitter();
  searchFields: {
    featured?: boolean;
    hot?: boolean;
    bestSell?: boolean;
    dailyDeal?: boolean;
    discounted?: boolean;
    soldOut?: boolean;
  };
  filterAll = false;

  filter(type, value: boolean) {
    if (type === 'all') {
      this.searchFields = {
        featured: false,
        hot: false,
        bestSell: false,
        dailyDeal: false,
        discounted: false,
        soldOut: false,
      };
    } else if (type === 'featured') {
      this.searchFields = {
        featured: value,
      };
    } else if (type === 'hot') {
      this.searchFields = {
        hot: value,
      };
    } else if (type === 'bestSell') {
      this.searchFields = {
        bestSell: value,
      };
    } else if (type === 'dailyDeal') {
      this.searchFields = {
        dailyDeal: value,
      };
    } else if (type === 'discounted') {
      this.searchFields = {
        discounted: value,
      };
    } else if (type === 'soldOut') {
      this.searchFields = {
        soldOut: value,
      };
    }
    this.updateFields.emit(this.searchFields);
  }
}
