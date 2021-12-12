import { Component, ViewChild, NgZone } from '@angular/core';
import {
  AuthService,
  ContactService,
  ToastyService,
} from '../../../../services';
import {
  Content,
  NavController,
  AlertController,
  NavParams,
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { InsertUpdateAddressComponent } from '../../../../pages/profile/components/insert-update-address/insert-update-address.component';
import { ShippingAdressModel } from '../../../../models/shippingAdress.model';
import { CreateOrderComponent } from '../../../order/components/create_order/create_order.component';
import { TabsService } from '../../../../services/tabs.service';
@Component({
  selector: 'address',
  templateUrl: 'address.html',
})
export class AddressComponent {
  @ViewChild('top') top: Content;
  dataInfo = {
    change : false,
    products: [],
    shipmentTypeId: 1,
    toHubId: 3,
    shippingPrice: 0,
    percentDiscount: 0.07,
    transportation: {
      id: 6,
      name: 'Giao Hàng Nhanh',
    },
    paymentMethod: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    streetAddress: '',
    city: {
      id: '',
      name: '',
    },
    district: {
      id: '',
      name: '',
    },
    ward: {
      id: '',
      name: '',
    },
    zipCode: '70000',
    returnUrl: '',
  };
  items: ShippingAdressModel[] = [];
  text: string;
  scrollHeight = 0;
  addressId;
  Change;
  ward;
  district;

  constructor(
    private auth: AuthService,
    private zone: NgZone,
    private translate: TranslateService,
    private nav: NavController,
    private alertCtrl: AlertController,
    private contactService: ContactService,
    private tabsService: TabsService,
    private navParams: NavParams,
    private toasty: ToastyService
  ) {
    this.dataInfo = this.navParams.data.dataInfo || this.navParams.data;
  }

  async ngOnInit() {
    this.ward = this.translate.instant('Ward');
    this.district = this.translate.instant('District');
    await this.query();
    this.Change = this.navParams.data.flagchange;
    if (this.Change === false) {
      this.Change = false;
      localStorage.setItem('flagchange', this.Change);
    } else if (this.Change === true) {
      this.Change = true;
      localStorage.setItem('flagchange', this.Change);
    }
    if (this.navParams.data.flagchange === undefined) {
      this.Change = JSON.parse(localStorage.getItem('flagchange'));
    }
  }

  query() {
    return this.auth.getShippingAdress().then((res) => {
      this.items = res;
      this.items.map((x) => {
        if(!isNaN(Number(x.ward.name))){
          x.ward.name = `Phường ${x.ward.name}`
        }
      })
    });
  }

  onScroll($event) {
    this.zone.run(() => {
      this.scrollHeight = $event.scrollTop;
    });
  }

  scrollTop() {
    return this.top.scrollToTop();
  }

  insertUpdate() {
    return this.nav.push(
      InsertUpdateAddressComponent,
      { dataInfo: this.dataInfo },
      { animate: false }
    );
  }

  delete(itemId, index: number) {
    const alert = this.alertCtrl.create({
      title: `${this.translate.instant('Confirm')}`,
      subTitle: `${this.translate.instant(
        'Are you sure you want to remove this address?'
      )}`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.contactService
              .delete(itemId)
              .then(async () => {
                this.items.splice(index, 1);

                const shipToThisAddressCache = localStorage.getItem(
                  'isAddress'
                );
                if (shipToThisAddressCache === itemId) {
                  localStorage.removeItem('isAddress');
                }
                localStorage.removeItem('shipToThisAddressId');
                return this.nav.push(AddressComponent, this.dataInfo, {
                  animate: false,
                });
              })
              .catch((err) => {
                return this.toasty.error(
                  this.translate.instant(err.message || 'Something went wrong!')
                );
              });
          },
        },
        {
          text: `${this.translate.instant('Cancel')}`,
          role: 'cancel',
        },
      ],
    });
    return alert.present();
  }

  getDataAddress(itemId) {
    return this.nav.push(
      InsertUpdateAddressComponent,
      { dataInfo: this.dataInfo, itemId },
      { animate: false }
    );
  }

  async shipToThisAddress(shipToThisAddressId) {
    localStorage.setItem('shipToThisAddressId', shipToThisAddressId);
    await this.nav.pop();
    await this.nav.popTo(CreateOrderComponent);
    this.dataInfo.change = true;
    return this.nav.push(CreateOrderComponent, this.dataInfo, {
      animate: false,
    });
  }

  ionViewWillEnter() {
    setTimeout(() => {
      this.tabsService.hide();
    }, 0);
  }
}
