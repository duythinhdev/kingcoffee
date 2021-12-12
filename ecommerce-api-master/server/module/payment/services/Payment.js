/* eslint no-param-reassign: 0 */
// handle all payment data from other paymentGateway
const _ = require("lodash");
const Paypal = require("../components/Paypal");
const Stripe = require("../components/Stripe");
const Braintree = require("../components/Braintree");
const Momo = require("../components/Momo");
const VNPay = require("../components/VNPay");
const ZaloPay = require("../components/ZaloPay");
const Invest = require("../components/Invest");
const moment = require("moment");
const { createSignature, createRawSignature } = require("../payment.utils");
const { options } = require("@hapi/joi");

async function extendShopFeaturedSubscription(shopId) {
  try {
    const shop = await DB.Shop.findOne({
      _id: shopId,
    });
    if (!shop) {
      throw new Error("shop not found");
    }

    shop.featured = true;
    shop.featuredTo = moment().add(1, "month").toDate();
    return shop.save();
  } catch (e) {
    throw e;
  }
}

async function extendUserSubscribeSubscription(userId) {
  try {
    const user = await DB.User.findOne({
      _id: userId,
    });
    if (!user) {
      throw new Error("User not found");
    }

    // TODO - should use update function?
    user.subscribed = true;
    user.subscribeTo = moment().add(1, "month").toDate();
    return user.save();
  } catch (e) {
    throw e;
  }
}

exports.createSubscriptionTransaction = async (options) => {
  try {
    if (options.gateway !== "paypal") {
      throw new Error("Not support gateway now!");
    }

    const paymentOptions = options;
    const key = options.subscriptionType;
    paymentOptions.config = {
      mode: process.env.PAYPAL_MODE,
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
    };
    let config = await DB.Config.findOne({
      key,
    });
    if (!config) {
      const billingPlan = await Paypal.createSubscriptionPlan(
        key,
        paymentOptions
      );
      config = new DB.Config({
        key,
        value: billingPlan,
        name: options.description,
        visible: false,
      });
      await config.save();
    }

    const data = await Paypal.createSubscriptionPayment(
      config.value,
      paymentOptions
    );

    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.subscriptionType,
      price: options.price,
      description: options.description,
      products: [
        {
          id: options.subscriptionType,
          price: options.price,
          description: options.description,
        },
      ],
      paymentGateway: "paypal",
      paymentId: data.id,
      paymentToken: data.token,
      meta: Object.assign(options.meta, data),
    });

    await transaction.save();
    return {
      redirectUrl: data.links.approval_url,
    };
  } catch (e) {
    throw e;
  }
};

exports.executePaypalSubscriptionAgreement = async (paymentToken) => {
  try {
    const transaction = await DB.Transaction.findOne({
      paymentToken,
    });
    if (!transaction) {
      throw new Error("Cannot find this transaction");
    }

    const paymentOptions = {
      config: {
        mode: process.env.PAYPAL_MODE,
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
      },
    };
    const response = await Paypal.billingAgreementSubscription(
      paymentOptions,
      paymentToken
    );

    transaction.status = "completed";
    transaction.paymentResponse = response;
    transaction.paymentAgreementId = response.id;
    // Log.deep(data);
    return await transaction.save();
  } catch (e) {
    throw e;
  }
};

exports.updatePaypalTransaction = async (body) => {
  try {
    // NOT support for single sale for now, just manage for subscription
    if (
      !body.resource.billing_agreement_id ||
      body.event_type !== "PAYMENT.SALE.COMPLETED"
    ) {
      return true;
    }
    const transaction = await DB.Transaction.findOne({
      paymentAgreementId: body.resource.billing_agreement_id,
    });
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await DB.Transaction.update(
      {
        _id: transaction._id,
      },
      {
        $push: {
          histories: body,
        },
      }
    );

    // create new invoice for user
    const invoiceData = transaction.toObject();
    delete invoiceData._id;
    const invoice = new DB.Invoice(invoiceData);
    invoice.transactionId = transaction._id;
    await invoice.save();

    if (transaction.type === "shop_subscription") {
      await extendShopFeaturedSubscription(invoice.userId);
    } else if (transaction.type === "user_subscription") {
      await extendUserSubscribeSubscription(invoice.userId);
    }

    return true;
  } catch (e) {
    throw e;
  }
};

