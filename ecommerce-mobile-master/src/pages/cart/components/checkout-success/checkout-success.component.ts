import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CartService, ToastyService } from '../../../../services';
import { ProductListingComponent } from '../../../products';
import { ContactComponent } from '../../../contact/contact.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './checkout-success.html',
})
export class CheckoutSuccessComponent {
  constructor(
    private service: CartService,
    private nav: NavController,
    private toasty: ToastyService,
    private translate: TranslateService
  ) {
    this.service.clean().catch((err) => {
      return this.toasty.error(
        this.translate.instant(err.message || 'Something went wrong!')
      );
    });
  }

  goTo(where) {
    console.log('checkout product')
    where === 'products'
      ? this.nav.setRoot(ProductListingComponent)
      : this.nav.setRoot(ContactComponent);
  }
}
