import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../services/shop.service';
import { UserService } from '../../../user/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { ShopCreateTitle, ShopCreateTitleModel} from '../../../model/shop.create.title.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shop-create',
  templateUrl: './form.html'
})
export class ShopCreateComponent implements OnInit {

  public isSubmitted = false;
  public shop: any = {};
  public verificationIssue: any = {};
  public owner: any;
  public searching: boolean = false;
  public searchFailed: boolean = false;
  shopCreateTitleModel: ShopCreateTitleModel;
  formatter = (x: { username: string, email: string }) => x.username + ' (' + x.email + ' )';
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>

        this.userService.search({ username: term, isShop: 0 }).then((res) => {
          if (res) {
            this.searchFailed = false;
            this.searching = false;
            return res.data.items;
          }
          this.searchFailed = true;
          this.searching = false;
          return of([])
        })
      )
    );

  constructor(private router: Router, private shopService: ShopService, private userService: UserService, private toasty: ToastrService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.shopCreateTitleModel = ShopCreateTitle[0];
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error(this.translate.instant('Invalid form, please check and try again!'));
    }
    if (this.owner) {
      if (!this.owner._id) {
        return this.toasty.error(this.translate.instant('Please find the available owner in the system'));
      }
      this.shop.ownerId = this.owner._id;
    } else if (!this.owner) {
      return this.toasty.error(this.translate.instant('Please select Owner'));
    }
    if (!this.shop.verificationIssueId) {
      return this.toasty.error(this.translate.instant('Please select verification Issue'));
    }
    this.shopService.create(this.shop).then(resp => {
      this.toasty.success(this.translate.instant('Created successfuly!'));
      this.router.navigate(['/shops/update', resp.data._id]);
    })
    .catch((err) =>{
      this.toasty.error(this.translate.instant(err.error.code == 422 ? err.error.data.details[0].message : err.error.message))
    });
  }

  selectVerificationIssue(data: any) {
    this.shop.verificationIssueId = data._id;
    this.verificationIssue = data;
  }
}