exports.createPaypalSinglePayment = async (options) => {
  try {
    const paymentOptions = options;
    paymentOptions.config = {
      mode: process.env.PAYPAL_MODE,
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
    };
    const data = await Paypal.createSinglePayment(paymentOptions);

    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      price: options.price,
      description: options.description,
      products: options.products || [
        {
          id: options.itemId,
          price: options.price,
          description: options.description,
        },
      ],
      paymentGateway: options.gateway,
      paymentId: data.id,
      paymentToken: data.token,
      meta: Object.assign(options.meta, data),
      itemId: options.itemId,
    });

    await transaction.save();
    return {
      redirectUrl: data.links.approval_url,
    };
  } catch (e) {
    throw e;
  }
};

exports.createStripeSinglePayment = async (options) => {
  try {
    const data = await Stripe.charge({
      amount: options.price * 100,
      // for stripe must use lowercase
      currency: process.env.SITE_CURRENCY.toLowerCase(),
      source: options.stripeToken,
      description: options.description,
    });

    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      price: options.price,
      description: options.description,
      products: options.products || [
        {
          id: options.itemId,
          price: options.price,
          description: options.description,
        },
      ],
      paymentGateway: options.gateway,
      paymentId: data.id,
      paymentToken: data.token,
      meta: Object.assign(options.meta, data),
      itemId: options.itemId,
      paymentResponse: data,
      status: "completed",
    });

    await transaction.save();
    const invoiceData = transaction.toObject();
    delete invoiceData._id;
    const invoice = new DB.Invoice(invoiceData);
    invoice.transactionId = transaction._id;
    await invoice.save();

    // re update for order status if have
    if (transaction.type === "order") {
      await Service.Order.updatePaid(options.itemId, transaction._id);
    } else if (transaction.type === "shop_featured") {
      await Service.ShopFeatured.updateFeatured({
        userId: transaction.userId,
        packageId: transaction.itemId,
        transaction,
      });
    }

    return data;
  } catch (e) {
    throw e;
  }
};

exports.createBraintreeSinglePayment = async (options) => {
  try {
    const data = await Braintree.charge(options.braintreeNonce, options.price);

    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      price: options.price,
      description: options.description,
      products: options.products || [
        {
          id: options.itemId,
          price: options.price,
          description: options.description,
        },
      ],
      paymentGateway: options.gateway,
      paymentId: data.id,
      paymentToken: data.token,
      meta: Object.assign(options.meta, data),
      itemId: options.itemId,
      paymentResponse: data,
      status: "completed",
    });

    await transaction.save();
    const invoiceData = transaction.toObject();
    delete invoiceData._id;
    const invoice = new DB.Invoice(invoiceData);
    invoice.transactionId = transaction._id;
    await invoice.save();

    // re update for order status if have
    if (transaction.type === "order") {
      await Service.Order.updatePaid(options.itemId, transaction._id);
    }

    return data;
  } catch (e) {
    throw e;
  }
};

exports.createSinglePayment = async (options) => {
  try {
    if (options.gateway === "paypal") {
      return this.createPaypalSinglePayment(options);
    } else if (options.gateway === "stripe") {
      return this.createStripeSinglePayment(options);
    } else if (options.gateway === "braintree") {
      return this.createBraintreeSinglePayment(options);
    }

    throw new Error("Not support other gateway yet");
  } catch (e) {
    throw e;
  }
};

