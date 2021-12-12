/* eslint-disable no-mixed-operators */
/* eslint-disable no-useless-concat */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
const _ = require("lodash");

const SITE_CURRENCY = process.env.SITE_CURRENCY || "VND";
const PAYMENT_TYPE_PRICE = process.env.PAYMENT_TYPE_PRICE || 1000000;
const { ORDER_STATUS } = require("../../delivery/delivery.constants.js");

const calcTradeDiscount = (param = {}) => {
  const { configs } = param;
  const data = {
    amount: param.totalItem * 0.9,
    commission: 0,
    commissionRate: 0,
    priceReceiverAdmin: 0,
    tradeDiscountGoldtime: 0,
    tradeDiscountUser: 0,
    priceUserDiscount: 0
  };

  if (configs.tradeDiscountSeller) {
    data.commission = (configs.tradeDiscountSeller / 100) * data.amount || 0;
    data.commissionRate = configs.tradeDiscountSeller;
  }

  if (configs.tradeDiscountGoldtime) {
    data.tradeDiscountGoldtime = configs.tradeDiscountGoldtime;
    data.priceReceiverAdmin =
        (configs.tradeDiscountGoldtime / 100) * param.totalItem || 0;
  }

  if (configs.tradeDiscountUser) {
    data.tradeDiscountUser = configs.tradeDiscountUser;
    data.priceUserDiscount =
        (configs.tradeDiscountUser / 100) * param.totalItem || 0;
  }

  return data;
};

