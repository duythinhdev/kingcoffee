import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs'
import { debounceTime, map } from 'rxjs/operators';
import { PromotionService } from '../../../services/promotion.service';
type State = {sap : string, name: string, id: string};
@Component({
  selector: 'order-first',
  templateUrl: './order-first.html',
  styleUrls: ['./order-first.scss']
})

export class OrderFirstComponent implements OnInit {
  public page: any = 1;
  public total: any = 0;
  public statesWithFlags: any =[] ;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public name : any;
  public arrProduct: any = [];
  public arrProductGiftOrDiscount: any = [];
  public arrProductPresent: any = [];
  public typePromotionItem : string;
  public isEdit: boolean = false;
  public category: any = '';
  public giveGiftType: any = 'or';
  public categoryPresent: any = '';
  public tree: any = [];
  public treeGift: any = [];
  public product: any;
  public getAllProduct: any;
  public productPresent: any;
  public getAllProductPresent: any;
  public keychange : any = {sap : "", name: ""};
  public keychangePresent : any = {sap : "", name: ""};
  @Input() set typePromotion(value: string) {
    this.typePromotionItem = value;
  }
  get funcPromotion(): string {
    return this.typePromotionItem;
  }
  @Input() checkEdit: any;
  @Input() valueUpdate: any;
  @Input() idUpdate: any;
  @Output() valueOrderFirst = new EventEmitter<any>();
  constructor(private promotionService: PromotionService, private toasty: ToastrService) {
  }

  ngOnInit() {
    this.promotionService.tree({isActive:true,isPromotion:false})
    .then(resp => (this.tree = this.promotionService.prettyPrint(resp.data)));
    this.promotionService.tree({isActive:true,isPromotion:true})
    .then(resp => (this.treeGift = this.promotionService.prettyPrint(resp.data)));
    if(this.checkEdit && this.idUpdate){
      this.isEdit = true
    }

    if(this.valueUpdate && this.idUpdate && this.typePromotionItem == "discountOrderForNewMember"){
      this.arrProductGiftOrDiscount = this.valueUpdate?.orderConditions;
      this.arrProduct = this.valueUpdate?.promotionProducts.map(item=>({ 
        category: item?.category?.name,
        name: item?.name,
        sap: item?.sap,
        id: item?.id
      }));
      this.changeOrderFirst();
    }else if(this.valueUpdate && this.idUpdate && this.typePromotionItem == "giveSomeGiftForNewMember"){
     this.arrProductGiftOrDiscount = this.valueUpdate?.orderConditions;
     this.arrProduct = this.valueUpdate?.promotionProducts.map(item=>({ 
      category: item?.category?.name,
      name: item?.name,
      sap: item?.sap,
      id: item?.id
    }));
      this.giveGiftType = this.valueUpdate?.giveGiftType;
      this.arrProductPresent = this.valueUpdate?.gifts.map(item=>({ 
        category: item?.gift?.category?.name,
        name: item?.gift?.name,
        sap: item?.gift?.sap,
        quantity: item?.quantity,
        id: item?.gift?.id
      }));
      this.changeOrderFirst();
    }
  }
  addProductGift() {
    this.arrProductGiftOrDiscount.push({});
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
    this.changeOrderFirst();
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
    this.changeOrderFirst();
  }
  changeOrderFirst(){
    if(this.typePromotionItem == 'giveSomeGiftForNewMember'){
      const arrProducts = this.arrProductGiftOrDiscount.map(item=>({ 
        totalOrderPriceCondition: item?.totalOrderPriceCondition,
        orderNumber: item?.orderNumber,
      }))
      this.valueOrderFirst.emit({
        orderConditions: arrProducts,
        giveGiftType: this.giveGiftType,
        promotionProducts: this.arrProduct.map(x => x?.id),
        gifts: this.arrProductPresent.map(y => ({
          gift: y?.id,
          quantity: y?.quantity,
        }))
      })
    }else{
      // type: discountOrderForNewMember
      this.valueOrderFirst.emit({
        orderConditions:this.arrProductGiftOrDiscount.map(item=>({ 
          discountPercent: item?.discountPercent,
          orderNumber: item?.orderNumber,
          totalOrderPriceCondition: item?.totalOrderPriceCondition,
        })),
        promotionProducts:this.arrProduct.map(x=>x?.id)})
    }
  }
  onCheckPercent(event: any) {
    if(event.target.value < 0 || event.target.value > 100){
       return this.toasty.error('Phần trăm khuyến mãi chỉ từ 0-100');
    }else{
      this.toasty.clear();
    }
  }
  removeGift(index: any){
    this.arrProductGiftOrDiscount.splice(index, 1);
    this.changeOrderFirst();
  }
  remove(index: any){
    this.arrProduct.splice(index, 1);
    this.changeOrderFirst();
  }
  removeAll() {
    this.arrProduct = [];
    this.changeOrderFirst();
  }
  removeAllGift(){    
    this.arrProductPresent = [];
    this.changeOrderFirst();
  }
  removePresent(index: any){
    this.arrProductPresent.splice(index, 1);
    this.changeOrderFirst();
  }
  search = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    map(term => term === '' ? []
      : this.statesWithFlags.filter(v => v.sap.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  searchChange(event){
    const params: object = {
    page: this.page,
    take:10000,
    sap: event.target.value,
    sort: `${this.sortOption.sortBy}`,
    sortType: `${this.sortOption.sortType}`,
    isPromotion: true
  }
  this.promotionService.search(params)
  .then(resp => {
    this.statesWithFlags = resp.data.items.map(item => ({ 
      sap: item?.sap,
      name: item?.name,
      id: item?._id,
  }));
  })
  .catch(() => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
  this.changeOrderFirst();
  }
  formatter = (x:State) => {
    this.changeOrderFirst();
    return `${x.sap}-${x.name}`;
  };
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

