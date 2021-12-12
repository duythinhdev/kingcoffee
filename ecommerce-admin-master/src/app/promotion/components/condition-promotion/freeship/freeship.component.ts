import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter, } from 'rxjs/operators';
import { PromotionFreeShipCondition } from '../../../../enums/promotion.enum';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { PromotionService } from '../../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
import { NgbDate, NgbCalendar, NgbDateParserFormatter,NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbTime } from '../../../../shared/models/time-picker.model';
import * as moment from 'moment';
// type State = {sap : string, name: string, id: string};
@Component({
  selector: 'freeship',
  templateUrl: './freeship.component.html',
  styleUrls: ['./freeship.component.scss'],

})
export class FreeShipComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public valueProduct: any;
  public product: any;
  public getAllProduct: any;
  public productGiven: any;
  public freeShipCondition:any;
  public arrProduct: any = [];
  public arrFreeShipCondition: any = [];
  public PromotionFreeShipCondition = PromotionFreeShipCondition;
  public category: any = '';
  public discountOrderPercent: number;
  public totalOrderPriceCondition: number;
  public tree: any = [];
  public titleCondition: any;
  public checkConditionFreeShip: boolean = false;
  public nameCondition: any;
  public keychange : any = {sap : "", name: ""};
  private typePromotion : string;
  public fromTime: NgbTime;
  public toTime: NgbTime;
  public fromDate: any;
  public toDate: any | null = null;
  public minDate: any = null;
  hoveredDate: NgbDate | null = null;
  public isEdit: boolean = false;
  @Input() checkEdit: any;
  @Input() valueUpdate: any;
  @Input() idUpdate: any;
  @Input() set funcPromotion(value: string) {
    this.typePromotion = value;
  }
  get funcPromotion(): string {
    return this.typePromotion;
  }
  
  @Output() valuePromotionPercent = new EventEmitter<object>();

  constructor(private promotionService: PromotionService, private toasty: ToastrService, private cdf: ChangeDetectorRef,
     public formatter: NgbDateParserFormatter,private calendar: NgbCalendar) {
  }

  ngOnInit() {
    let dateNow = new Date();
    let now = moment(dateNow).format('DD/MM/YYYY');
    this.minDate = this.showDate(now,"setMinDate");
    for (let i in this.PromotionFreeShipCondition) {
      this.arrFreeShipCondition.push(this.PromotionFreeShipCondition[i]);
    }
    this.promotionService.tree({isActive:true,isPromotion:false})
      .then(resp => (this.tree = this.promotionService.prettyPrint(resp.data)));
      if(this.checkEdit && this.idUpdate){
        this.isEdit = true;
      }
      if(this.valueUpdate && this.idUpdate){
        this.arrProduct = this.valueUpdate?.promotionProducts.map(item=>({ 
          category: item?.category?.name,
          name: item?.name,
          sap: item?.sap,
          id: item?.id
        }));
        this.discountOrderPercent = this.valueUpdate?.shippingPriceDiscount;
        this.freeShipCondition = this.valueUpdate?.applyType;
        this.totalOrderPriceCondition = this.valueUpdate?.totalOrderPriceCondition;
        let startDate = moment(this.valueUpdate?.applyStartDate).format("DD/MM/YYYY");
        let endDate = moment(this.valueUpdate?.applyEndDate).format("DD/MM/YYYY");
        this.fromDate = this.showDate(startDate,"noSet");
        this.toDate = this.showDate(endDate,"noSet");
        const dStartDate = moment(this.valueUpdate?.applyStartDate).toDate();
        this.fromTime = new NgbTime(dStartDate.getHours(), dStartDate.getMinutes());
        const dEndDate = moment(this.valueUpdate?.applyEndDate).toDate();
        this.toTime = new NgbTime(dEndDate.getHours(), dEndDate.getMinutes());
        this.changePromotionFreeShip();
      }
  }

  showDate(data,type:string) {
    let dd = data.split("/")[0].padStart(2, "0");
    let mm = data.split("/")[1].padStart(2, "0");
    let yyyy = data.split("/")[2].split(" ")[0];
    if(type == "setMinDate"){
      dd = parseInt(dd);
      mm = parseInt(mm);
      yyyy = parseInt(yyyy);
    }
    const valueDate: NgbDateStruct = { year: yyyy, month: mm, day: dd };
    return valueDate;
  }

  addProduct() {
    if(!this.category ){
      return this.toasty.error('Vui lòng chọn loại sản phẩm!');
    }
    if(!this.product ){
      return this.toasty.error('Chưa có sản phẩm nào, Vui lòng thử lại!');
    }
    if(this.category && !this.product?.id){
      for (let index = 0; index < this.getAllProduct.length; index++) {
        const checkArrExist = this.arrProduct.find(x=> x?.id == this.getAllProduct[index].id)
        if(!checkArrExist){
          this.arrProduct.push(this.getAllProduct[index]);
        }
      }
    }
    if(this.product?.id){
      const checkProductExist = this.arrProduct.find(x=> x?.id == this.product?.id);
        if(checkProductExist){
          this.keychange = {sap : "", name: ""};
          return this.toasty.error('Sản phẩm đã tồn tại');
        }else{
          this.keychange = {sap : "", name: ""};
          this.arrProduct.push(this.product);
        }
      }
    this.changePromotionFreeShip();
  }

  onCheckMoney(event: any) {
    if(event.target.value < 1000){
       return this.toasty.error('Giá tiền phải lớn hơn 1000đ');
    }else{
      this.toasty.clear();
    }
  }

  importProduct(event) {
    this.product = event;
  }

  importArrProduct(event){
    this.getAllProduct = event;
  }

  remove(index: number) {
    this.arrProduct.splice(index, 1);
    this.changePromotionFreeShip()
  }
  removeAllProduct() {
    this.arrProduct = [];
    this.changePromotionFreeShip();
  }
  changePromotionFreeShip(){
      let year = 0;
      let month = 0;
      let day = 0;
      let date = new Date();
      let startDate = '';
      let endDate = '';
      if (this.fromDate?.year && this.fromDate?.month && this.fromDate?.day) {
        year = this.fromDate?.year;
        month = this.fromDate?.month;
        day = this.fromDate?.day;
        if (month == 1) {
          month = 0;
        } else {
          month = month - 1;
        }
        date = new Date(year, month, day, this.fromTime ? this.fromTime.hour : 0, this.fromTime ? this.fromTime.minute : 0);
        startDate = moment(date).utc().format('HH:mm DD-MM-YYYY');
      }
  
      if (this.toDate?.year && this.toDate?.month && this.toDate?.day) {
        year = this.toDate?.year;
        month = this.toDate?.month;
        day = this.toDate?.day;
        if (month == 1) {
          month = 0;
        } else {
          month = month - 1;
        }
        date = new Date(year, month, day, this.toTime ? this.toTime.hour : 23, this.toTime ? this.toTime.minute : 59);
        endDate = moment(date).utc().format('HH:mm DD-MM-YYYY');
      }
      if(this.freeShipCondition == PromotionFreeShipCondition.currentOrder){
        this.checkConditionFreeShip = true;
        this.fromDate = null;
        this.toDate = null;
        this.fromTime = null;
        this.toTime = null;
        startDate = "";
        endDate = "";
      }else{
        this.checkConditionFreeShip = false;
      }
      const arrProducts = this.arrProduct.map(item=>item?.id)
      this.valuePromotionPercent.emit({
            totalOrderPriceCondition:this.totalOrderPriceCondition,
            shippingPriceDiscount: this.discountOrderPercent,
            applyType:this.freeShipCondition,
            applyStartDate: startDate,
            applyEndDate: endDate,
            promotionProducts: arrProducts
        })
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    this.changePromotionFreeShip();
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  formatTimePickerValue(value: NgbTime){
    if(value){
      return `${String('00' + value.hour).slice(-2)}:${String('00' + value.minute).slice(-2)} `;
    }else{
      return '';
    }
  }

  currencyInputChanged(value) {
    var num = value.replace(/[,]/g, "");
    return Number(num);
  }

  kd_checkNumber(event){
    if(!(event.which >= 48 && event.which <= 57 || event.which >= 96 && event.which <= 105) 
    && event.which != 8 && event.which != 46 && event.which != 37 && event.which != 39){
      event.preventDefault();
    }
  }
}
