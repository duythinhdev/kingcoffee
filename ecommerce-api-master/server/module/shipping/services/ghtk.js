const request = require('request');

exports.getShippingFee = async (data) => {
  try {
    return new Promise(async (resovle, reject) => {
      request.get(
        {
          url: `${process.env.GHTK_API}/services/shipment/fee`,
          headers: {
            'content-type': 'application/json',
            token: process.env.GHTK_TOKEN
          },
          qs: {
            pick_province: data.shop.city,
            pick_district: data.shop.district,
            pick_ward: data.shop.ward,
            pick_address: data.shop.pickAddress,
            province: data.customer.city,
            district: data.customer.district,
            address: data.customer.address,
            weight: data.weight,
            // value: data.product_price,
            transport: data.transport
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('Tính phí vận chuyển không thành công'));
          }

          const resData = JSON.parse(body);
          console.log(resData);
          if (resData && !resData.success) {
            console.log(resData.messages);
            return reject(new Error(resData.messages));
          }

          resovle(resData);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.createShippingOrder = async (data) => {
  try {
    return new Promise(async (resovle, reject) => {
      request.post(
        {
          url: `${process.env.GHTK_API}/services/shipment/order`,
          headers: {
            'content-type': 'application/json',
            token: `${process.env.GHTK_TOKEN}`
          },
          json: {
            products: data.products,
            order: {
              id: data.order_id,
              pick_name: data.shop_name,
              pick_address: data.shop_address,
              pick_province: data.shop_city,
              pick_district: data.shop_disctrict,
              pick_tel: data.shop_tel,
              tel: data.customer_tel,
              name: data.customer_name,
              address: data.customer_address,
              province: data.customer_city,
              district: data.customer_district,
              ward: data.customer_ward,
              hamlet: 'Khác',
              is_freeship: data.freeship_code,
              pick_date: data.picking_date,
              pick_money: 0,
              note: data.note,
              transport: data.transport
            }
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('Tạo đơn vận chuyển không thành công'));
          }

          if (!body.success) {
            console.log('error: ', body);
            return reject(new Error(body.message));
          }

          const shippingOrder = body;
          resovle(shippingOrder);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.getShippingStatus = async (data) => {
  try {
    return new Promise(async (resovle, reject) => {
      request(
        {
          method: 'GET',
          url:
            `${process.env.GHTK_API}/services/shipment/v2/${data.shipping_code}`,
          headers: {
            'content-type': 'application/json',
            token: `${process.env.GHTK_TOKEN}`
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('Lấy trạng thái đơn hàng không thành công'));
          }

          const shippingStatus = JSON.parse(body);
          resovle(shippingStatus);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.getShippingStatusList = async (data) => {
  try {
    return new Promise(async (resovle, reject) => {
      // Get Order Id
      const query = {
        _id: data.order_id
      };

      const item = await DB.Order.findOne(query)
        .populate('details')
        .populate('customer');
      const order = item.toObject();

      // Request shipping status ist
      for (let i = 0; i < order.trackingCode.length; i++) {
        var result = [];
        var completed_requests = 0;
        request(
          {
            method: 'GET',
            url:
              `${process.env.GHTK_API}/services/shipment/v2/${order.trackingCode[i]}`,
            headers: {
              'content-type': 'application/json',
              token: `${process.env.GHTK_TOKEN}`
            }
          },
          (error, response, body) => {
            if (error) {
              return reject(error);
            }

            if (!body) {
              return reject(new Error('Lấy danh sách trạng thái đơn hàng không thành công'));
            }

            const shippingStatus = JSON.parse(body);

            result.push(shippingStatus.order);
            completed_requests++;

            // Response an array of shipping status
            if (completed_requests == order.trackingCode.length) {
              resovle(result);
            }
          }
        );
      }
    });
  } catch (e) {
    throw e;
  }
};


exports.cancelShipping = async (trackingCode) => {
  try {
    console.log(`${process.env.GHTK_API}/services/shipment/cancel/${trackingCode}`);
    return new Promise(async (resovle, reject) => {
      request(
        {
          method: 'POST',
          url:
            `${process.env.GHTK_API}/services/shipment/cancel/${trackingCode}`,
          headers: {
            'content-type': 'application/json',
            token: `${process.env.GHTK_TOKEN}`
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body || !body.success) {
            return reject(new Error('Hủy đơn hàng không thành công'));
          }

          resovle(true);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};
