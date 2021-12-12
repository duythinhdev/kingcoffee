import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderViewTitle, OrderViewTitleModel } from '../../../model/order.view.title.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { OrderStatusDescription } from '../../../enums/order.enum';
import { WalletDescription } from '../../../enums/wallet.enum';
import { UserRoles } from '../../../enums/userRoles.enum';
import { UtilService } from '../../../shared/services';
import { PromotionForm } from '../../../enums/promotion.enum';
import { BravoService } from '../../services/bravo.service';
@Component({
  selector: 'order-view',
  templateUrl: './view.html',
  styleUrls: ['./view.scss']
})
export class ViewComponent implements OnInit {
  orderViewTitleModel: OrderViewTitleModel;
  public order: any = {};
  public details: any = [];
  public totalPrice: any = 0;
  public totalDiscountPrice: any = 0;
  public shippingPrice: any = 0;
  public isHub:any = false;
  public OrderStatusDescription = OrderStatusDescription;
  public WalletDescription = WalletDescription;
  public promotionOrders: any = [];
  public extraProducts: any = [];
  public freeShipList = [];
  public bravoOrderDetails = [];

  constructor(private router: Router, private route: ActivatedRoute,
    private orderService: OrderService, private toasty: ToastrService,
    private translate: TranslateService,private utilService: UtilService,
    private bravoService: BravoService) {
    const id = this.route.snapshot.params.id;
    
    this.orderService.findOne(id).then(async (res) => {
      if(res.data.promotions)
        this.promotionOrders = res.data.promotions;

      for (const iterator of res.data.details) {
        iterator.priceAfterPromo = 0;
        if(iterator.promotions){
          for (const itemPromo of iterator.promotions) {
            iterator.priceAfterPromo = iterator.priceAfterPromo + itemPromo.discountPrice;
          }
  
          if(iterator.promotions && iterator.promotions.length > 0){
            //Tách sản phẩm mua ưu đãi khỏi order detail
            let prom = iterator.promotions.find(x => x.promotionOrder ? x.promotionOrder.promotionForm == PromotionForm.BuyGoodPriceProduct : false);
            if(prom){
              this.extraProducts.push(iterator);
            }else{
              this.details.push(iterator);
            }
          }else{
            this.details.push(iterator);
          }
        }else{
          this.details.push(iterator);
        }
      }
      
      let totalShippingDiscountPrice = 0;
      if(!_.isEmpty(this.promotionOrders)){
        this.freeShipList = this.promotionOrders.filter(x => x.promotionOrder?.promotionForm === PromotionForm.FreeShip);
        totalShippingDiscountPrice = await this.freeShipList.reduce((total, e) => total + (e.discountPrice ? e.discountPrice : 0), 0);
        this.promotionOrders = this.promotionOrders.filter(x => x.promotionOrder?.promotionForm !== PromotionForm.FreeShip);
      }

      this.order = res.data;
      this.totalDiscountPrice = res?.data?.totalDiscountPrice;

      this.totalPrice = this.details.reduce((n, { totalPrice }) => n + totalPrice, 0)
      
      this.shippingPrice = res?.data?.shippingPrice + totalShippingDiscountPrice;
      this.isHub = res.data?.customer?.userRoles.find(x => x.Role == UserRoles.HUB);
      await this.getDataFromBravo();
    });
  }

  ngOnInit() {
    this.orderViewTitleModel = OrderViewTitle[0];
  }

  updateStatus(item, index) {
    const data = _.pick(item, ['status']);

    this.orderService.update(item._id, data).then(resp => {
      this.toasty.success(this.translate.instant('Updated successfuly!'));
      this.details[index].status = item.status;
    }).catch((err) => this.toasty.error(this.translate.instant(err.data.message)));
  }
  checkButtonSave(userRole,isConfirmOrderHub){
    if(userRole){
      if(userRole.find(x => x.Role == UserRoles.HUB) && !isConfirmOrderHub){
        return true;
      }else{
        return false;
      }
    }
  }

  onChangeProductQuantity(quantity: number, productId: any,unitPrice:number): void {
    if (quantity > 0 && productId) {
      const product = this.details.find(c => c.productId === productId);

    if(quantity > 0)
      product.quantity = quantity;
      product.totalPrice = quantity*unitPrice;
      this.totalPrice = quantity*unitPrice
      this.totalDiscountPrice = this.totalPrice * this.order?.percentDiscount 
  }
}
  updateOrder(orderId){
    this.utilService.setLoading(true);
    let value = [];
    for(let i = 0; this.details.length > i; i++){
      value.push({
        "id":this.details[i]?._id,
        "quantity":this.details[i]?.quantity,
      })
    }
    const params = {
      "orderDetails":value
    };
    this.orderService.updateOrder(orderId, params).then(resp => {
      if(resp.code == 200){
        this.toasty.success(resp.message);
        this.router.navigate(['/orders/list']);
      }
    }).catch((err) => this.toasty.error('Có vấn đề hệ thống, Vui lòng thử lại!'));
    this.utilService.setLoading(false);
  }

  async getDataFromBravo(){
    await this.bravoService.clearSession();
    await this.bravoService.getAuth();
    if(this.order && this.order.docNo){
      this.bravoService.getDetailDataFromBravo({
        bizDocId: this.order.bizDocId,
        docNo: this.order.docNo
      })
      .then(res => {
        if(res && res.data && !_.isEmpty(res.data.Table)){
          this.bravoOrderDetails = res.data.Table;
        }
      })
      .catch(err => this.toasty.error(this.translate.instant(err.error.message)));
    }
  }
}
