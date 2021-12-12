const axios = require("axios");
const { createSignature, createRawSignature } = require("../payment.utils");

const accessKey = process.env.MOMO_ACCESS_KEY;
const partnerCode = process.env.MOMO_PARTNER_CODE;
const momoEndpoint = `${process.env.MOMO_DOMAIN}/gw_payment/transactionProcessor`;
const notifyUrl = `${process.env.baseUrl}/v1/payment/momo/ipn`;

exports.createPaymentRequest = ({
  orderId,
  amount,
  orderInfo,
  requestId,
  extraData = "",
  returnUrl
}) => {
  const requestType = "captureMoMoWallet";
  //const notifyUrl = notifyUrl;
  const rawSignature = createRawSignature({
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    returnUrl,
    notifyUrl,
    extraData
  });

  const signature = createSignature(rawSignature);

  return axios
    .post(momoEndpoint, {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      returnUrl,
      notifyUrl,
      requestType,
      signature,
      extraData
    })
    .then(response => response.data);
};

exports.getTransactionStatus = ({ orderId, requestId }) => {
  const requestType = "transactionStatus";
  const rawSignature = createRawSignature({
    partnerCode,
    accessKey,
    requestId,
    orderId,
    requestType
  });
  const signature = createSignature(rawSignature);
  return axios
    .post(momoEndpoint, {
      partnerCode,
      accessKey,
      requestId,
      orderId,
      requestType,
      signature
    })
    .then(response => response.data);
};
