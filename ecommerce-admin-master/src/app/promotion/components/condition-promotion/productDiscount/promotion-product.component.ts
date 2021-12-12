import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter, } from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { PromotionService } from '../../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
type State = {sap : string, name: string, id: string, price: number};
@Component({
  selector: 'promotion-product',
  templateUrl: './promotion-product.component.html',
  styleUrls: ['./promotion-product.component.scss'],

})
export class PromotionProductComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public valueProduct: any;
  public productGiven: any;
  public product: any;
  public getAllProduct: any;
  public keychange : any = {sap : "", name: ""};
  public arrProduct: any = [];
  public category: any = '';
  public countProductGiven: number;
  public tree: any = [];
  public titleCondition: any;
  public nameCondition: any;
  public statesWithFlags: any =[] ;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public isEdit: boolean = false;
  @Input() checkEdit: any;
  @Input() valueUpdate = [];
  @Input() idUpdate: any;
  @Output() valuePromotionProduct = new EventEmitter<object>();

  constructor(private promotionService: PromotionService, private toasty: ToastrService) {
  }

  ngOnInit() {
    this.promotionService.tree({isActive:true,isPromotion:false})
      .then(resp => (this.tree = this.promotionService.prettyPrint(resp.data)));
      if(this.checkEdit && this.idUpdate){
        this.isEdit = true
      }
      if(this.valueUpdate && this.idUpdate){
        this.arrProduct = this.valueUpdate.map(item=>({ 
          category: item?.product?.category?.name,
          discountPercent: item?.discountPercent,
          name: item?.product?.name,
          sap: item?.product?.sap,
          id: item?.product?.id,

        }));
        this.changePromotionProduct();
      }
  }

  // addProduct() {
  //   if(!this.category ){
  //     return this.toasty.error('Vui lòng chọn loại sản phẩm!');
  //   }
  //   this.arrProduct.push({});
  // }
  calDiscountPrice(event: any,index: number) {
    if(event.target.value < 0 || event.target.value > 100){
       return this.toasty.error('Phần trăm giảm chỉ từ 0-100');
    }
    if(this.arrProduct[index]){
      this.arrProduct[index].discountPrice = this.arrProduct[index]?.productId?.price - (this.arrProduct[index]?.productId?.price * event.target.value / 100);
      this.changePromotionProduct();
      this.toasty.clear();
    }
  }

  remove(index: number) {
    this.arrProduct.splice(index, 1);
    this.changePromotionProduct();
  }

  removeAllProduct() {
    this.arrProduct = [];
    this.changePromotionProduct();
  }

  search = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    map(term => term === '' ? []
      : this.statesWithFlags.filter(v => v.sap.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )
  
  // changeCategory(){
  //   const params: object = {
  //     page: this.page,
  //     take:10000,
  //     sort: `${this.sortOption.sortBy}`,
  //     sortType: `${this.sortOption.sortType}`,
  //     categoryId: this.category ? this.category : '',
  //   }
  //   this.promotionService.search(params)
  //   .then(resp => {
  //     this.statesWithFlags = resp.data.items.map(item => ({ 
  //       sap: item?.sap,
  //       name: item?.name,
  //       id: item?._id,
  //       price: item?.salePrice
  //   }));
  //   })
  //   .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  // }


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
    this.changePromotionProduct();
  }

  importProduct(event) {
    this.product = event;
  }

  importArrProduct(event){
    this.getAllProduct = event;
  }

  formatter = (x:State) => {
    this.changePromotionProduct();
    return `${x.sap}-${x.name}`;
  };

  changePromotionProduct(){
      const arrProducts = this.arrProduct.map(item => ({ 
        productId: item?.id,
        discountPercent: item?.discountPercent,
      }))
      this.valuePromotionProduct.emit(arrProducts)
    
  }

}