exports.create = async (data, user) => {
  try {
    // get currency if have
    const userCurrency = SITE_CURRENCY;
    const productIds = data.products.map(p => p.productId);
    const products = await DB.Product.find({ _id: { $in: productIds } })
        .populate("shop")
        .populate("mainImage");
    if (!products.length) {
      throw new Error("Không tìm thấy bất kì sản phẩm nào trong giỏ hàng");
    }

    const mappingProducts = [];
    data.products.filter(product => {
      const p = products.find(i => i._id.toString() === product.productId);
      if (p) {
        product.product = p;
        product.shop = p.shop;

        mappingProducts.push(product);

        return true;
      }

      throw new Error(
          `Sản phẩm '${product.productId}' không tồn tại hoặc đã bị xóa`
      );
    });
    const customerInfo = _.pick(data, [
      "phoneNumber",
      "firstName",
      "lastName",
      "email",
      "city",
      "district",
      "ward",
      "zipCode",
      "streetAddress",
      "shippingAddress",
      "userIP",
      "userAgent"
    ]);

    // TODO - check product stock quanntity, check shipping method or COD
    const orderDetails = [];
    const order = new DB.Order(
        Object.assign(customerInfo, {
          customerId: user._id,
          currency: SITE_CURRENCY,
          userCurrency,
          transportation: data.transportation ? data.transportation.name : "",
          transportationId: data.transportation ? data.transportation.id : null,
          percentDiscount: data.percentDiscount,
          shippingPrice: data.shippingPrice,
          expectedDeliveryDate: data.expectedDeliveryDate,
          promotions: data.promotions && data.promotions.length > 0 ? await data.promotions.map(prom => {
            return {
              discountPercent: 0,
              discountPrice: 0,
              promotion: prom.toString()
            }
          }) : []
        })
    );

    //create order code with user role
    if (
        user.userRoles.find(
            x => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
        )
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.WE_HOME.value
      );
      order.isAssignHub = false;
    } else if (
        user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE.value)
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.WE.value
      );
    } else if (
        user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE_FREE.value)
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.WE.value
      );
    } else if (
        user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.HUB.value)
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.HUB.value
      );
    } else {
      throw new Error(`User Admin is not create order`);
    }

    let totalPrice = 0;
    let totalProducts = 0;

    // TODO - check shipping fee deeply with shop settings
    const shopsInCart = [];

    var errorMessage = "";
    let orderDetail = [];
    for (const product of mappingProducts) {
      //salePrice: product price after user logged in
      // let unitPrice = product.product.salePrice;

      let unitPrice;
      if (
          user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE_FREE.value)
      ) {
        unitPrice = product.product.price;
      } else {
        unitPrice = product.product.salePrice;
      }

      orderDetail = new DB.OrderDetail(
          Object.assign(customerInfo, {
            orderId: order._id,
            customerId: user._id || null,
            shopId: product.shop._id,
            productId: product.product._id,
            userNote: product.userNote,
            quantity: product.quantity,
            weight: product.product.weight,
            unitPrice,
            currency: SITE_CURRENCY,
            userCurrency,
            promotions: product.promotions && product.promotions.length > 0 ? await product.promotions.map(prom => {
              return {
                discountPercent: 0,
                discountPrice: 0,
                promotion: prom.toString()
              }
            }) : []
          })
      );

      // TODO - calculate total price of order detail
      orderDetail.totalPrice = unitPrice * product.quantity;
      totalPrice += orderDetail.totalPrice;
      totalProducts += orderDetail.quantity;

      //Kiểm tra sản phẩm thuộc chương trình Khuyến mãi đơn mua sp ưu đãi thì không tính vào totalPrice của order
      if (orderDetail.promotions && orderDetail.promotions.length > 0) {
        for (const prom of orderDetail.promotions) {
          const checkPromotion = await DB.Promotion.findOne({
            _id: prom.promotion,
            promotionForm: Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct.value
          });

          if (checkPromotion) {
            totalPrice -= orderDetail.totalPrice;
            break;
          }
        }
      }

      orderDetails.push(orderDetail);
    }

    order.totalProducts = totalProducts;
    order.totalDiscountPrice = totalPrice * order.percentDiscount;

    order.totalPrice = Math.round(totalPrice - order.totalDiscountPrice);

    //check and apply promotions for order and order detail
    await Service.Promotion.applyPromotionForOrder({
      customerInfo,
      order,
      orderDetails,
      user,
      userCurrency,
      freeShipCode: data.freeShipCode ? data.freeShipCode : null
    });

    // < 1tr tính ship
    // >= 1tr free ship
    if (!user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.HUB.value)
        && order.totalPrice < Number(process.env.PAYMENT_TYPE_PRICE)) {
      order.totalPrice = Math.round(order.totalPrice + order.shippingPrice);
    }

    order.orderStatus = "failOrdered";

    const paymentMethodsConfig = await DB.Config.findOne({ "key": "paymentGatewayConfig" });

    if (data.paymentMethod && paymentMethodsConfig && paymentMethodsConfig.value.paymentMethods && paymentMethodsConfig.value.paymentMethods.length > 0) {
      if (!paymentMethodsConfig.value.paymentMethods.find(x => x.value === data.paymentMethod && x.enable))
        throw new Error("Payment method is invalid!");
    }

    var paymentResponse;
    switch (data.paymentMethod) {
        //Invest wallet
      case paymentMethodsConfig.value.paymentMethods[0].value:
        const userSocial = await Service.User.GetInvestUserId(user._id);
        paymentResponse = await Service.Payment.createInvestTransaction(
            {
              orderCode: order.orderCode,
              totalPrice: order.totalPrice,
              userId: user._id,
              type: "order"
            },
            userSocial.accessToken
        );

        if (paymentResponse.StatusCode !== 200) {
          order.orderStatus = "failOrdered"; // Đặt hàng thất bại
          errorMessage = paymentResponse.Message;
        }
        else {
          order.orderStatus = "ordered";
        }
        break;
        //MoMo
      case paymentMethodsConfig.value.paymentMethods[1].value:
        await order.save();
        if (order._id) {
          paymentResponse = await Service.Payment.createMomoTransaction({
            orderId: order._id.toString(),
            totalPrice: order.totalPrice,
            orderInfo: "TNI request payment",
            orderCode: order.orderCode,
            extraData: "",
            returnUrl: data.returnUrl ? data.returnUrl : ""
          });

          if (paymentResponse.errorCode !== 0) {
            order.orderStatus = "failOrdered"; // Đặt hàng thất bại
            paymentResponse.transaction.status = "fail";
            errorMessage = paymentResponse.localMessage;
          }
        }
        break;
        //COD
      case paymentMethodsConfig.value.paymentMethods[2].value:
        paymentResponse = await Service.Payment.createCODTransaction({
          orderCode: order.orderCode,
          totalPrice: order.totalPrice,
          userId: user._id,
          type: "order"
        });

        order.orderStatus = "ordered";
        break;
        //VNPay
      case paymentMethodsConfig.value.paymentMethods[3].value:
        if (!data.returnUrl) {
          throw new Error("'returnUrl' is required with VNPAY method!");
        }
        if (!data.flatform) {
          throw new Error("'flatform' is required with VNPAY method in hearder!");
        }
        await order.save();
        if (order._id) {
          paymentResponse = await Service.Payment.createVNPayTransaction({
            orderId: order._id.toString(),
            orderCode: order.orderCode,
            totalPrice: order.totalPrice,
            orderInfo: "TNI request payment",
            returnUrl: data.returnUrl ? data.returnUrl : "",
            ipAddr: order.userIP,
            flatform: data.flatform
          });

          // if (paymentResponse.errorCode !== 0) {
          //   order.orderStatus = "failOrdered"; // Đặt hàng thất bại
          //   paymentResponse.transaction.status = "fail";
          //   errorMessage = paymentResponse.localMessage;
          // }
        }
        break;
        //ZaloPay
      case paymentMethodsConfig.value.paymentMethods[4].value:
        if (!data.returnUrl) {
          throw new Error("'returnUrl' is required with ZALOPAY method!");
        }
        await order.save();
        if (order._id) {
          paymentResponse = await Service.Payment.createZaloPayTransaction({
            orderId: order._id.toString(),
            orderCode: order.orderCode,
            totalPrice: order.totalPrice,
            returnUrl: data.returnUrl ? data.returnUrl : "",
          });
          const requestId = order.orderCode;
          setTimeout(async () => {
            await Service.Payment.callbackZaloPayPayment({ requestId })
          }, 960000); // 16 phút sau sẽ gọi callback 1 lần nữa.

          if (paymentResponse.return_code !== 1) {
            order.orderStatus = "failOrdered"; // Đặt hàng thất bại
            paymentResponse.transaction.status = "fail";
            errorMessage = paymentResponse.return_message;
          }
        }
        break;
    }

    if (user.userRoles.find(x => x.Role !== Enums.UserEnums.UserRole.HUB.value) && paymentResponse.transaction)
      order.transactionId = paymentResponse.transaction._id;

    await Promise.all([order.save(), DB.OrderDetail.insertMany(orderDetails)]);

    if ((order.orderStatus === "ordered" && paymentResponse.transaction && paymentResponse.transaction.status === "success")
        || data.paymentMethod === paymentMethodsConfig.value.paymentMethods[2].value) {
      await Service.Notification.sendSms(
          {
            type: Enums.SendEmailEnums.SendEmailType.OrderSuccess.value,
            orderCode: order.orderCode,
            phoneNumber: order.phoneNumber
          },
          user
      );

      await Service.Notification.sendEmail(
          {
            type: Enums.SendEmailEnums.SendEmailType.OrderSuccess.value,
            orderId: order._id.toString(),
          },
          user
      );
    }

    if (order._id) {
      if (user.userRoles.find(x => x.Role !== Enums.UserEnums.UserRole.HUB.value)) {
        paymentResponse.transaction.typeId = order._id;
        paymentResponse.transaction.save();
      }

      const orderLog = {
        orderId: order._id,
        eventType: "orderStatus",
        changeBy: user._id,
        oldData: null,
        newData: order.orderStatus,
        description: "Create Order"
      };
      await Service.OrderLog.create(orderLog);
    }

    var createShipmentRes;
    if (
        user.userRoles.find(x => x.Role !== Enums.UserEnums.UserRole.HUB.value) &&
        !user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE_HOME.value)
    ) {
      switch (data.paymentMethod) {
          //Invest wallet
        case paymentMethodsConfig.value.paymentMethods[0].value:
          //Tạo đơn vận sau khi order thành công (Thanh toán thông qua ví Invest)
          if (paymentResponse.StatusCode === 200) {
            createShipmentRes = await Service.Delivery.createShipment(order, null);
            if (createShipmentRes && !createShipmentRes.isSuccess)
              errorMessage = createShipmentRes.body.message;
          }
          break;
          //COD
        case paymentMethodsConfig.value.paymentMethods[2].value:
          if (paymentResponse.transaction) {
            createShipmentRes = await Service.Delivery.createShipment(order, null);
            if (createShipmentRes && !createShipmentRes.isSuccess)
              errorMessage = createShipmentRes.body.message;
          }
          break;
      }
    }

    if (user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.HUB.value)) {
      return {
        order: {
          orderStatus: order.orderStatus,
          message: errorMessage ? errorMessage : ""
        }
      };
    } else {
      return {
        order: {
          orderCode: order.orderCode,
          orderStatus: order.orderStatus,
          payUrl: paymentResponse.payUrl ? paymentResponse.payUrl : "",
          vnpUrl: paymentResponse.vnpUrl ? paymentResponse.vnpUrl : "",
          zaloPayUrl: paymentResponse.order_url ? paymentResponse.order_url + "&openbank=zalopayapp" : "",
          zaloPayToken: paymentResponse.zp_trans_token ? paymentResponse.zp_trans_token : "",
          qrCodeUrl: paymentResponse.qrCodeUrl ? paymentResponse.qrCodeUrl : "",
          deeplink: paymentResponse.deeplink ? paymentResponse.deeplink : "",
          deeplinkWebInApp: paymentResponse.deeplinkWebInApp
              ? paymentResponse.deeplinkWebInApp
              : "",
          message: errorMessage ? errorMessage : ""
        }
      };
    }
  } catch (e) {
    throw e;
  }
};

