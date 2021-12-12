const request = require('request');

const ChannelId = process.env.CHANNEL_ID || 7;

exports.getWalletAmount = async (token) => {
  try {
    return new Promise((resolve, reject) =>
      request(
        {
          method: 'GET',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/Account/GetWalletDetail`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (response.statusCode != 200) {
            return reject(new Error(response.statusMessage));
          }

          if (!body) {
            return reject(new Error('Lấy số dư ví không thành công'));
          }

          const walletInfo = JSON.parse(body);

          return resolve(walletInfo);
        }
      ));
  } catch (error) {
    throw error;
  }
};

exports.payment = async (data, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/Payment/payment-ecommerce`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: {
            OrderId: data.orderId,
            TotalPriceBefore: data.totalPriceBefore,
            TotalShipping: data.totalShipping,
            TotalTax: data.totalTax,
            TotalPriceAfter: data.totalPriceAfter,
            Items: data.items,
            Channel: ChannelId
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('thanh toán qua ví không thành công'));
          }


          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.paymentV2 = async (data, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/PaymentEcommerce/get-qr-order`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: {
            ...data,
            channelId: ChannelId
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('Tạo đơn hàng không thành công'));
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.buyFiveelementTicket = async (data, userId, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/payment/buy-fiveelement-ticket`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: {
            parents: data,
            userId
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('thanh toán qua ví không thành công'));
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.paymentEcommerceVoucher = async (data, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/Payment/payment-ecommerce-voucher`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: {
            OrderId: data.orderId,
            Voucher: data.voucher,
            TicketCode: data.ticketCode,
            ProductId: data.productId,
            ProductName: data.productName,
            ProductPrice: data.productPrice
          }
        },
        (error, response, body) => {
          if (response.statusCode !== 200) {
            return reject({ RES_MES: response.statusMessage });
          }
          if (error) {
            return reject(error);
          }
          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.paymentQROrder = async (data, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/PaymentEcommerce/payment-qr-order`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: {
            ...data,
            channelId: ChannelId
          }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('thanh toán qua ví không thành công'));
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.checkQROrder = async (data, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          rejectUnauthorized:false,
          url: `${process.env.INVEST_API}/api/v1/PaymentEcommerce/check-qr-order`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          json: { ...data }
        },
        (error, response, body) => {
          if (error) {
            return reject(error);
          }

          if (!body) {
            return reject(new Error('Không tìm thấy đơn hàng'));
          }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};
