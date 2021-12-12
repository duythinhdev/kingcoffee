import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ErrorTitle, ErrorTitleModel } from '../../../model/error.title.model';
import { PromotionForm, PromotionStatus } from '../../../enums/promotion.enum';
import { Router } from '@angular/router';
import { PromotionService } from '../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
@Component({
  selector: 'promotion-listing',
  templateUrl: './promotion-listing.component.html',
  styleUrls: ['./promotion-listing.component.scss']
})
export class PromotionListingComponent implements OnInit {
  errorTitleModel: ErrorTitleModel;
  public promotionEnum = PromotionForm;
  public promotionForms = [];
  public promotionList : any = [];
  public page: any = 1;
  public take: any = 10;
  public total: any = 0;
  public code: any = '';
  public promotionForm: string = "";
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  constructor(private router: Router,private toasty: ToastrService,private promotionService: PromotionService,
    private translate: TranslateService ) {
  }

  ngOnInit() {
    this.errorTitleModel = ErrorTitle[0];
    for (let i in this.promotionEnum) {
      this.promotionForms.push(this.promotionEnum[i]);
  }
    this.query();
  }

  query(){
    let dateNow = new Date();
    let startDate = "";
    let endDate = "";
    let now = moment(dateNow).format('YYYY-MM-DD')

    
    const params: object = {
      page: this.page,
      take: this.take,
      code: this.code,
      // sort: `${this.sortOption.sortBy}`,
      // sortType: `${this.sortOption.sortType}`,
      promotionForm: this.promotionForm
    }
    this.promotionService.findPromotion(params)
      .then(resp => {
        this.promotionList = resp.data.items;
        this.total = resp.data.count;
        // this.promotionList.map((value,idx)=>{
        //   if(value?.startDate && value?.endDate){
        //     startDate = moment(value?.startDate).format('YYYY-MM-DD');
        //     endDate = moment(value?.endDate).format('YYYY-MM-DD');
        //     if(moment(now).isBefore(startDate)){
        //       this.promotionList[idx].status = PromotionStatus.new;
        //     }else if(moment(now).isAfter(startDate) && moment(now).isBefore(endDate)){
        //       this.promotionList[idx].status = PromotionStatus.running;
        //     }else if(moment(now).isAfter(endDate)){
        //       this.promotionList[idx].status = PromotionStatus.finish;
        //     }else if(now == endDate || now == startDate){
        //       this.promotionList[idx].status = PromotionStatus.running;
        //     }
        //   }
        // })
      })
      .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  }

  keyPress(event: any) {
    if (event.charCode === 13) {
      this.query();
    }
  }

  onSearch() {
    this.page = 1;
    this.query();
  }

  remove(itemId: any, status: string, active: boolean, index: number) {
    if (window.confirm(this.translate.instant(this.errorTitleModel.deletetitle))) {
      if(status == PromotionStatus.running && active) return alert("Khuyến mãi đang hoạt động. Bạn không được phép xóa")
      this.promotionService.deletePromotion(itemId)
        .then(() => {
          this.query();
          this.toasty.success(this.translate.instant('Delete Success'));
          this.promotionList.splice(index, 1);
        })
        .catch((err) => this.toasty.error(this.translate.instant(err.data.message || this.errorTitleModel.deleteunsucess)));
    }
  }

  edit(status : string, id: any){
    // if(status == PromotionStatus.starting) return alert("Khuyến mãi đang hoạt động. Bạn không được phép sửa")
    this.router.navigate(['/promotions/update/'+id]);
  }

  stop(id:any){
    if (window.confirm(this.translate.instant('Do you want to stop running programs?'))) {
      this.promotionService.stopPromotion(id)
      .then(() => {
        this.toasty.success(this.translate.instant('Stop success'));
        this.query();
      })
      .catch((err) => this.toasty.error(this.translate.instant(err.data.message)));
    }
  }

}