exports.createFromOrder = async (data, user) => {
  try {
    // get currency if have
    const userCurrency = SITE_CURRENCY;
    const productIds = data.products.map(p => p.productId);
    const products = await DB.Product.find({ _id: { $in: productIds } })
        .populate("shop")
        .populate("mainImage");
    if (!products.length) {
      throw new Error("Không tìm thấy bất kì sản phẩm nào trong giỏ hàng");
    }

    const mappingProducts = [];
    data.products.filter(product => {
      const p = products.find(i => i._id.toString() === product.productId);
      if (p) {
        product.product = p;
        product.shop = p.shop;

        mappingProducts.push(product);

        return true;
      }

      throw new Error(
          `Sản phẩm '${product.productId}' không tồn tại hoặc đã bị xóa`
      );
    });
    const customerInfo = _.pick(data, [
      "phoneNumber",
      "firstName",
      "lastName",
      "email",
      "city",
      "district",
      "ward",
      "zipCode",
      "streetAddress",
      "shippingAddress",
      "userIP",
      "userAgent"
    ]);

    // TODO - check product stock quanntity, check shipping method or COD
    const orderDetails = [];
    const order = new DB.Order(
        Object.assign(customerInfo, {
          customerId: user._id,
          currency: SITE_CURRENCY,
          userCurrency
        })
    );

    //create order code with user role
    if (
        user.userRoles.find(
            x => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
        )
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.WE_HOME.value
      );
      order.isAssignHub = false;
    } else if (
        user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE.value)
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.WE.value
      );
    } else if (
        user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE_FREE.value)
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.WE.value
      );
    } else if (
        user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.HUB.value)
    ) {
      order.orderCode = await Service.OrderCode.getCode(
          Enums.UserEnums.OrderUserRole.HUB.value
      );
    } else {
      throw new Error(`User Admin is not create order`);
    }

    let totalPrice = 0;
    let totalProducts = 0;

    var errorMessage = "";
    let orderDetail = [];
    for (const product of mappingProducts) {
      //salePrice: product price after user logged in
      // let unitPrice = product.product.salePrice;

      let unitPrice;
      if (
          user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.WE_FREE.value)
      ) {
        unitPrice = product.product.price;
      } else {
        unitPrice = product.product.salePrice;
      }

      orderDetail = new DB.OrderDetail(
          Object.assign(customerInfo, {
            orderId: order._id,
            customerId: user._id || null,
            shopId: product.shop._id,
            productId: product.product._id,
            userNote: product.userNote,
            quantity: product.quantity,
            weight: product.product.weight,
            unitPrice,
            currency: SITE_CURRENCY,
            userCurrency
          })
      );

      // TODO - calculate total price of order detail
      orderDetail.totalPrice = unitPrice * product.quantity;
      totalPrice += orderDetail.totalPrice;
      totalProducts += orderDetail.quantity;

      orderDetails.push(orderDetail);
    }

    order.totalProducts = totalProducts;
    order.totalDiscountPrice = totalPrice * order.percentDiscount;
    order.totalPrice = Math.round(totalPrice - order.totalDiscountPrice);

    order.orderStatus = "scanned";
    order.bu = data.bu;
    order.couponCode = data.couponCode;

    await Promise.all([order.save(), DB.OrderDetail.insertMany(orderDetails)]);

    return {
      order: {
        orderStatus: order.orderStatus,
        message: errorMessage ? errorMessage : ""
      }
    };
  } catch (e) {
    throw e;
  }
};

