import { Component } from '@angular/core';
import { NavParams, Platform } from 'ionic-angular';
import { isNil } from 'lodash';
import { HTTP } from '@ionic-native/http';
import {
  AuthService,
  QrcodeService,
  OrderService,
  ProductService
}
  from '../../services';
import * as moment from 'moment'
@Component({
  selector: 'page-scan-qrcode-info',
  templateUrl: 'scan-qrcode-info.html',
})
export class ScanQRCodeInfo {
  isLoading = false;
  code;
  memberId: any;
  referralCodeLink: any;
  img: '';
  productName;
  price;
  coupon_code;
  idProduct;
  sku;
  category;
  response: any;
  isSuccess = true;
  // platform='web';
  rePrice;
  status;
  os;
  errorMessage;
  missprice;
  productId;
  total;
  bu;
  constructor(
    private navParams: NavParams,
    private qrService: QrcodeService,
    private authService: AuthService,
    private orderService: OrderService,
    public platform: Platform,
    private productService: ProductService,
    private http: HTTP,
  ) {
    this.code = this.navParams.data.qrcode;
    this.productId = this.navParams.data.productId;
    this.bu = this.navParams.data.bu;
  }

  async getProductPrice() {
    const productRes = await this.productService.search({ sap: this.productId });
    if (productRes.code === 200) {
      const productItems = productRes.data.items;
      if (productItems.length > 0) {
        return productItems[0].price
      }
      return 0
    }
    return 0
  }

  async ionViewWillEnter() {
    this.platform.ready().then(() => {
      if (this.platform.is('desktop')) {
        this.os = 'desktop';
      }
      else if (this.platform.is('ios')) {
        this.os = 'ios';
      }
      else if (this.platform.is('android')) {
        this.os = 'android';
      }
      else {
        this.os = 'unknow'
      }

    });

    await this.authService.me_social().then((resp) => {
      if (!isNil(resp.data)) {
        this.memberId = resp.data.socialInfo.MemberId;
      }
    });

    let res_orders_amount = await this.orderService.qrordersamount();
    let orders_amount ;
    if (res_orders_amount.code == 200) {
      if (res_orders_amount.data.count == 0) {
        orders_amount = 0;
      }
      else {
        if (res_orders_amount.data.totalAmount.length > 0) {
          orders_amount = res_orders_amount.data.totalAmount[0].total;
        }
        else {
          orders_amount = 0;
        }

      }
    }
    else {
      orders_amount = 0;
    }


    this.total = await this.getProductPrice();

    let time = moment().format('DD/MM/YYYY hh:mm:ss');
    let headers =
    {
      'Api-key': "rL`CN>5]q^mcR*Bq",
      'Content-type': 'application/x-www-form-urlencoded'
    };
    let url = 'https://crm.kingcoffee.com/tcoqcode_api/get_qrcode/';
    let body = {
      "user_id": this.memberId,
      "qr_code": this.code,
      "total": this.total,
      "device_name": "device_name",
      "device_os": this.os,
      "device_version": "device_version",
      "time": time
    }
    await this.http.post(url, body, headers)
      .then(async res => {
        const data = JSON.parse(res.data);
        if (data.code == 1) {
          this.isLoading = true;
          this.isSuccess = true;
          this.img = data.data.product_data.image;
          this.productName = data.data.product_data.name;
          this.price = data.data.product_data.price;
          this.rePrice = data.data.product_data.price;
          this.price = this.price.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,");
          var coupon = data.data.coupon_code;
          this.idProduct = data.data.product_data.id;
          this.category = data.data.product_data.category;
          this.sku = data.data.product_data.sku;
          this.status = data.data.qrcode_status;

          /// hard code start
          // let sap_to_proid;
          // if (this.sku) {
          //   sap_to_proid = {
          //     "sap": this.sku.trim()
          //   };
          // }
          // let prodres = await this.productService.search(sap_to_proid);
          // let productId;
          // if (prodres.code == 200) {
          //   if (prodres.data.count > 0) {
          //     productId = prodres.data.items[0].id;
          //     console.log('insert QR code')
          //     this.insertQrCode(productId, coupon)
          //   }
          // }

          /// end
          let arr_c = []
          if (coupon && coupon.length > 0) {
            coupon.forEach(element => {
              arr_c.push(element.id)
            });
          }
          this.coupon_code = arr_c.join(', ')
        }
        else {
          this.isLoading = true;
          this.isSuccess = false;
          this.errorMessage = data.msg
        }
        if (this.status == 0) {
          if (coupon &&  coupon.length > 0) {
            let couponJson = {
              "couponCodes": coupon
            }
            await this.authService.add_couponCodes(couponJson);
          }
          this.missprice = 50000 - ((parseInt(orders_amount) + parseInt(this.rePrice)) % 50000);
          if (this.missprice) {
            this.missprice = this.missprice.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,");
          }
          let sap_to_proid;
          if (this.sku) {
            sap_to_proid = {
              "sap": this.sku.trim()
            };
          }
          let prodres = await this.productService.search(sap_to_proid);
          let productId;
          if (prodres.code == 200) {
            if (prodres.data.count > 0) {
              productId = prodres.data.items[0].id;
              this.insertQrCode(productId, coupon)
            }
          }
        }
        else {
          this.missprice = 50000 - (parseInt(orders_amount) % 50000);
          if (this.missprice) {
            this.missprice = this.missprice.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,");
          }
        }
      })
      .catch(error => {
        console.log(error);
        this.isLoading = true;
        this.isSuccess = false;
        this.errorMessage = error
      })

  }
  async insertQrCode(productId, coupon) {
    let firstName = '';
    let lastName = '';
    let phoneNumber = '';
    await this.authService.me().then(async (resp) => {
      lastName = resp.data.name.slice(
        resp.data.name.lastIndexOf(' ') + 1,
        resp.data.name.length
      );
      firstName = resp.data.name.slice(
        0,
        resp.data.name.lastIndexOf(firstName) - 1
      );
      phoneNumber = resp.data.phoneNumber;
    })
    const params = {
      "products": [
        {
          "productId": productId,
          "quantity": 1,
          "promotions": []
        }
      ],
      "shipmentTypeId": 1,
      "toHubId": null,
      "shippingPrice": 30000,
      "percentDiscount": 0,
      "transportation": {
        "id": 49,
        "name": "Snappy"
      },
      "paymentMethod": "cod",
      "firstName":firstName ,
      "lastName": lastName,
      "phoneNumber": phoneNumber,
      "streetAddress": "16 mai chi tho",
      "city": {
        "id": 121,
        "name": "Hồ Chí Minh"
      },
      "district": {
        "id": 14,
        "name": "Quận 2"
      },
      "ward": {
        "id": 184,
        "name": "An Phú"
      },
      "zipCode": "70000",
      "returnUrl": "tniecommerce://",
      "bu":this.bu,
      "couponCode":coupon,
      "promotions": [],
    }
    this.orderService
      .createOrderQR(params)
      .then(async (res) => {
        if (res.code === 200) {
        }
      })
      .catch(async (res) => {
        if (res.status === 400) {
        }
      })
  }
}