exports.executePaypalSinglePayment = async (transaction, options) => {
  try {
    if (transaction.paymentGateway !== "paypal") {
      throw new Error("Not support yet");
    }

    const paymentOptions = {
      config: {
        mode: process.env.PAYPAL_MODE,
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
      },
      payerId: options.PayerID,
      price: transaction.price,
      paymentId: transaction.paymentId,
    };

    const data = await Paypal.executeSinglePayment(paymentOptions);
    transaction.paymentResponse = data;
    transaction.status = "completed";
    await transaction.save();

    const invoiceData = transaction.toObject();
    delete invoiceData._id;
    const invoice = new DB.Invoice(invoiceData);
    invoice.transactionId = transaction._id;
    await invoice.save();

    if (transaction.type === "order") {
      await Service.Order.updatePaid(transaction.itemId, transaction._id);
    } else if (transaction.type === "shop_featured") {
      await Service.ShopFeatured.updateFeatured({
        userId: transaction.userId,
        packageId: transaction.itemId,
        transaction,
      });
    }

    return data;
  } catch (e) {
    throw e;
  }
};

exports.createMomoTransaction = async (options) => {
  try {
    const momoOptions = {
      orderId: options.orderId,
      amount: options.totalPrice.toString(),
      orderInfo: options.orderInfo,
      requestId: options.orderCode,
      extraData: options.extraData,
      returnUrl: options.returnUrl,
    };
    const data = await Momo.createPaymentRequest(momoOptions);
    // if (data.errorCode !== 0) {
    //   return data;
    // }
    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      typeId: options.orderId,
      totalPrice: options.totalPrice,
      products: options.orderDetails,
      paymentId: options.orderCode,
      description: "Payment with MoMo",
      paymentGateway: "momo",
      paymentResponse: {
        createTransactionResponse: data,
      },
      status: "pending",
    });
    await transaction.save();
    data.transaction = transaction;
    return data;
  } catch (error) {
    throw error;
  }
};

exports.updateMomoTransaction = async (body) => {
  try {
    const {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType,
      transId,
      localMessage,
      errorCode,
      message,
      payType,
      extraData,
    } = body;

    let responseTime = body.responseTime;

    let rawSignature = createRawSignature({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType,
      transId,
      message,
      localMessage,
      responseTime,
      errorCode,
      payType,
      extraData,
    });
    let signature = createSignature(rawSignature);
    if (signature !== body.signature) {
      return {
        errorCode: 5,
        message: "Signature wrong. Check raw signature before signed",
      };
    }

    const query = {
      status: "pending",
      paymentId: body.requestId,
    };

    const transaction = await DB.Transaction.findOne(query);

    if (!transaction) {
      return {
        errorCode: 58,
        message: "Giao dich khong ton tai",
      };
    }

    if (body.errorCode === "0") {
      transaction.status = "success";
    } else {
      transaction.status = "fail";
    }

    transaction.paymentResponse = {
      ...transaction.paymentResponse,
      momoIpnRequest: body,
    };

    await transaction.save();

    if (transaction.status === "success") {
      // phòng trường hợp, user tắt trình duyệt trước khi momo callback về
      await this.updateOrderAfterPaymentSuccess(transaction);
    }

    responseTime = moment().format("YYYY-MM-DD HH:mm:ss");

    rawSignature = createRawSignature({
      partnerCode,
      accessKey,
      requestId,
      orderId,
      errorCode,
      message,
      responseTime,
      extraData,
    });
    signature = createSignature(rawSignature);

    return {
      partnerCode,
      accessKey,
      requestId,
      orderId,
      errorCode,
      message,
      responseTime,
      extraData,
      signature,
    };
  } catch (e) {
    throw e;
  }
};

// Đang không xài.
exports.checkMomoTransactionStatus = async ({ orderId, requestId }) => {
  try {
    const query = {
      status: "pending",
      paymentId: requestId,
    };

    const transaction = await DB.Transaction.findOne(query);

    if (!transaction) {
      return {
        errorCode: 58,
        message: "Giao dich khong ton tai",
      };
    }

    const transactionStatus = await Momo.getTransactionStatus({
      orderId,
      requestId,
    });

    if (transactionStatus.errorCode === 0) {
      transaction.status = "success";
    } else {
      transaction.status = "fail";
    }

    transaction.paymentResponse = {
      ...transaction.paymentResponse,
      momoTransactionStatusResponse: transactionStatus,
    };

    transaction.save();
    return {
      errorCode: transactionStatus.errorCode,
      message: transactionStatus.message,
      localMessage: transactionStatus.localMessage,
    };
  } catch (e) {
    throw e;
  }
};

