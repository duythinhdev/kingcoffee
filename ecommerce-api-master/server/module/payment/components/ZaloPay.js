// Node v10.15.3
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const qs = require('qs');


// APP INFO
const config = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  app_user: process.env.ZALOPAY_APP_USER,
  callback_url: `${process.env.baseUrl}/v1/payment/zalopay/ipn`, // process.env.ZALOPAY_CALLBACK_URL,
  endpoint_query: process.env.ZALOPAY_ENDPOINT_QUERY
};

exports.createPaymentRequest = ({
  orderCode,
  totalPrice,
  returnUrl
}) => {
  try {
    const embed_data = { "redirecturl": returnUrl };
    const items = [{}];
    const transID = orderCode;
    const order = {
      app_id: config.app_id,
      app_trans_id: transID, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: config.app_user,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: totalPrice,
      description: `Women Can Do - Thanh toán đơn hàng #${transID}`,
      bank_code: "zalopayapp",
      callback_url: config.callback_url
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    return axios.post(config.endpoint, null, { params: order })
      .then(res => res.data)
      .catch(err => err);

  } catch (error) {
    throw error;
  }
};

exports.ZaloPayIpn = (options) => {
  try {
    let dataStr = options.data;
    let reqMac = options.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      return {
        return_code: -1, // ZaloPay server sẽ callback lại (tối đa 3 lần)
        return_message: "mac not equal"
      };
    }
    else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      //console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

      return {
        return_code: 1, // ZaloPay server sẽ callback lại (tối đa 3 lần)
        return_message: "success",
        dataJson: dataJson
      };
    }
  } catch (ex) {
    return {
      return_code: 0, // ZaloPay server sẽ callback lại (tối đa 3 lần)
      return_message: ex.message
    };
  }
};

exports.getTransactionStatus = ({ requestId }) => {
  try {
    let postData = {
      app_id: config.app_id,
      app_trans_id: requestId, // Input your app_trans_id
    }

    let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();


    let postConfig = {
      method: 'post',
      url: config.endpoint_query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(postData)
    };

    return axios(postConfig)
      .then(response => response.data)
      .catch(error => error)

  } catch (error) {
    throw error;
  }
};