exports.calculateTotalOrder = async (options) => {
  try {
    if (options.order && options.orderDetails) {
      let totalPrice = 0;
      let extraTotalPrice = 0;

      for (const orderDetail of options.orderDetails) {
        // TODO - calculate total price of order detail
        totalPrice += orderDetail.totalPrice;

        //Kiểm tra sản phẩm thuộc chương trình Khuyến mãi đơn mua sp ưu đãi thì không tính vào totalPrice của order
        if (orderDetail.promotions && orderDetail.promotions.length > 0) {
          for (const prom of orderDetail.promotions) {
            const checkPromotion = await DB.Promotion.findOne({
              _id: prom.promotion,
              promotionForm: Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct.value
            });

            if (checkPromotion) {
              totalPrice -= orderDetail.totalPrice;
              extraTotalPrice += orderDetail.totalPrice;
              break;
            }
          }
        }
      }

      options.order.totalDiscountPrice = totalPrice * options.order.percentDiscount;
      options.order.totalPrice = Math.round(totalPrice - options.order.totalDiscountPrice + extraTotalPrice);
    }

    return;
  }
  catch (e) {
    throw e;
  }
}

exports.paymentStatus = async (
    orderId,
    paymentStatus = "completed",
    paymentType = "Ví GoldTime"
) => {
  try {
    const order = await DB.Order.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const orderDetail = await DB.OrderDetail.updateMany(
        { orderId },
        { $set: { paymentStatus, paymentMethod: paymentType } }
    );
    if (orderDetail) {
      order.paymentStatus = paymentStatus;
      order.paymentMethod = paymentType;
      await order.save();
    }

    return order;
  } catch (error) {
    throw error;
  }
};