exports.callbackMomoPayment = async ({ orderId, requestId }) => {
  try {
    const query = {
      //status: "pending",
      paymentId: requestId,
    };

    const transaction = await DB.Transaction.findOne(query);

    if (!transaction) {
      return {
        errorCode: 58,
        message: "Giao dich khong ton tai",
      };
    }

    let res;
    if (
      !transaction.paymentResponse.momoIpnRequest &&
      transaction.status === "pending"
    ) {
      const transactionStatus = await Momo.getTransactionStatus({
        orderId,
        requestId,
      });

      if (transactionStatus.errorCode === 0) {
        transaction.status = "success";
      } else {
        transaction.status = "fail";
      }

      transaction.paymentResponse = {
        ...transaction.paymentResponse,
        momoTransactionStatusResponse: transactionStatus,
      };

      transaction.save();

      // update order sau khi payment thành công.
      if (transaction.status === "success") {
        await this.updateOrderAfterPaymentSuccess(transaction);
      }

      res = {
        errorCode: transactionStatus.errorCode,
        message: transactionStatus.message,
        localMessage: transactionStatus.localMessage,
      };
    } else {
      res = {
        errorCode: transaction.paymentResponse.momoIpnRequest.errorCode,
        message: transaction.paymentResponse.momoIpnRequest.message,
        localMessage: transaction.paymentResponse.momoIpnRequest.localMessage,
      };
    }

    return res;
  } catch (e) {
    throw e;
  }
};

/*--------------------------PAYMENT WITH INVEST WALLET---------------------*/
exports.createInvestTransaction = async (options, token) => {
  try {
    const investOptions = {
      orderCode: options.orderCode,
      totalPriceAfter: options.totalPrice,
    };

    const data = await Invest.createPaymentRequest(investOptions, token);

    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      typeId: null,
      totalPrice: options.totalPrice,
      paymentId: options.orderCode,
      description: "Payment with Invest",
      paymentGateway: "viTni",
      paymentResponse: {
        createTransactionResponse: data,
      },
      status: "success",
    });

    if (data.StatusCode !== 200) {
      transaction.status = "fail";
    }

    await transaction.save();
    data.transaction = transaction;

    return data;
  } catch (error) {
    throw error;
  }
};

exports.createCODTransaction = async (options) => {
  try {
    let data;
    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      typeId: null,
      totalPrice: options.totalPrice,
      paymentId: options.orderCode,
      description: "Payment with COD",
      paymentGateway: "cod",
      paymentResponse: {
        createTransactionResponse: data,
      },
      status: "pending",
    });

    await transaction.save();
    data = { transaction };

    return data;
  } catch (error) {
    throw error;
  }
};

exports.cancelTransaction = async (type, typeId, reasonCancel) => {
  try {
    const transaction = await DB.Transaction.findOne({
      type: type,
      typeId: typeId,
    });
    transaction.status = "fail";
    transaction.paymentResponse = {
      reasonCancel: reasonCancel,
    };
    await transaction.save();
  } catch (error) {
    throw error;
  }
};

/*--------------------------PAYMENT WITH VNPAY---------------------*/

exports.createVNPayTransaction = async (options) => {
  try {
    const vnpOptions = {
      orderId: options.orderId,
      orderCode: options.orderCode,
      totalPrice: options.totalPrice,
      orderInfo: options.orderInfo,
      returnUrl: options.returnUrl,
      ipAddr: options.ipAddr,
      flatform: options.flatform,
    };

    const data = await VNPay.createPaymentRequest(vnpOptions);
    // if (data.errorCode !== 0) {
    //   return data;
    // }
    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      typeId: options.orderId,
      totalPrice: options.totalPrice,
      products: options.orderDetails,
      paymentId: options.orderCode,
      description: "Payment with VNPay",
      paymentGateway: "vnpay",
      paymentResponse: {
        createUrlRequest: data,
      },
      status: "pending",
    });
    await transaction.save();
    data.transaction = transaction;
    return data;
  } catch (error) {
    throw error;
  }
};

