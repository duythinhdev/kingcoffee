import { Component, OnInit } from '@angular/core';
import { ListKpiService } from '../../services/listkpi.service';
import { ToastyService } from '../../services/toasty.service';

import * as moment from 'moment';

@Component({
  selector: 'kpi-list',
  templateUrl: './list-kpi.html',
})
export class KPIListComponent implements OnInit {
  currentKPI;
  mydate = '';
  idMember;
  items;
  TotalPrice: number;
  startMonth;
  page = 0;
  total = 10;
  totalKpiReward;
  totalKpiMonth;

  constructor(
    private listKpiService: ListKpiService,
    private toasty: ToastyService
  ) {}

  ngOnInit() {
    this.getCurrentKPI();
    this.query(undefined);
  }
  getCurrentKPI() {
    // call api getCurrentKPI
    this.listKpiService
      .getCurrentKPI()
      .then((res) => {
        this.currentKPI = res.data;
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
  query(infiniteScroll) {
    this.page += 1;
    if (this.mydate) {
      this.startMonth = moment(this.mydate).format('MM-YYYY');
    }
    const params = {
      page: this.page,
      take: 10,
      memberId: this.idMember ? this.idMember : '',
      startMonth: this.startMonth ? this.startMonth : '',
    };
    this.listKpiService
      .find(params)
      .then((resp) => {
        this.items = this.items
          ? this.items.concat(resp.data.items)
          : resp.data.items;
        this.totalKpiReward = resp.data.total.totalKPIReward;
        this.totalKpiMonth = resp.data.total.totalKPIMonth;
        this.total = resp.data.count;
        if (infiniteScroll) {
          infiniteScroll.complete();
        }
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  onSearch() {
    this.items = [];
    this.page = 0;
    this.query(undefined);
  }
}