exports.checkPayment = async (orderId, params, user) => {
  try {
    const orderDetails = await DB.OrderDetail.find({ orderId });
    if (!orderDetails.length) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const userSocial = await Service.User.GetGoldtimeUserId(user._id);
    const paymentResponse = await Service.Wallet.checkQROrder(
        { token: params.token },
        userSocial.socialInfo.Token
    );
    if (paymentResponse.StatusCode !== 200) {
      throw new Error(paymentResponse.Message);
    }

    await Promise.all([
      Service.Order.updateProductQuantity(orderDetails),
      Service.Order.sendEmailSummary(orderId),
      Service.OrderV2.paymentStatus(orderId, "completed", "Quét QR Code")
    ]);
    return paymentResponse.Message;
  } catch (error) {
    throw error;
  }
};

exports.paymentGoldtime = async (orderId, token, user) => {
  try {
    const orderDetails = await DB.OrderDetail.find({ orderId });
    if (!orderDetails.length) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const userSocial = await Service.User.GetGoldtimeUserId(user._id);
    const paymentResponse = await Service.Wallet.paymentQROrder(
        { token },
        userSocial.socialInfo.Token
    );
    if (paymentResponse.StatusCode !== 200) {
      throw new Error(paymentResponse.Message);
    }

    await Promise.all([
      Service.Order.updateProductQuantity(orderDetails),
      Service.Order.sendEmailSummary(orderId)
    ]);
    const order = await Service.OrderV2.paymentStatus(
        orderId,
        "completed",
        "Ví GoldTime"
    );
    return order;
  } catch (error) {
    throw error;
  }
};