exports.updateVNPayTransaction = async (options) => {
  try {
    let data = await VNPay.VNPayIpn(options);
    // if(data.RspCode !== '00'){
    //   return data;
    // }
    if (data.RspCode === "97") {
      return data;
    }
    const query = {
      // status: "pending",
      paymentId: options.vnp_TxnRef,
    };

    const transaction = await DB.Transaction.findOne(query);

    if (!transaction) {
      return {
        RspCode: "01",
        Message: "Transaction not found",
      };
    }
    if (transaction.status != "pending") {
      return {
        RspCode: "02",
        Message: "Order already confirmed",
      };
    }
    //Kiểm tra amount có khớp nhau
    if (Number(options.vnp_Amount) / 100 != transaction.totalPrice) {
      return {
        RspCode: "04",
        Message: "Invalid Amount",
      };
    }

    if (data.RspCode === "00") {
      transaction.status = "success";
    } else {
      // vẫn giữ pending với các trường hợp ngược lại
      // transaction.status = "fail";
      //24 khi hủy thanh toán
      if (data.RspCode === "24") {
        transaction.status = "fail";
      }
      if (data.RspCode !== "97") {
        data.RspCode = "00";
      }
    }

    transaction.paymentResponse = {
      ...transaction.paymentResponse,
      vpnIpnRequest: options,
    };

    await transaction.save();

    if (transaction.status === "success") {
      // phòng trường hợp, user tắt trình duyệt trước khi vnPay callback về
      await this.updateOrderAfterPaymentSuccess(transaction);
    }

    return data;
  } catch (e) {
    return {
      RspCode: "99",
      Message: "Exception Error",
    };
  }
};

