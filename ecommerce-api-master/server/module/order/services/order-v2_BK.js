const { Service } = require("aws-sdk");
/* eslint-disable no-mixed-operators */
/* eslint-disable no-useless-concat */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
const _ = require("lodash");

const SITE_CURRENCY = process.env.SITE_CURRENCY || "VND";
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
    priceUserDiscount: 0,
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
    const userCurrency = SITE_CURRENCY;
    const currencyExchangeRate = 1;

    const productIds = data.products.map((p) => p.productId);
    const products = await DB.Product.find({ _id: { $in: productIds } })
      .populate("shop")
      .populate("mainImage");
    if (!products.length) {
      throw new Error("Không tìm thấy bất kì sản phẩm nào trong giỏ hàng");
    }

    const mappingProducts = [];
    data.products.forEach((product) => {
      const p = products.find((i) => i._id.toString() === product.productId);
      if (!p) {
        throw new Error(
          `Sản phẩm '${product.productId}' không tồn tại hoặc đã bị xóa`
        );
      }

      product.product = p;
      product.shop = p.shop;

      mappingProducts.push(product);
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
      "userAgent",
    ]);
    
    // TODO - check product stock quanntity, check shipping method or COD
    const orderDetails = [];
    const order = new DB.Order(
      Object.assign(customerInfo, {
        customerId: user._id,
        currency: SITE_CURRENCY,
        trackingCode: [],
        userCurrency,
        currencyExchangeRate,
      })
    );
    let totalProducts = 0;
    let totalPrice = 0;
    const orderShippingPrice = 0;

    let errorMessage = "";
    for (const product of mappingProducts) {
      let taxPrice = 0;
      let unitPrice = product.product.salePrice || product.product.price;
      let variant;

      const orderDetail = new DB.OrderDetail(
        Object.assign(customerInfo, {
          orderId: order._id,
          customerId: user._id || null,
          shopId: product.shop._id,
          productId: product.product._id,
          productVariantId: product.productVariantId,
          userNote: product.userNote,
          trackingCode: "",
          quantity: product.quantity,
          unitPrice,
          currency: SITE_CURRENCY,
          productDetails: product.product, // TODO - just pick go needed field
          userCurrency,
          currencyExchangeRate,
          shippingMethod: "cod",
        })
      );

      if (product.product.stockQuantity < orderDetail.quantity) {
        let msg =
          `Sản phẩm '${product.product.name}' số lượng chỉ còn ${product.product.stockQuantity}` +
          ",";

        if (product.product.stockQuantity === 0) {
          msg = `Sản phẩm '${product.product.name}' đã hết hàng` + ",";
        }

        errorMessage += msg;
      }

      const shopOwner = await Service.User.GetGoldtimeUserId(
        product.shop.ownerId
      );
      orderDetail.ownerSocialId = shopOwner.socialId;

      if (product.productVariantId) {
        variant = await DB.ProductVariant.findOne({
          _id: product.productVariantId,
        });
        if (variant) {
          unitPrice =
            variant.salePrice ||
            variant.price ||
            product.salePrice ||
            product.price;
          if (variant.stockQuantity < orderDetail.quantity) {
            let msg =
              `Sản phẩm '${product.product.name}' số lượng chỉ còn ${variant.stockQuantity}` +
              ",";

            if (product.product.stockQuantity === 0) {
              msg = `Sản phẩm '${product.product.name}' đã hết hàng` + ",";
            }

            errorMessage += msg;
          }
        }
        orderDetail.variantDetails = variant;
      }

      taxPrice = product.product.taxPercentage
        ? unitPrice * (product.product.taxPercentage / 100)
        : 0;
      orderDetail.taxPrice = taxPrice * product.quantity;
      orderDetail.taxClass = product.product.taxClass;
      orderDetail.taxPercentage = product.product.taxPercentage;
      orderDetail.userTaxPrice =
        taxPrice * currencyExchangeRate * product.quantity;

      const productPrice = unitPrice * product.quantity;
      totalProducts += product.quantity;

      orderDetail.productPrice = productPrice;
      orderDetail.totalPrice =
        Math.round((productPrice + orderDetail.taxPrice) * 100) / 100;

      totalPrice += orderDetail.totalPrice;
      orderDetail.userTotalPrice =
        orderDetail.totalPrice * currencyExchangeRate;

      orderDetails.push(orderDetail);
    }

    if (errorMessage !== "") {
      throw new Error(errorMessage.substring(0, errorMessage.length - 1));
    }

    const keyText = "ownerSocialId";
    const items = orderDetails.reduce((acc, obj) => {
      const key = obj[keyText];
      if (!acc[key]) acc[key] = [];

      acc[key].push({
        vendorId: obj.ownerSocialId,
        productId: obj.productId,
        unitPrice: obj.unitPrice,
        quantity: obj.quantity,
        configs: obj.productDetails.configs,
        totalItem: obj.userTotalPrice,
      });
      return acc;
    }, {});

    const arrItems = [];
    Object.keys(items).forEach((i) => {
      items[i] = items[i].map((j) => {
        // tung san pham
        j.discountProduct = calcTradeDiscount(j);
        arrItems.push({
          vendorId: j.vendorId,
          productId: j.productId,
          amount: j.discountProduct.amount,
          commission: j.discountProduct.commission
            ? j.discountProduct.commission / 15
            : 0,
          commissionRate: j.discountProduct.commissionRate || 0,
          priceReceiverAdmin: j.discountProduct.priceReceiverAdmin,
          priceUserDiscount: j.discountProduct.priceUserDiscount,
        });
        return j;
      });
    });

    order.totalProducts = totalProducts;
    order.shippingPrice = orderShippingPrice;
    order.totalPrice = totalPrice + orderShippingPrice;
    order.userTotalPrice =
      totalPrice * currencyExchangeRate + orderShippingPrice;

    const saveAsync = orderDetails.map((orderDetail) => {
      Object.keys(items).forEach((i) => {
        if (orderDetail.ownerSocialId === i) {
          items[i].forEach((j) => {
            if (j.productId.toString() === orderDetail.productId.toString()) {
              orderDetail.commission =
                j.discountProduct.commission +
                j.discountProduct.priceUserDiscount +
                j.discountProduct.priceReceiverAdmin;
              orderDetail.commissionRate =
                (j.discountProduct.commissionRate +
                  j.discountProduct.tradeDiscountGoldtime +
                  j.discountProduct.tradeDiscountUser) /
                100;
              orderDetail.priceReceiverAdmin =
                j.discountProduct.priceReceiverAdmin;
              orderDetail.balance =
                orderDetail.totalPrice - orderDetail.commission;
              orderDetail.priceUserDiscount =
                j.discountProduct.priceUserDiscount || 0;
              orderDetail.userTotalPrice -= orderDetail.priceUserDiscount;

              order.userTotalPrice -= orderDetail.priceUserDiscount; // được trừ 10% giảm giá từ goldtime
              order.priceUserDiscount += orderDetail.priceUserDiscount;
            }
          });
        }
      });

      return orderDetail;
    });

    const userSocial = await Service.User.GetGoldtimeUserId(user._id);
    const paymentResponse = await Service.Wallet.paymentV2(
      {
        orderId: order._id,
        totalPriceBefore: totalPrice,
        totalPriceAfter: order.userTotalPrice,
        items: arrItems,
      },
      userSocial.socialInfo.Token
    );

    if (paymentResponse.StatusCode === 200) {
      await Promise.all([order.save(), DB.OrderDetail.insertMany(saveAsync)]);
    } else {
      throw new Error(paymentResponse.Message);
    }

    return {
      orderId: order._id,
      url: paymentResponse.Data.Url,
      token: paymentResponse.Data.Token,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

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
      Service.OrderV2.paymentStatus(orderId, "completed", "Quét QR Code"),
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
      Service.Order.sendEmailSummary(orderId),
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

exports.cancelOrder = async (orderId, userId) => {
  const order = await DB.Order.find({ orderId });
  if (!order.length) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  const orderLog = {
    orderId,
    eventType: "cancelOrder",
    changedBy: userId,
    oldData: ORDER_STATUS[order.orderStatus],
    newData: ORDER_STATUS.canceled,
  };
  await Service.OrderLog.create(orderLog);

  order.orderStatus = "cancel";
  await order.save();
};
