import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../services/shop.service';
import { Router, ActivatedRoute } from '@angular/router';
import {ShopUpdateListTitle, ShopUpdateListTitleModel } from '../../../model/shop.update.list.title.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'shop-update',
  templateUrl: './shop-update.html'
})
export class ShopUpdateComponent implements OnInit {
  shopUpdateListTitleModel: ShopUpdateListTitleModel;
  public isSubmitted = false;
  public shop: any = {};
  public tab: string = 'basic';

  constructor(private router: Router, private shopService: ShopService, private route: ActivatedRoute) {
    let id = route.snapshot.params.id;
    this.shopService.findOne(id).then(resp => {
      this.shop = resp.data;
    });
  }

  ngOnInit() {
    this.shopUpdateListTitleModel = ShopUpdateListTitle[0];
  }

  changeTab(tab: string) {
    this.tab = tab;
  }
}
