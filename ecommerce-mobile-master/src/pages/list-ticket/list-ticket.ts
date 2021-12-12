import { Component, ViewChild, OnInit } from '@angular/core';
import {
  Content
} from 'ionic-angular';
import { AuthService } from '../../services';
import { isNil } from 'lodash';
// import { InsertUpdateAddressComponent } from '../../../../pages/profile/components/insert-update-address/insert-update-address.component';
// import { ShippingAdressModel } from '../../../../models/shippingAdress.model';
// import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
// import { TabsService } from '../../../../services/tabs.service';

/**
 * Generated class for the ListTicketComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'list-ticket',
  templateUrl: 'list-ticket.html'
})
export class ListTicketComponent implements OnInit {
  listCoupon = [];
  isLoading = false;
  @ViewChild('top') top: Content;
  text: string;

  constructor(
    private auth: AuthService
  ) {

  }
  async ngOnInit() {
    console.log('get query')
    await this.query();
  }
  query() {
    this.auth.me().then((resp) => {
      if (!isNil(resp.data)) {
        this.isLoading = true;
        console.log(resp.data.couponCodes)
        if (!resp.data.couponCodes) {
          this.listCoupon = []
        }
        else {
          resp.data.couponCodes.forEach(element => {
            this.listCoupon.push(element.id)
          });
        }

      }
      else {
        this.isLoading = true;
        this.listCoupon = []
      }
    });

  }

}