exports.callbackVNPayPayment = async ({ requestId, userIP, flatform }) => {
  try {
    const query = {
      //status: "pending",
      paymentId: requestId,
    };

    if (!flatform) {
      throw new Error("'flatform' is required in header!");
    }

    const transaction = await DB.Transaction.findOne(query);

    let res;
    if (transaction) {
      if (transaction.status == "fail") {
        res = {
          errorCode: "40",
          message: "Giao dịch thất bại",
          localMessage: "Giao dịch thất bại",
        };
      } else if (
        !transaction.paymentResponse.vpnIpnRequest &&
        transaction.status === "pending"
      ) {
        const transactionStatus = await VNPay.getTransactionStatus({
          requestId,
          orderInfo: transaction.description,
          vnpTransDate: transaction.createdAt,
          ipAddr: userIP,
          flatform: flatform,
        });

        if (transactionStatus.vnp_ResponseCode === "00") {
          if (transactionStatus.vnp_TransactionStatus === "00") {
            res = {
              errorCode: transactionStatus.vnp_TransactionStatus,
              message: "success",
              localMessage: "Giao dịch thành công",
            };
            transaction.status = "success";
          } else if (transactionStatus.vnp_TransactionStatus === "01") {
            res = {
              errorCode: transactionStatus.vnp_TransactionStatus,
              message: "pending",
              localMessage: "Giao dịch chưa hoàn tất",
            };
          } else {
            res = {
              errorCode: transactionStatus.vnp_TransactionStatus,
              message: "fail",
              localMessage: "Giao dịch thất bại",
            };
            // transaction.status = "fail";
          }
        } else {
          res = {
            errorCode: transactionStatus.vnp_ResponseCode,
            message: "fail",
            localMessage: "Giao dịch thất bại",
          };
        }
        //Kiểm tra amount có khớp nhau
        if (
          Number(transactionStatus.vnp_Amount) / 100 !=
          transaction.totalPrice
        ) {
          res = {
            errorCode: "04",
            message: "fail",
            localMessage: "Giao dịch thất bại",
          };
          transaction.status = "pending";
        }

        transaction.paymentResponse = {
          ...transaction.paymentResponse,
          vnpTransactionStatusResponse: transactionStatus,
        };
        transaction.save();

        // update order sau khi payment thành công
        if (transaction.status === "success") {
          await this.updateOrderAfterPaymentSuccess(transaction);
        }

      } else {
        if (transaction.paymentResponse.vpnIpnRequest) {
          if (
            transaction.paymentResponse.vpnIpnRequest.vnp_ResponseCode === "00"
          ) {
            if (transaction.status === "success") {
              res = {
                errorCode:
                  transaction.paymentResponse.vpnIpnRequest.vnp_ResponseCode,
                message: "success",
                localMessage: "Giao dịch thành công",
              };
            } else {
              res = {
                errorCode: "01",
                message: "fail",
                localMessage: "Giao dịch thất bại",
              };
            }
            if (
              Number(transaction.paymentResponse.vpnIpnRequest.vnp_Amount) /
              100 !=
              transaction.totalPrice
            ) {
              res = {
                errorCode: "04",
                message: "fail",
                localMessage: "Giao dịch thất bại",
              };
            }
          } else {
            res = {
              errorCode:
                transaction.paymentResponse.vpnIpnRequest.vnp_ResponseCode,
              message: "fail",
              localMessage: "Giao dịch thất bại",
            };
          }
        } else if (transaction.paymentResponse.vnpTransactionStatusResponse) {
          if (
            transaction.paymentResponse.vnpTransactionStatusResponse
              .vnp_TransactionStatus === "00"
          ) {
            res = {
              errorCode:
                transaction.paymentResponse.vnpTransactionStatusResponse
                  .vnp_TransactionStatus,
              message: "success",
              localMessage: "Giao dịch thành công",
            };
            if (
              Number(
                transaction.paymentResponse.vnpTransactionStatusResponse
                  .vnp_Amount
              ) /
              100 !=
              transaction.totalPrice
            ) {
              res = {
                errorCode: "04",
                message: "fail",
                localMessage: "Giao dịch thất bại",
              };
            }
          } else {
            res = {
              errorCode:
                transaction.paymentResponse.vnpTransactionStatusResponse
                  .vnp_TransactionStatus,
              message: "fail",
              localMessage: "Giao dịch thất bại",
            };
          }
        } else {
          res = {
            errorCode: "40",
            message: "fail",
            localMessage: "Giao dịch thất bại",
          };
        }
      }
    } else {
      res = {
        errorCode: "01",
        message: "Giao dịch không tồn tại",
        localMessage: "Giao dịch không tồn tại",
        order: {
          orderCode: requestId,
        },
      };
      return res;
    }

    const order = await DB.Order.findOne({ _id: transaction.typeId });
    res.order = order;
    return res;
  } catch (e) {
    throw e;
  }
};

/*--------------------------PAYMENT WITH ZALOPAY---------------------*/

exports.createZaloPayTransaction = async (options) => {
  try {
    const vnpOptions = {
      orderCode: options.orderCode,
      totalPrice: options.totalPrice,
      returnUrl: options.returnUrl,
    };

    const data = await ZaloPay.createPaymentRequest(vnpOptions);

    const transaction = new DB.Transaction({
      userId: options.userId,
      type: options.type,
      typeId: options.orderId,
      totalPrice: options.totalPrice,
      products: options.orderDetails,
      paymentId: options.orderCode,
      description: "Payment with ZaloPay",
      paymentGateway: "zalopay",
      paymentResponse: {
        createTransactionResponse: data,
      },
      status: "pending",
    });
    await transaction.save();
    data.transaction = transaction;
    return data;
  } catch (error) {
    throw error;
  }
};

exports.updateZaloPayTransaction = async (options) => {
  try {
    let response;
    const data = await ZaloPay.ZaloPayIpn(options);

    if (data.return_code === -1) {
      return data;
    }

    const query = {
      status: "pending",
      paymentId: data.dataJson.app_trans_id,
    };

    const transaction = await DB.Transaction.findOne(query);

    if (!transaction) {
      return (response = {
        return_code: 0,
        return_message: "Transaction not found",
      });
    }

    if (data.return_code === 1) {
      transaction.status = "success";
    } else {
      transaction.status = "fail";
    }

    transaction.paymentResponse = {
      ...transaction.paymentResponse,
      zaloIpnRequest: options,
      zaloIpnResponse: data,
    };

    await transaction.save();

    if (transaction.status === "success") {
      // phòng trường hợp, user tắt trình duyệt trước khi zaloPay callback về
      await this.updateOrderAfterPaymentSuccess(transaction);
    }

    return (response = {
      return_code: data.return_code,
      return_message: data.return_message,
    });
  } catch (e) {
    throw e;
  }
};

