import { Component, OnInit } from '@angular/core';
import { ProductListingComponent } from '../products';
import { ToastyService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { isNil, isNull } from 'lodash';
import { NotificationService } from '../../services/notification.service';
import { NavController, NavParams } from 'ionic-angular';
import { NotificationDetailComponent } from '../notification-detail/notification-detail.component';

@Component({
  selector: 'app-notification',
  templateUrl: 'notification.html',
})
export class NotificationComponent implements OnInit {
  listPromotion = [];
  listNew = [];
  total = 0;
  totalNews = 0;
  id;
  isLoading = false;
  tabtnoti = true;
  tabnew = false;
  params = {
    take: 5,
    page: 1,
    type: 'promotionNotification',
  };
  params_all = {
    take: 5,
    page: 1,
    type: 'all',
  };
  constructor(
    private toasty: ToastyService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    public nav: NavController,
  ) {
    this.notificationService.numberNotifications$.subscribe(()=> {
      if(!isNil(this.id)) {
        for(const item of this.listPromotion) {
          if(item._id === this.id) {
            item.isRead = true;
          }
        }
        for(const item of this.listNew) {
          if(item._id === this.id) {
            item.isRead = true;
          }
        }
      }
    })

  }

  async ngOnInit() {
    await this.query();
  }
  async query() {
    this.isLoading = true;
    this.params.page = 1;
    this.notificationService
      .getListNotification(this.params)
      .subscribe((res) => {
        this.isLoading = false;
        this.listPromotion = res.data.items.map((item) => {
          if (item.body.length >= 90) {
            item = {
              ...item,
              body: item.body.slice(0, 90) + '...',
            };
          }
          return item;
        });
        this.total = res.data.count;
      })

    this.notificationService
      .getListNotification(this.params_all)
      .subscribe((res) => {
        this.isLoading = false;
        this.listNew = res.data.items.map((item) => {
          if (item.body.length >= 90) {
            item = {
              ...item,
              body: item.body.slice(0, 90) + '...',
            };
          }
          return item;
        });
        this.totalNews = res.data.count;
      })

  }
  async doInfinitePromotion(event) {
    this.params.page += 1;
    this.notificationService
      .getListNotification(this.params)
      .subscribe((res) => {
        this.isLoading = false;
        this.listPromotion = this.listPromotion.concat(res.data.items);
        this.total = res.data.count;
        event.complete();
      })
  }
  async doInfinitePromotionAll(event) {
    this.params.page += 1;
    this.notificationService
      .getListNotification(this.params_all)
      .subscribe((res) => {
        this.isLoading = false;
        this.listNew = this.listNew.concat(res.data.items);
        this.totalNews = res.data.count;
        event.complete();
      })
  }
  goTo(state,id) {
    if (state === 'notification-detail') {
      this.id = id;
      return this.nav.push(NotificationDetailComponent,id);
    }
    if (state === 'notification-new') {
      this.id = id;
      return this.nav.push(NotificationDetailComponent,id);
    }
  }

  async changeTab(tabaction){
    if(tabaction == 'new'){
      this.tabtnoti = true;
      this.tabnew = false;
    }
    else{
      this.tabnew = true;
      this.tabtnoti = false;
    }
  }
}
