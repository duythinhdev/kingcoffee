const axios = require("axios");
const { createSignature, createRawSignature } = require("../payment.utils");
const notifyUrl = `${process.env.baseUrl}/v1/payment/momo/ipn`;
const dateFormat = require('dateformat');
const tmnCode_App = process.env.VNP_TMNCODE_APP;
const secretKey_App = process.env.VNP_HASHSERECT_APP;

const tmnCode_Web = process.env.VNP_TMNCODE_WEB;
const secretKey_Web = process.env.VNP_HASHSERECT_WEB;

const querystring = require('qs');

exports.createPaymentRequest = ({
  orderCode,
  totalPrice,
  orderInfo,
  returnUrl,
  ipAddr,
  flatform
}) => {
  try {
    let sha256 = require('sha256');
    let vnpUrl = process.env.VNP_URL;
    let date = new Date();
    let createDate = dateFormat(date, 'yyyymmddHHmmss');
    let amountVpn = totalPrice;
    let locale = 'vn';
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = flatform === 'mobile' ? tmnCode_App : tmnCode_Web;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderCode;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_Amount'] = amountVpn * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = this.sortObject(vnp_Params);

    let signData = (flatform === 'mobile' ? secretKey_App : secretKey_Web) + querystring.stringify(vnp_Params, { encode: false });
    let secureHash = sha256(signData);

    vnp_Params['vnp_SecureHashType'] =  'SHA256';
    vnp_Params['vnp_SecureHash'] = secureHash;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

    return {vnpUrl};

  } catch (error) {
    throw error;
  }
};

exports.VNPayIpn = (options) => {
  try {
      let sha256 = require('sha256');
      let vnp_Params = options;
      let secureHash = vnp_Params['vnp_SecureHash'];
      let flatform = vnp_Params['flatform'];
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];
      delete vnp_Params['flatform'];

      vnp_Params = this.sortObject(vnp_Params);
      let signData = (flatform === 'mobile' ? secretKey_App : secretKey_Web) + querystring.stringify(vnp_Params, { encode: false });

      let checkSum = sha256(signData);
      // console.log("checkSum",checkSum)

      if(secureHash === checkSum){
          // var orderId = vnp_Params['vnp_TxnRef'];
          var rspCode = vnp_Params['vnp_ResponseCode'];
          //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
          if(rspCode === '00'){
            return {
              RspCode: '00', 
              Message: 'success'
            };
          }
          return {
            RspCode: rspCode, 
            Message: 'Fail'
          };
      }
      else {
          return {
            RspCode: '97', 
            Message: 'Fail checksum'
          };
      }
    } catch (error) {
      throw error;
    }
};

exports.getTransactionStatus = ({ requestId, orderInfo, vnpTransDate, ipAddr, flatform }) => {
  try {
    let sha256 = require('sha256');
    let vnpUrl = process.env.VNP_URL_QUERY;
    let date = new Date();
    let createDate = dateFormat(date, 'yyyymmddHHmmss');
    let vnpTransDatePay = dateFormat(vnpTransDate, 'yyyymmddHHmmss');
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2';
    vnp_Params['vnp_Command'] = 'querydr';
    vnp_Params['vnp_TmnCode'] = flatform === 'mobile' ? tmnCode_App : tmnCode_Web;
    vnp_Params['vnp_TxnRef'] = requestId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_TransDate'] = vnpTransDatePay;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = this.sortObject(vnp_Params);

    let signData = (flatform === 'mobile' ? secretKey_App : secretKey_Web) + querystring.stringify(vnp_Params, { encode: false });
    let secureHash = sha256(signData);


    vnp_Params['vnp_SecureHashType'] =  'SHA256';
    vnp_Params['vnp_SecureHash'] = secureHash;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

    return axios
    .get(vnpUrl)
    .then(response => querystring.parse(response.data));

  } catch (error) {
    throw error;
  }
};

exports.sortObject = (o) => {
  let sorted = {},
      key, a = [];

  for (key in o) {
      if (o.hasOwnProperty(key)) {
          a.push(key);
      }
  }
  a.sort();
  for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
  }
  return sorted;
};