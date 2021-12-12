describe('Test order', () => {
  let product;
  let shop;
  let order;
  let subOrder;

  before(async () => {
    shop = new DB.Shop({
      name: 'shop test',
      ownerId: global.admin._id,
      storeWideShipping: true,
      phoneNumber: '01013339999',
      shippingSettings: {
        city: 'HCM',
        district: 'Quan BT',
        ward: 'Phuong 19',
        zipCode: 700000,
        address: 'Nguyen Ngoc Phuong'
      }
    });
    await shop.save();

    await DB.User.update({
      _id: global.admin._id
    }, {
      $set: { shopId: shop._id, isShop: true }
    });

    product = new DB.Product({
      name: 'product 1',
      price: 100,
      weight: 500,
      stockQuantity: 10,
      shopId: shop._id,
      freeShip: false,
      taxClass: 'VAT',
      taxPercentage: 20
    });

    await product.save();
  });

  describe('Test order with user role', () => {
    //Tạm skip api này do lỗi khi connect vs api goldtime
    xit('Should create new order with user', async () => {
      const newOrder = {
        products: [{
          productId: product._id,
          quantity: 2,
          userNote: 'testing'
        }],
        phoneNumber: '+8491213131',
        firstName: 'first',
        lastName: 'last',
        paymentMethod: 'paypal',
        shippingMethod: 'cod',
        streetAddress: 'hehehe',
        userCurrency: 'VND',
        city: 'Ho Chi Minh',
        district: 'Quan 10',
        ward: 'phuong 10',
        zipCode: 700000
      };
      const body = await testUtil.request('post', '/v1/orders', global.userToken, newOrder);

      expect(body).to.exist;
      order = body;
    });

    xit('Should get list of orders include details', async () => {
      //Tạm skip api này do lỗi khi connect vs api goldtime
      // update paid
      await DB.Order.updateMany({ customerId: global.user._id }, {
        $set: {
          paymentStatus: 'paid'
        }
      });
      await DB.OrderDetail.updateMany({ customerId: global.user._id }, {
        $set: {
          paymentStatus: 'paid'
        }
      });
      const body = await testUtil.request('get', '/v1/orders', global.userToken);
      expect(body).to.exist;
      expect(body.count).to.exist;
      expect(body.items).to.exist;
      expect(body.items).have.length(1);
      expect(body.items[0].details).have.length(1);
    });

    xit('Should get order details', async () => {
      //Tạm skip api này do lỗi khi connect vs api goldtime
      const body = await testUtil.request('get', `/v1/orders/${order._id}`, global.userToken);

      expect(body).to.exist;
      expect(body.customerId).to.exist;
      expect(body.userCurrency).to.equal('VND');
      expect(body.currencyExchangeRate).to.exist;
      expect(body.userTotalPrice).to.exist;

      const detail = body.details[0];
      // check shipping price
      // expect(detail.shippingPrice).to.equal(15);
      // expect(detail.userShippingPrice).to.exist;
      // expect(detail.taxClass).to.exist;
      // expect(detail.taxPercentage).to.equal(20);
    });
  });

  describe('Test seller routes', () => {
    xit('Seller can get list of orders', async () => {
      //Tạm skip api này do lỗi khi connect vs api goldtime
      const body = await testUtil.request('get', '/v1/orders/shops', global.adminToken);
      expect(body).to.exist;
      expect(body.items).to.have.length(1);
      subOrder = body.items[0];

      expect(subOrder.userCurrency).to.equal('VND');
      expect(subOrder.currencyExchangeRate).to.exist;
      expect(subOrder.userTotalPrice).to.exist;
    });

    it('Seller can get stats of orders', async () => {
      const body = await testUtil.request('get', '/v1/orders/seller/stats', global.adminToken);

      expect(body).to.exist;
      expect(body.all).to.exist;
      expect(body.pending).to.exist;
      expect(body.completed).to.exist;
      expect(body.cancelled).to.exist;
    });

    it('Seller can get stats of products', async () => {
      const body = await testUtil.request('get', '/v1/products/seller/stats', global.adminToken);

      expect(body).to.exist;
      expect(body.total).to.exist;
    });

    xit('Seller should update order status', async () => {
      //Tạm skip api này do lỗi khi connect vs api goldtime
      const body = await testUtil.request('put', `/v1/orders/details/${subOrder._id}/status`, global.adminToken, {
        status: 'completed'
      });

      expect(body).to.exist;
      expect(body.success).to.exist;
      const orderCheck = await DB.OrderDetail.findOne({ _id: subOrder._id });
      expect(orderCheck.status).to.equal('completed');

      // should create log
      const logCheck = await DB.OrderLog.findOne({
        orderDetailId: subOrder._id
      }).sort({ createdAt: -1 });
      expect(logCheck).to.exist;
      expect(logCheck.eventType).to.equal('updateStatus');
      expect(logCheck.oldData.status).to.equal('pending');
      expect(logCheck.newData.status).to.equal('completed');
    });
  });

  xdescribe('Test refund request', () => {
    let refundRequest;

    it('User shoud be able to send request', async () => {
      const body = await testUtil.request('post', '/v1/refundRequests', global.userToken, {
        reason: 'some text',
        orderDetailId: subOrder._id
      });

      expect(body).to.exist;
      expect(body.reason).to.exist;
      refundRequest = body;
    });

    it('Seller can get list of requests', async () => {
      const body = await testUtil.request('get', '/v1/refundRequests', global.adminToken);

      expect(body).to.exist;
      expect(body.count).to.exist;
      expect(body.items).to.exist;
    });

    it('Seller can get details of requests', async () => {
      const body = await testUtil.request('get', `/v1/refundRequests/${refundRequest._id}`, global.adminToken);

      expect(body).to.exist;
      expect(body.reason).to.exist;
    });
  });

  describe('Test cart endpoint', () => {
    it('Should get cart calculator', async () => {
      const body = await testUtil.request('post', '/v1/cart/calculate', null, {
        products: [{
          productId: product._id,
          quantity: 2,
        }],
        paymentMethod: 'paypal',
        shippingMethod: 'cod',
        shippingAddress: 'some where',
        userCurrency: 'EUR'
      });
      expect(body).to.exist;
      expect(body.products).to.have.length(1);
      subOrder = body.products[0];
      expect(subOrder.userCurrency).to.equal('EUR');
      expect(subOrder.currencyExchangeRate).to.exist;
    });
  });

  describe('Test order with guest role', () => {
    xit('Should create new order with guest', async () => {
      //Tạm skip api này do lỗi khi connect vs api goldtime
      const newOrder = {
        products: [{
          productId: product._id,
          quantity: 2,
          userNote: 'testing'
        }],
        phoneNumber: '+8491213131',
        email: 'testingemail@someemail.com',
        firstName: 'first',
        lastName: 'last',
        paymentMethod: 'paypal',
        shippingMethod: 'cod',
        shippingAddress: 'some where',
        userCurrency: 'EUR'
      };
      const body = await testUtil.request('post', '/v1/orders', null, newOrder);

      expect(body).to.exist;
    });
  });

  describe('Test cart with coupon', () => {
    let coupon;
    before(async () => {
      coupon = new DB.Coupon({
        name: 'Test',
        code: 'ABC',
        limit: 0,
        shopId: shop._id,
        discountPercentage: 10
      });
      await coupon.save();
    });

    it('Should get cart calculator', async () => {
      const body = await testUtil.request('post', '/v1/cart/calculate', null, {
        products: [{
          productId: product._id,
          quantity: 1,
          couponCode: coupon.code
        }],
        paymentMethod: 'paypal',
        shippingMethod: 'cod',
        shippingAddress: 'some where',
        userCurrency: 'EUR'
      });
      expect(body).to.exist;
      expect(body.products).to.have.length(1);
      subOrder = body.products[0];
      expect(subOrder.userCurrency).to.equal('EUR');
      expect(subOrder.currencyExchangeRate).to.exist;
    });
  });
});
