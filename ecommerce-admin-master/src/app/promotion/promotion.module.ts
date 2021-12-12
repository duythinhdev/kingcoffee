import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionRoutingModule } from './promotion.routing';
import { PromotionListingComponent } from './components/promotion-listing/promotion-listing.component';
import { UtilsModule } from '../utils/utils.module';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from '../order/services/formatdate.service';
import { DiscountFirstComponent } from './components/discount-first/discount-first.component';
import { OrderFirstComponent } from './components/condition-promotion/giveSomeGiftForNewMember-discountOrderForNewMember/order-first.component'
import { PromotionDetailComponent } from './components/promotion-detail/promotion-detail.component';
import { PromotionUpdateComponent } from './components/promotion-detail/promotion-update.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProgramListingComponent } from './components/promotion-type-list/program-listing.component';
import { ProgramUpdateComponent } from './components/promotion-type-detail/program-update.component';
import { ProgramCreateComponent } from './components/promotion-type-detail/program-create.component';
import { PromotionCartCountComponent } from './components/condition-promotion/discountOrderFollowProductQuantity-checkoutDiscount-giveGiftForOrder/promotion-cart-count.component';
import { PromotionProductComponent } from './components/condition-promotion/productDiscount/promotion-product.component';
import { PromotionOrderEndowComponent } from './components/condition-promotion/buyGoodPriceProduct/promotion-order-endow.component';
import { PromotionPercentComponent } from './components/condition-promotion/orderDiscount/promotion-percent.component';
import { PromotionCartComponent } from './components/condition-promotion/checkoutPercentOrMoneyDiscount/promotion-cart.component';
import { FreeShipComponent } from './components/condition-promotion/freeship/freeship.component';
import { PromotionProductGiveProductComponent } from './components/condition-promotion/bonusProducts/promotion-product-give-product.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PromotionService } from './services/promotion.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UtilsModule,
    PromotionRoutingModule,
    NgbModule,
    CKEditorModule,
    TranslateModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  declarations: [
    PromotionDetailComponent,
    PromotionUpdateComponent,
    PromotionListingComponent,
    DiscountFirstComponent,
    OrderFirstComponent,
    ProgramListingComponent,
    ProgramUpdateComponent,
    ProgramCreateComponent,
    PromotionCartCountComponent,
    PromotionProductComponent,
    PromotionOrderEndowComponent,
    PromotionPercentComponent,
    PromotionCartComponent,
    FreeShipComponent,
    PromotionProductGiveProductComponent
  ],
  providers: [
    PromotionService,
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter}
  ],
})
export class PromotionModule { }
