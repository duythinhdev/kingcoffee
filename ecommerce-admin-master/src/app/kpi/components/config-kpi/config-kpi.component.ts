import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../../config/service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'config-kpi',
  templateUrl: './config-kpi.html',
  styleUrls: ['./config-kpi.scss']
})
export class ConfigKpiComponent implements OnInit {
  public items : any;
  public kpi : any = [];
  constructor(
    private configService: ConfigService,
    private toasty: ToastrService,
    private translate: TranslateService
  ) {
  }
  ngOnInit() {
    this.query();
  }
  query() {
    this.configService.list()
      .then(resp =>{
        // this.items = resp.data.items;
        this.items = resp?.data?.items.find(x=>x.key == 'kpiConfig');
        this.kpi = this.items?.value;
       })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
  save(item: any) {
    let checkEmpty : boolean = true;
    let checkNegative : boolean = true;
    let checkLevelValue : boolean = false;
    let checkValuePercentValue : boolean = false;
    const valueKpiMonth = item?.value?.kpiMonth.map(x => {
      return { level : x.level, valuePercent: x.valuePercent}
    })
    // not allow value empty or 0
    for (let index = 0; index < valueKpiMonth.length; index++) {
      if(!valueKpiMonth[index].level || !valueKpiMonth[index].valuePercent){
        checkEmpty = false;
      }
    }
    for (let index = 0; index < valueKpiMonth.length; index++) {
      if(valueKpiMonth[index].level < 0 || valueKpiMonth[index].valuePercent < 0){
        checkNegative = false;
      }
    }
    if(!item?.value?.kpiReward){
      checkEmpty = false;
    }
    if(item?.value?.kpiReward < 0){
      checkNegative = false;
    }
    // check value ascending
    if(valueKpiMonth[0].level < valueKpiMonth[1].level){
      if(valueKpiMonth[1].level < valueKpiMonth[2].level){
        checkLevelValue = true;
      }
    }
    if(valueKpiMonth[0].valuePercent < valueKpiMonth[1].valuePercent){
      if(valueKpiMonth[1].valuePercent < valueKpiMonth[2].valuePercent){
        checkValuePercentValue = true;
      }
    }

    if(!checkEmpty){
      return this.toasty.error(this.translate.instant('KPIs configuration cannot be left blank and not zero'));
    }

    if(!checkNegative){
      return this.toasty.error(this.translate.instant('KPIs configuration cannot be negative'));
    }

    if(!checkLevelValue){
      return this.toasty.error(this.translate.instant('The value of the Expenditure Level should increase gradually'));
    }

    if(!checkValuePercentValue){
      return this.toasty.error(this.translate.instant('The value of the Bonus must increase gradually'));
    }

    this.configService.update(item._id, item.value)
      .then(() => this.toasty.success(this.translate.instant('Updated successfully!')))
      .catch(e => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }
}
