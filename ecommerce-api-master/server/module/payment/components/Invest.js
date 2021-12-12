const request = require("request");
const ChannelId = process.env.CHANNEL_ID || 7;

exports.createPaymentRequest = async (data, token) => {
  try {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "POST",
          url: `${process.env.INVEST_API}/api/v1/Payment/payment-ecommerce`,
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`
          },
          json: {
            OrderCode: data.orderCode,
            TotalPriceAfter: data.totalPriceAfter,
            Channel: ChannelId
          }
        },
        (error, response, body) => {
          if (error) {
            return resolve(error);
          }

          // if (response.statusCode == 400) {
          //   return reject(body);
          // }

          if (response.statusCode != 200) {
            return reject(new Error(response.statusMessage));
          }

          // if (!body) {
          //     return reject(new Error('thanh toán qua ví không thành công'));
          // }else{
          //     if(body.StatusCode != 200){
          //         return reject(new Error(body.Message));
          //     }
          // }

          return resolve(body);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};