exports.callbackZaloPayPayment = async ({ requestId }) => {
  try {
    const query = {
      //status: "pending",
      paymentId: requestId,
    };
    const transaction = await DB.Transaction.findOne(query);

    if (!transaction) {
      return {
        errorCode: 58,
        message: "Giao dich khong ton tai",
      };
    }

    let res = {};
    if (
      !transaction.paymentResponse.zaloIpnResponse &&
      transaction.status === "pending"
    ) {
      // transactionStatus.return_code == 1 => Thanh toán thành công
      const transactionStatus = await ZaloPay.getTransactionStatus({
        requestId,
      });

      res = {
        errorCode: transactionStatus.return_code,
        message: transactionStatus.return_message,
        localMessage: transactionStatus.return_message,
      };

      if (transactionStatus.return_code === 1) {
        transaction.status = "success";
      } else if (transactionStatus.return_code !== 3) {
        transaction.status = "fail";
      }

      transaction.paymentResponse = {
        ...transaction.paymentResponse,
        zaloTransactionStatusResponse: transactionStatus,
      };
      transaction.save();

      //Tạo đơn vận sau khi update transaction
      if (transaction.status === "success") {
        await this.updateOrderAfterPaymentSuccess(transaction);
      }

    } else {
      if (transaction.paymentResponse.zaloIpnResponse) {
        if (transaction.paymentResponse.zaloIpnResponse.return_code === 1) {
          res = {
            errorCode: transaction.paymentResponse.zaloIpnResponse.return_code,
            message: "Thanh toán thành công!",
            localMessage: "Thanh toán thành công!",
          };
        } else if (
          transaction.paymentResponse.zaloIpnResponse.return_code === 3
        ) {
          res = {
            errorCode: transaction.paymentResponse.zaloIpnResponse.return_code,
            message: "Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý!",
            localMessage: "Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý!",
          };
        } else {
          res = {
            errorCode: transaction.paymentResponse.zaloIpnResponse.return_code,
            message: "Thanh toán thất bại!",
            localMessage: "Thanh toán thất bại!",
          };
        }
      }
    }

    console.log("res", res)

    return res;
  } catch (e) {
    throw e;
  }
};

exports.updateOrderAfterPaymentSuccess = async (transaction) => {
  const order = await DB.Order.findOne({ _id: transaction.typeId });
  const user = await DB.User.findOne({ _id: order.customerId });

  if (order && transaction.status === "success") {

    // update status Order.
    order.orderStatus = "ordered";
    await order.save();

    // update orderLog.
    const orderLogs = await DB.OrderLog.find({
      orderId: order._id,
      eventType: "orderStatus",
    }).sort({ createdAt: -1 });

    if (!_.isEmpty(orderLogs)) {
      let orderLog = orderLogs[0];
      orderLog.newData = order.orderStatus;
      await orderLog.save();
    }

    // tạo vận đơn.
    if (
      user.userRoles.find(
        (x) => x.Role !== Enums.UserEnums.UserRole.HUB.value
      ) &&
      !user.userRoles.find(
        (x) => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
      )
    ) {
      await Service.Delivery.createShipment(order, null);
    }

    // Gửi sendSms.
    await Service.Notification.sendSms(
      {
        type: Enums.SendEmailEnums.SendEmailType.OrderSuccess.value,
        orderCode: order.orderCode,
        phoneNumber: order.phoneNumber,
      },
      user
    );

    //Gửi email.
    await Service.Notification.sendEmail(
      {
        type: Enums.SendEmailEnums.SendEmailType.OrderSuccess.value,
        orderId: order._id.toString(),
      },
      user
    );

  }
}