exports.cancelOrder = async (orderId, userId, reasonCancel) => {
  try {
    const order = await DB.Order.findOne({ _id: orderId }).populate("transaction");

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const orderLog = {
      orderId,
      eventType: "cancelOrder",
      changedBy: userId,
      oldData: order.orderStatus,
      newData: "canceled",
      description: reasonCancel
    };

    if (order.senderName) {
      await Service.Delivery.cancelShipmentHubOrWe(order.orderCode);
    }

    if (order.transaction) {
      await Service.Payment.cancelTransaction('order', order._id, reasonCancel);
    }

    await Service.OrderLog.create(orderLog);
    order.orderStatus = "canceled";
    order.reasonCancel = reasonCancel;
    await order.save();

    //send email after cancel order
    await Service.Notification.sendEmail({
          type: Enums.SendEmailEnums.SendEmailType.OrderCancel.value,
          orderCode: order.orderCode,
          orderId: order._id.toString()
        },
        null
    );

  } catch (error) {
    throw error;
  }
};

exports.reassignHub = async (orderId, toHubId) => {
  try {
    const order = await DB.Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const reassignHub = await Service.Delivery.reassignHub(order.orderCode, toHubId);

    if (reassignHub.isSuccess === 1) { // reassign thành công
      order.senderId = reassignHub.data.fromHubId;
      order.senderName = reassignHub.data.senderName;
      order.senderPhone = reassignHub.data.senderPhone;
      await order.save();

      if (order.customerId) {
        const currentUser = await DB.User.findOne({ _id: order.customerId });
        await Service.Notification.sendSms(
            {
              type: Enums.SendEmailEnums.SendEmailType.ReAssignHub.value,
              orderCode: order.orderCode,
              phoneNumber: order.phoneNumber,
              senderName: order.senderName
            },
            currentUser
        );

        await Service.Notification.sendEmail(
            {
              type: Enums.SendEmailEnums.SendEmailType.ReAssignHub.value,
              orderCode: order.orderCode,
              orderId: order._id.toString(),
              senderName: order.senderName
            },
            currentUser
        );
      }

      return reassignHub;
    } else {
      throw new Error(reassignHub.message);
    }

  } catch (error) {
    throw error;
  }
};

exports.confirmOrderHub = async (orderId, userId) => {
  try {
    const order = await DB.Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }
    const oldStatus = order.orderStatus;
    var errorMessage = "Confirm Order Hub success!";

    const createShipmentRes = await Service.Delivery.createShipment(order, null);
    if (createShipmentRes && !createShipmentRes.isSuccess) { // faild
      errorMessage = createShipmentRes.message;
    } else {
      const orderLog = {
        orderId: order.id,
        eventType: "orderStatus",
        changeBy: userId,
        oldData: oldStatus,
        newData: "confirmed"
      };
      await Service.OrderLog.create(orderLog);
    }

    return {
      order: {
        orderStatus: order.orderStatus,
        message: errorMessage ? errorMessage : ""
      }
    };

  } catch (error) {
    throw error;
  }
};

exports.updateOrder = async (orderId, options, user) => {
  try {
    const order = await DB.Order.findOne({ _id: orderId });
    if (!order) {
      throw new Error("order not found!");
    }
    let totalPrice = 0;
    let totalProducts = 0;
    const orderDetailReq = options.orderDetails;
    for (let item = 0; item < orderDetailReq.length; item++) {
      let query = orderDetailReq[item];
      const orderDetail = await DB.OrderDetail.findOne({ _id: query.id });
      if (!orderDetail) {
        throw new Error("orderDetail not found!");
      }

      const orderLog = {
        orderId: order._id,
        eventType: "changeQuantityOrderDetail",
        changeBy: user._id,
        oldData: orderDetail.quantity,
        newData: query.quantity,
        description: "change Quantity Order Detail"
      };
      await Service.OrderLog.create(orderLog);

      orderDetail.quantity = query.quantity,
          orderDetail.totalPrice = orderDetail.unitPrice * query.quantity;
      totalPrice += orderDetail.totalPrice;
      totalProducts += orderDetail.quantity;
      orderDetail.save();
    }

    order.totalProducts = totalProducts;
    order.totalDiscountPrice = totalPrice * order.percentDiscount;
    order.totalPrice = Math.round(
        totalPrice - order.totalDiscountPrice + order.shippingPrice);
    order.save();

  } catch (e) {
    throw e;
  }
};
