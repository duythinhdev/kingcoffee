import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter, } from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { PromotionService } from '../../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
// type State = {sap : string, name: string, id: string};
@Component({
  selector: 'promotion-order-endow',
  templateUrl: './promotion-order-endow.component.html',
  styleUrls: ['./promotion-order-endow.component.scss'],

})
export class PromotionOrderEndowComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public valueProduct: any;
  public product: any;
  public getAllProduct: any;
  public productGiven: any;
  public arrProduct: any = [];
  public category: any = '';
  public discountOrderPercent: number;
  public totalOrderPriceCondition: number;
  public tree: any = [];
  public keychange : any = {sap : "", name: ""};
  public nameCondition: any;
  public isEdit: boolean = false;
  public productPresent: any;
  public getAllProductPresent: any;
  public arrProductPresent: any = [];
  public categoryPresent: any = '';
  public keychangePresent : any = {sap : "", name: ""};
  @Input() checkEdit: any;
  @Input() valueUpdate : any;
  @Input() idUpdate: any;
  @Output() valuePromotionOrderEndow = new EventEmitter<object>();

  constructor(private promotionService: PromotionService, private toasty: ToastrService,) {
  }

  ngOnInit() {
    this.promotionService.tree({isActive:true,isPromotion:false})
      .then(resp => (this.tree = this.promotionService.prettyPrint(resp.data)));
      if(this.checkEdit && this.idUpdate){
        this.isEdit = true
      }
      if(this.valueUpdate && this.idUpdate){
        this.arrProduct = this.valueUpdate?.promotionProducts.map(item=>({ 
          category: item?.category?.name,
          name: item?.name,
          sap: item?.sap,
          id: item?.id
        }));
        this.arrProductPresent = this.valueUpdate?.goodPriceProducts.map(item=>({ 
          category: item?.product?.category?.name,
          discountOnProductPercent: item?.discountOnProductPercent,
          name: item?.product?.name,
          sap: item?.product?.sap,
          id: item?.product?.id
        }));
        this.discountOrderPercent = this.valueUpdate?.discountOnProductPercent;
        this.totalOrderPriceCondition = this.valueUpdate?.totalOrderPriceCondition;
        this.changePromotionOrderEndow();
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
    this.changePromotionOrderEndow();
  }
  addProductPresent() {
    if(!this.categoryPresent ){
      return this.toasty.error('Vui lòng chọn loại sản phẩm!');
    }
    if(!this.productPresent ){
      return this.toasty.error('Chưa có sản phẩm nào, Vui lòng thử lại!');
    }
    if(this.categoryPresent && !this.productPresent?.id){
      for (let index = 0; index < this.getAllProductPresent.length; index++) {
        const checkArrExist = this.arrProductPresent.find(x=> x?.id == this.getAllProductPresent[index].id)
        if(!checkArrExist){
          this.arrProductPresent.push(this.getAllProductPresent[index]);
        }
      }
    }
    if(this.productPresent?.id){
      const checkProductExist = this.arrProductPresent.find(x=> x?.id == this.productPresent?.id);
        if(checkProductExist){
          this.keychangePresent = {sap : "", name: ""};
          return this.toasty.error('Sản phẩm đã tồn tại');
        }else{
          this.keychangePresent = {sap : "", name: ""};
          this.arrProductPresent.push(this.productPresent);
        }
      }
    this.changePromotionOrderEndow();
  }
  onCheckPercent(event: any) {
    if(event.target.value < 0 || event.target.value > 100){
       return this.toasty.error('Phần trăm sản phẩm ưu đãi chỉ từ 0-100');
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
  importProductPresent(event) {
    this.productPresent = event;
  }

  importArrProductPresent(event){
    this.getAllProductPresent = event;
  }
  remove(index: number) {
    this.arrProduct.splice(index, 1);
    this.changePromotionOrderEndow();
  }
  removeAllProduct() {
    this.arrProduct = [];
    this.changePromotionOrderEndow();
  }
  removeAllGift(){    
    this.arrProductPresent = [];
    this.changePromotionOrderEndow();
  }
  removePresent(index: number) {
    this.arrProductPresent.splice(index, 1);
    this.changePromotionOrderEndow();
  }

  changePromotionOrderEndow(){
    const arrProducts = this.arrProduct.map(item=>item?.id)
    this.valuePromotionOrderEndow.emit({
          totalOrderPriceCondition:this.totalOrderPriceCondition,
          goodPriceProducts: this.arrProductPresent.map(items => ({
            product: items?.id,
            discountOnProductPercent: items?.discountOnProductPercent,
          })),
          promotionProducts: arrProducts
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
