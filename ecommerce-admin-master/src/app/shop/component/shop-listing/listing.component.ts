import { Component, OnInit, Input } from '@angular/core';
import { ShopService } from '../../services/shop.service';
import { UtilService } from '../../../shared/services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { ShopListTitle, ShopListTitleModel } from '../../../model/shop.list.title.model';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'shops-listing',
  templateUrl: './listing.html'
})
export class ShopListingComponent implements OnInit {

  public isLoading = false;
  private loadingSubscription: Subscription;
  public items = [];
  public page: number = 1;
  public total: number = 0;
  public searchFields: any = {
    activated: '',
    featured: '',
    verified: '',
    email: '',
    username: ''
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public owner: any = '';
  public searching: boolean = false;
  public searchFailed: boolean = false;
  shopListTitleModel: ShopListTitleModel;
  formatter = (x: {
    username: string
  }) => x.username;
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap((term) => {
        this.searchFields.username = term;
        return this.shopService.findOwner({
          username: term
        }).then((res) => {
          if (res) {
            this.searchFailed = false;
            this.searching = false;
            return res.data.items;
          }
          this.searchFailed = false;
          this.searching = false;
          return of([]);
        });
      })
    );

  constructor(
    private router: Router,
    private shopService: ShopService,
    private toasty: ToastrService,
    private utilService: UtilService,
    private translate: TranslateService
  ) {
    this.loadingSubscription = utilService.appLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit() {
    this.shopListTitleModel = ShopListTitle[0];
    this.query();
  }

  selectOwner(event: any) {
    this.owner = event.item;
    this.query();
  }

  query() {
    this.utilService.setLoading(true);
    if (this.owner) {
      if (this.owner._id) {
        this.searchFields.ownerId = this.owner._id;
      }
      // } else {
      //   return this.toasty.error(this.translate.instant('Can not find this owner, please enter another ownner'));
      // }
    }

    this.shopService.search(Object.assign({
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
        this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!');
        this.utilService.setLoading(false);
      });
  }

  onSearch() {
    this.page = 1;
    this.query();
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
}
