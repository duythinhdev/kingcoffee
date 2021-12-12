import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter, } from 'rxjs/operators';
import { PromotionConditionType } from '../../../../enums/promotion.enum';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { PromotionService } from '../../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
// type State = {sap : string, name: string, id: string};
@Component({
  selector: 'promotion-cart',
  templateUrl: './promotion-cart.component.html',
  styleUrls: ['./promotion-cart.component.scss'],

})
export class PromotionCartComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public valueProduct: any;
  public product: any;
  public getAllProduct: any;
  public productGiven: any;
  public arrProduct: any = [];
  public category: any = '';
  public discountOrderPercentOrCash: number;
  public conditionType:any = 'percent';
  public arrPromotionConditionType: any = [];
  public PromotionConditionType = PromotionConditionType;
  public unitType : string = "%";
  public checkValueQuantity = false;
  public totalOrderPriceCondition: number;
  public tree: any = [];
  public titleCondition: any;
  public nameCondition: any;
  public keychange : any = {sap : "", name: ""};
  private typePromotion : string;
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
  
  @Output() valuePromotionCart = new EventEmitter<object>();

  constructor(private promotionService: PromotionService, private toasty: ToastrService, private cdf: ChangeDetectorRef) {
  }

  ngOnInit() {
    for (let i in this.PromotionConditionType) {
      this.arrPromotionConditionType.push(this.PromotionConditionType[i]);
    }
    this.promotionService.tree({isActive:true,isPromotion:false})
      .then(resp => (this.tree = this.promotionService.prettyPrint(resp.data)));
      if(this.checkEdit && this.idUpdate){
        this.isEdit = true;
      }
      if(this.valueUpdate && this.idUpdate){
        this.arrProduct = this.valueUpdate?.promotionProducts.map(item=>({ 
          category: item?.product?.category?.name,
          name: item?.product?.name,
          sap: item?.product?.sap,
          quantity: item?.quantity,
          id: item?.product?.id
        }));
        this.discountOrderPercentOrCash = this.valueUpdate?.discountOrderValue;
        this.totalOrderPriceCondition = this.valueUpdate?.orderQuantity;
        this.conditionType = this.valueUpdate?.discountType;
        this.changePromotionCart();
      }
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
    this.changePromotionCart();
  }

  onChangeConditionType(event){
    this.conditionType == PromotionConditionType.percent ? this.unitType = "%" : this.unitType = "đ";
    this.changePromotionCart();
  }

  onCheckPercentOrCash(event: any) {
    if(this.conditionType == PromotionConditionType.percent){
      if(event.target.value <= 0 || event.target.value > 100){
         return this.toasty.error('Phần trăm chiết khấu chỉ từ 0-100%');
      }else{
        this.toasty.clear();
      }
    }else{
      if(event.target.value < 1000){
        return this.toasty.error('Giá tiền chiết khấu phải lớn hơn 1000đ');
     }else{
       this.toasty.clear();
     }
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
    this.changePromotionCart()
  }
  removeAllProduct() {
    this.arrProduct = [];
    this.changePromotionCart();
  }
  changePromotionCart(){
    if(this.totalOrderPriceCondition){
      this.checkValueQuantity = true;
      this.arrProduct.map(item=> item.quantity = null);
    }else{
      this.checkValueQuantity = false;
      this.totalOrderPriceCondition = null;
    }
    this.valuePromotionCart.emit({
          orderQuantity:this.totalOrderPriceCondition,
          discountOrderValue: this.discountOrderPercentOrCash,
          discountType: this.conditionType,
          promotionProducts: this.arrProduct.map(item => ({
            product: item?.id,
            quantity: item?.quantity
          }),)
      })
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
