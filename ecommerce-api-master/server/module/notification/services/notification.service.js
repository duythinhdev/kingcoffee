const swig = require("../../../kernel/services/template-engine").getSwigEngine();
const path = require("path");
const viewsPath = path.join(__dirname, "..", "..", "..", "emails");
const HOTLINE = process.env.HOTLINE;
const ADMIN_ORDER_BASE_URL = process.env.adminWebUrl;
const _ = require("lodash");
const moment = require("moment");
const Joi = require("@hapi/joi");
const { isEmpty, remove } = require("lodash");
const { level } = require("chalk");
const stripHtml = require("string-strip-html");

exports.saveEmailSmsLog = async (
    sendTo,
    receiverName,
    type,
    sendMessage,
    request,
    response
) => {
  const saveEmailSmsLog = new DB.EmailSmsLog({
    sendTo,
    receiverName,
    type,
    sendMessage,
    request,
    response,
  });
  await saveEmailSmsLog.save();
};

exports.sendSms = async (data, user) => {
  var resData = {
    StatusCode: 400,
    Message: "",
  };

  try {
    if (
        !user.userRoles.find(
            (x) => x.Role === Enums.UserEnums.UserRole.WE.value
        ) &&
        !user.userRoles.find(
          (x) => x.Role === Enums.UserEnums.UserRole.WE_FREE.value
        ) &&
        !user.userRoles.find(
            (x) => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
        )
    ) {
      resData.Message = "Not support send sms in this user role";
      this.saveEmailSmsLog(user._id, user.userName, "SMS", null, data, resData);
      return resData;
    }

    var sendSmsRes;
    var content;
    switch (data.type) {
      case Enums.SendEmailEnums.SendEmailType.OrderSuccess.value: //Order success
        var validateSchema = Joi.object().keys({
          type: Joi.number().required().messages({
            "number.base": `"type" bắt buộc phải là số`,
            "number.empty": `"type" không được để trống`,
            "any.required": `Yêu cầu phải có "type"`,
          }),
          orderCode: Joi.string().required().messages({
            "string.base": `"orderCode" bắt buộc phải là những ký tự`,
            "string.empty": `"orderCode" không được để trống`,
            "any.required": `Yêu cầu phải có "orderCode"`,
          }),
          phoneNumber: Joi.string().required().messages({
            "string.base": `"phoneNumber" bắt buộc phải là những ký tự`,
            "string.empty": `"phoneNumber" không được để trống`,
            "any.required": `Yêu cầu phải có "phoneNumber"`,
          }),
        });

        var validate = validateSchema.validate(data);
        if (validate.error) {
          resData.Message = PopulateResponse.validationError(validate.error);
          await this.saveEmailSmsLog(
              user._id,
              user.userName,
              "SMS",
              null,
              data,
              resData
          );
          return resData;
        }

        content = `WOMEN CAN DO: Dat hang thanh cong don hang ${validate.value.orderCode} chung toi se lien he som cho ban. Vui long lien he hotline ${HOTLINE} khi can ho tro.`;
        break;
      case Enums.SendEmailEnums.SendEmailType.ReAssignHub.value: //Reassign Hub
        var validateSchema = Joi.object().keys({
          type: Joi.number().required().messages({
            "number.base": `"type" bắt buộc phải là số`,
            "number.empty": `"type" không được để trống`,
            "any.required": `Yêu cầu phải có "type"`,
          }),
          orderCode: Joi.string().required().messages({
            "string.base": `"orderCode" bắt buộc phải là những ký tự`,
            "string.empty": `"orderCode" không được để trống`,
            "any.required": `Yêu cầu phải có "orderCode"`,
          }),
          phoneNumber: Joi.string().required().messages({
            "string.base": `"phoneNumber" bắt buộc phải là những ký tự`,
            "string.empty": `"phoneNumber" không được để trống`,
            "any.required": `Yêu cầu phải có "phoneNumber"`,
          }),
          senderName: Joi.string().required().messages({
            "string.base": `"senderName" bắt buộc phải là những ký tự`,
            "string.empty": `"senderName" không được để trống`,
            "any.required": `Yêu cầu phải có "senderName"`,
          })
        });

        var validate = validateSchema.validate(data);
        if (validate.error) {
          resData.Message = PopulateResponse.validationError(validate.error);
          await this.saveEmailSmsLog(
              user._id,
              user.userName,
              "SMS",
              null,
              data,
              resData
          );
          return resData;
        }

        content = `WOMEN CAN DO: Don hang ${validate.value.orderCode} cua ban se duoc nha phan phoi ${validate.value.senderName} phu trach. Vui long lien he hotline ${HOTLINE} khi can ho tro.`;
        break;
      case Enums.SendEmailEnums.SendEmailType.DeliverySuccess.value: //Delivery success
        var validateSchema = Joi.object().keys({
          type: Joi.number().required().messages({
            "number.base": `"type" bắt buộc phải là số`,
            "number.empty": `"type" không được để trống`,
            "any.required": `Yêu cầu phải có "type"`,
          }),
          orderCode: Joi.string().required().messages({
            "string.base": `"orderCode" bắt buộc phải là những ký tự`,
            "string.empty": `"orderCode" không được để trống`,
            "any.required": `Yêu cầu phải có "orderCode"`,
          }),
          phoneNumber: Joi.string().required().messages({
            "string.base": `"phoneNumber" bắt buộc phải là những ký tự`,
            "string.empty": `"phoneNumber" không được để trống`,
            "any.required": `Yêu cầu phải có "phoneNumber"`,
          }),
        });

        var validate = validateSchema.validate(data);
        if (validate.error) {
          resData.Message = PopulateResponse.validationError(validate.error);
          await this.saveEmailSmsLog(
              user._id,
              user.userName,
              "SMS",
              null,
              data,
              resData
          );
          return resData;
        }

        content = `WOMEN CAN DO: Giao hang thanh cong don hang ${validate.value.orderCode}. Neu ban co thac mac ve don hang, xin vui long goi so hotline ${HOTLINE}.`;
        break;
      default:
        resData.Message = "Type field is wrong, please check it again!";
        return resData;
    }

    return await Service.Sms.sendSMSFromInvest({
      phoneNumber: data.phoneNumber,
      smsMessage: content,
    });
  } catch (e) {
    resData.Message = e.message;
    await this.saveEmailSmsLog(
        user ? user._id : null,
        user ? user.userName : null,
        "SMS",
        null,
        data,
        resData
    );
    return resData;
  }
};

exports.sendEmail = async (data, user) => {
  var resData = {
    StatusCode: 400,
    Message: "",
  };

  try {
    //get template email
    var subject = "";
    var content = "";
    let isAdmin = false;
    switch (data.type) {
      case Enums.SendEmailEnums.SendEmailType.OrderSuccess.value: //Order success
        if (user) {
          if (
              !user.userRoles.find(
                  (x) => x.Role === Enums.UserEnums.UserRole.WE.value
              ) &&
              !user.userRoles.find(
                (x) => x.Role === Enums.UserEnums.UserRole.WE_FREE.value
              ) &&
              !user.userRoles.find(
                  (x) => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
              )
          ) {
            resData.Message = "Not support send sms in this user role";
            await this.saveEmailSmsLog(
                user._id,
                user.userName,
                "Email",
                null,
                data,
                resData
            );
            return resData;
          }

          var validateSchema = Joi.object().keys({
            type: Joi.number().required().messages({
              "number.base": `"type" bắt buộc phải là số`,
              "number.empty": `"type" không được để trống`,
              "any.required": `Yêu cầu phải có "type"`,
            }),
            orderId: Joi.string().required().messages({
              "string.base": `"orderId" bắt buộc phải là string`,
              "string.empty": `"orderId" không được để trống`,
              "any.required": `Yêu cầu phải có "orderId"`,
            }),
          });

          var validate = validateSchema.validate(data);
          if (validate.error) {
            resData.Message = PopulateResponse.validationError(validate.error);
            await this.saveEmailSmsLog(
                user._id,
                user.userName,
                "SMS",
                null,
                data,
                resData
            );
            return resData;
          }

          const currentOrder = await DB.Order.findOne({
            _id: validate.value.orderId,
          })
              .populate("customer")
              .populate({
                path: "details",
                populate: [
                  {
                    path: "product",
                    populate: {
                      path: "mainImage",
                    },
                  },
                  {
                    path: "promotions.promotionOrder",
                  },
                ],
              })
              .populate("transaction")
              .populate("promotions.promotionOrder")
              .lean()
              .exec();

          let extraProducts = [];
          let totalExtraProductsPrice = 0;
          let index = 0;
          for (var detail of currentOrder.details) {
            detail.priceAfterPromo = 0;

            for (const itemPromo of detail.promotions) {
              detail.priceAfterPromo += itemPromo.discountPrice;
            }

            if (detail.promotions && detail.promotions.length > 0) {
              for (const prom of detail.promotions) {
                //Tách sản phẩm mua ưu đãi khỏi order detail
                const checkPromotion = await DB.Promotion.findOne({
                  _id: prom.promotion,
                  promotionForm:
                  Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct
                      .value,
                });
                if (checkPromotion) {
                  currentOrder.details.splice(index, 1);
                  extraProducts.push(detail);
                  totalExtraProductsPrice += detail.totalPrice;
                  break;
                }
              }
            }
            index++;
          }

          let freeShipList = [];
          let totalShippingDiscountPrice = 0;
          if (!_.isEmpty(currentOrder.promotions)) {
            freeShipList = await currentOrder.promotions.filter(
                (x) =>
                    x.promotionOrder.promotionForm ===
                    Enums.PromotionEnums.PromotionForm.FreeShip.value
            );
            totalShippingDiscountPrice = await freeShipList.reduce(
                (total, e) => total + (e.discountPrice ? e.discountPrice : 0),
                0
            );
            _.remove(currentOrder.promotions, (x) => {
              return (
                  x.promotionOrder.promotionForm ===
                  Enums.PromotionEnums.PromotionForm.FreeShip.value
              );
            });
          }

          subject = `Xác nhận đơn hàng ${currentOrder.orderCode}`;
          const totalPriceOfProducts = currentOrder
              ? currentOrder.details.reduce(
                  (total, e1) => total + e1.totalPrice,
                  0
              )
              : 0;
          content = swig.renderFile(
              path.join(viewsPath, "order/order-success.html"),
              {
                order: currentOrder,
                hotline: HOTLINE,
                tempTotalPrice: totalPriceOfProducts - totalExtraProductsPrice,
                shippingPrice:
                    totalPriceOfProducts - currentOrder.totalDiscountPrice < 1000000
                        ? (
                        currentOrder.shippingPrice + totalShippingDiscountPrice
                    ).toLocaleString() + "đ"
                        : "Miễn phí",
                extraProducts: extraProducts,
                freeShipList,
              }
          );
        } else {
          resData.Message = PopulateResponse.forbidden();
          await this.saveEmailSmsLog(
              user ? user._id : null,
              user ? user.userName : null,
              "Email",
              null,
              data,
              resData
          );
          return resData;
        }
        break;
      case Enums.SendEmailEnums.SendEmailType.OrderCancel.value: //Order cancel
        var validateSchema = Joi.object().keys({
          type: Joi.number().required().messages({
            "number.base": `"type" bắt buộc phải là số`,
            "number.empty": `"type" không được để trống`,
            "any.required": `Yêu cầu phải có "type"`,
          }),
          orderId: Joi.string().required().messages({
            "string.base": `"orderId" bắt buộc phải là những ký tự`,
            "string.empty": `"orderId" không được để trống`,
            "any.required": `Yêu cầu phải có "orderId"`,
          }),
          orderCode: Joi.string().required().messages({
            "string.base": `"orderCode" bắt buộc phải là những ký tự`,
            "string.empty": `"orderCode" không được để trống`,
            "any.required": `Yêu cầu phải có "orderCode"`,
          }),
        });

        var validate = validateSchema.validate(data);
        if (validate.error) {
          resData.Message = PopulateResponse.validationError(validate.error);
          await this.saveEmailSmsLog(
              user._id,
              user.userName,
              "Email",
              null,
              data,
              resData
          );
          return resData;
        }

        subject = `Đơn hàng ${validate.value.orderCode} bị hủy bởi Đại lý.`;
        content = swig.renderFile(
            path.join(viewsPath, "order/order-cancel.html"),
            {
              orderLink: `${ADMIN_ORDER_BASE_URL}/orders/view/${validate.value.orderId}`,
            }
        );

        isAdmin = true;
        break;
      case Enums.SendEmailEnums.SendEmailType.ReAssignHub.value: //Reassign Hub
        if (user) {
          if (
              !user.userRoles.find(
                  (x) => x.Role === Enums.UserEnums.UserRole.WE.value
              ) &&
              !user.userRoles.find(
                  (x) => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
              )
          ) {
            resData.Message = "Not support send sms in this user role";
            await this.saveEmailSmsLog(
                user._id,
                user.userName,
                "Email",
                null,
                data,
                resData
            );
            return resData;
          }

          var validateSchema = Joi.object().keys({
            type: Joi.number().required().messages({
              "number.base": `"type" bắt buộc phải là số`,
              "number.empty": `"type" không được để trống`,
              "any.required": `Yêu cầu phải có "type"`,
            }),
            orderId: Joi.string().required().messages({
              "string.base": `"orderId" bắt buộc phải là những ký tự`,
              "string.empty": `"orderId" không được để trống`,
              "any.required": `Yêu cầu phải có "orderId"`,
            }),
            orderCode: Joi.string().required().messages({
              "string.base": `"orderCode" bắt buộc phải là những ký tự`,
              "string.empty": `"orderCode" không được để trống`,
              "any.required": `Yêu cầu phải có "orderCode"`,
            }),
            senderName: Joi.string().required().messages({
              "string.base": `"senderName" bắt buộc phải là những ký tự`,
              "string.empty": `"senderName" không được để trống`,
              "any.required": `Yêu cầu phải có "senderName"`,
            })
          });

          var validate = validateSchema.validate(data);
          if (validate.error) {
            resData.Message = PopulateResponse.validationError(validate.error);
            await this.saveEmailSmsLog(
                user._id,
                user.userName,
                "Email",
                null,
                data,
                resData
            );
            return resData;
          }

          subject = `Đơn hàng ${validate.value.orderCode} đã giao thành công!`;
          content = swig.renderFile(
              path.join(viewsPath, "order/re-assign-hub.html"),
              {
                orderCode: validate.value.orderCode,
                providerName: validate.value.senderName ? validate.value.senderName : "",
                orderLink: `${ADMIN_ORDER_BASE_URL}/orders/view/${validate.value.orderId}`,
                hotline: HOTLINE,
              }
          );
        } else {
          resData.Message = PopulateResponse.forbidden();
          await this.saveEmailSmsLog(
              user ? user._id : null,
              user ? user.userName : null,
              "Email",
              null,
              data,
              resData
          );
          return resData;
        }

        break;
      case Enums.SendEmailEnums.SendEmailType.DeliverySuccess.value: //Reassign Hub
        if (user) {
          if (
              !user.userRoles.find(
                  (x) => x.Role === Enums.UserEnums.UserRole.WE.value
              ) &&
              !user.userRoles.find(
                  (x) => x.Role === Enums.UserEnums.UserRole.WE_HOME.value
              )
          ) {
            resData.Message = "Not support send sms in this user role";
            await this.saveEmailSmsLog(
                user._id,
                user.userName,
                "Email",
                null,
                data,
                resData
            );
            return resData;
          }

          const currentOrder = await DB.Order.findOne({ _id: data.orderId })
              .populate("customer")
              .populate({
                path: "details",
                populate: [
                  {
                    path: "product",
                    populate: {
                      path: "mainImage",
                    },
                  },
                  {
                    path: "promotions.promotionOrder",
                  },
                ],
              })
              .populate("transaction")
              .populate("promotions.promotionOrder")
              .lean()
              .exec();

          currentOrder.details.forEach((detail) => {
            detail.priceAfterPromo = 0;

            for (const itemPromo of detail.promotions) {
              detail.priceAfterPromo += itemPromo.discountPrice;
            }
          });

          let extraProducts = [];
          let totalExtraProductsPrice = 0;
          let index = 0;
          for (var detail of currentOrder.details) {
            for (const itemPromo of detail.promotions) {
              detail.priceAfterPromo += itemPromo.discountPrice;
            }

            if (detail.promotions && detail.promotions.length > 0) {
              for (const prom of detail.promotions) {
                //Tách sản phẩm mua ưu đãi khỏi order detail
                const checkPromotion = await DB.Promotion.findOne({
                  _id: prom.promotion,
                  promotionForm:
                  Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct
                      .value,
                });
                if (checkPromotion) {
                  currentOrder.details.splice(index, 1);
                  extraProducts.push(detail);
                  totalExtraProductsPrice += detail.totalPrice;
                  break;
                }
              }
            }
            index++;
          }

          let freeShipList = [];
          let totalShippingDiscountPrice = 0;
          if (!_.isEmpty(currentOrder.promotions)) {
            freeShipList = await currentOrder.promotions.filter(
                (x) =>
                    x.promotionOrder.promotionForm ===
                    Enums.PromotionEnums.PromotionForm.FreeShip.value
            );
            totalShippingDiscountPrice = await freeShipList.reduce(
                (total, e) => total + (e.discountPrice ? e.discountPrice : 0),
                0
            );
            _.remove(currentOrder.promotions, (x) => {
              return (
                  x.promotionOrder.promotionForm ===
                  Enums.PromotionEnums.PromotionForm.FreeShip.value
              );
            });
          }

          subject = `WOMEN CAN DO: Giao hàng thành công đơn hàng ${data.orderCode}. Nếu bạn có thắc mắc về đơn hàng, xin vui lòng gọi số hotline ${HOTLINE}.`;
          const totalPriceOfProducts = currentOrder
              ? currentOrder.details.reduce(
                  (total, e1) => total + e1.totalPrice,
                  0
              )
              : 0;
          content = swig.renderFile(
              path.join(viewsPath, "order/delivery-success.html"),
              {
                order: currentOrder,
                hotline: HOTLINE,
                tempTotalPrice: totalPriceOfProducts - totalExtraProductsPrice,
                shippingPrice:
                    totalPriceOfProducts - currentOrder.totalDiscountPrice < 1000000
                        ? (
                        currentOrder.shippingPrice + totalShippingDiscountPrice
                    ).toLocaleString() + "đ"
                        : "Miễn phí",
                extraProducts: extraProducts,
                freeShipList,
              }
          );
        }
        break;
      default:
        resData.Message = "Type field is wrong, please check it again!";
        await this.saveEmailSmsLog(
            user._id,
            user.userName,
            "Email",
            null,
            data,
            resData
        );
        return resData;
    }

    let userSocial = null;
    if (user) {
      userSocial = await DB.UserSocial.findOne({
        userId: user._id,
      });
    }

    const resultSendMail = await Service.Email.sendEmailFromInvest({
      userId: userSocial ? userSocial.socialId : 0,
      subject: subject,
      content: content,
      isSendAdmin: isAdmin,
    });

    return resultSendMail;

  } catch (e) {
    resData.Message = e.message;
    await this.saveEmailSmsLog(
        user ? user._id : null,
        user ? user.userName : null,
        "Email",
        null,
        data,
        resData
    );
    return resData;
  }
};

/**
 * Create a new notification.
 */
exports.create = async (options) => {
  try {
    if (options.user._id) {
      const existUser = await DB.User.findOne({ _id: options.user._id });
      if (!existUser) {
        throw new Error("User of this notification not exists!");
      }
    } else {
      throw new Error("userId must not be empty!");
    }
    var validateSchema = Joi.object().keys({
      type: Joi.string().required().messages({
        "string.base": `"type" bắt buộc phải là ký tự`,
        "string.empty": `"type" không được để trống`,
        "any.required": `Yêu cầu phải có "type"`,
      }),
      title: Joi.string().required().messages({
        "string.base": `"title" bắt buộc phải là những ký tự`,
        "string.empty": `"title" không được để trống`,
        "any.required": `Yêu cầu phải có "title"`,
      }),
      // body có định dạng là từ ngày tới ngày + <br/> + content promotion nếu noti đó là promotion
      body: Joi.string().required().messages({
        "string.base": `"body" bắt buộc phải là những ký tự`,
        "string.empty": `"body" không được để trống`,
        "any.required": `Yêu cầu phải có "body"`,
      }),
      data: Joi.string().allow(null, "").optional().messages({
        "string.base": '"data" bắt buộc phải là những ký tự',
      }),
      isRead: Joi.boolean().allow(null, "").optional().messages({
        "bool.base": '"isRead" bắt buộc phải là kiểu logic',
      }),
      userIds: Joi.array().items(Joi.string()).optional().messages({
        'array.base': `"userIds" bắt buộc phải là 1 mảng`,
      }),
      memberIds: Joi.array().items(Joi.string()).optional().messages({
        'array.base': `"memberIds" bắt buộc phải là 1 mảng`,
      }),
    });
    var validate = validateSchema.validate(options.body);
    if (validate.error) {
      throw new Error(validate.error);
    }
    if (options.body.type === 'all') {
      const query = Helper.App.populateDbQuery({}, {});
      const notifications = [];
      if (options.body.userIds) {
        const userIds = options.body.userIds;
        for (const userId of userIds) {
          const noti = createNotification(options);
          notifications.push(initializeNotification(userId, noti));
          await pushNotiToDevice(userId, noti);
        }
      } else if (options.body.memberIds) {
        const memberIds = options.body.memberIds;
        for (const memberId of memberIds) {
          const user = await DB.User.findOne({ memberId: memberId });
          const userId = user._id;
          const noti = createNotification(options);
          notifications.push(initializeNotification(userId, noti));
          await pushNotiToDevice(userId, noti);
        }
      } else {
        const existingUsers = await DB.User.find(query);
        for (const existingUser of existingUsers) {
          const userId = existingUser._id;
          const noti = initializeNotification(userId, options.body);
          notifications.push(noti);
          await pushNotiToDevice(userId, noti);
        }
      }
      const result = await DB.Notification.insertMany(notifications);
    }
    options.body.userId = options.user._id;
    const notification = new DB.Notification(options.body);
    await notification.save();
    await pushNotiToDevice(options.body.userId, notification);
    return;
  } catch (e) {
    throw e;
  }
};

function createNotification(options) {
  return {
    type: options.body.type,
    title: options.body.title,
    body: options.body.body
  }
}

function initializeNotification(userId, content) {
  content.userId = userId;
  const notification = new DB.Notification(content);
  return notification;
}

async function pushNotiToDevice(userId, notification) {
  const devices = await DB.Device.find({ userId: userId });
  for (const device of devices) {
    const notificationFirebase = {
      title: `${notification.title}`,
      body: `${stripHtml(
          notification.body
      ).result.substring(0, 30)}...`,
      os: device.os,
      tokenDevice: device.tokenDevice,
    };
    await Service.PushNotification.sendToDevice(notificationFirebase);
  }
}

/**
 * Read notification.
 */
exports.read = async (options) => {
  try {
    let promotion = {};
    const query = Helper.App.populateDbQuery(options.query, {});

    if (!options.user) {
      throw new Error("Vui lòng đăng nhập trước!");
    }

    query.userId = options.user._id;
    query._id = options.query.id;
    let notifyItem = await DB.Notification.findOne(query);

    if (notifyItem) {
      if (!notifyItem.isRead) {
        notifyItem.isRead = true;
        notifyItem.save();
      }
      if (
          notifyItem.data &&
          notifyItem.type ===
          Enums.NotificationEnums.NotificationType.PromotionNotification.value
      ) {
        //get detail promotion for notification
        promotion = await Service.Promotion.findOne({ id: notifyItem.data });
      }
    }

    return {
      notifyItem,
      promotion,
    };
  } catch (e) {
    throw e;
  }
};

/**
 * Get lists notification.
 */
exports.list = async (options) => {
  const page = Math.max(0, options.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(options.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(options.query, {
      text: ["title", "body"],
    });

    if (options.query.type) {
      query.type = options.query.type;
    }

    if (options.query.isRead) {
      query.isRead = options.query.isRead;
    }

    if (options.query.fromDate) {
      query.createdAt = {
        $gte: moment(options.query.fromDate, "DD-MM-YYYY").toDate(),
      };
    }

    if (options.query.toDate) {
      query.createdAt = {
        $lte: moment(options.query.toDate, "DD-MM-YYYY").toDate(),
      };
    }

    query.userId = options.user._id;
    const sort = Helper.App.populateDBSort(options.query);
    const count = await DB.Notification.countDocuments(query);
    const list = await DB.Notification.find(query)
        .collation({ locale: "vi" })
        .populate({ path: "User" })
        .sort(sort)
        .skip(page * take)
        .limit(take)
        .lean()
        .exec();
    //xử lý body cho danh sách Promotion Notification
    let items = [];
    if (list.length > 0) {
      for (item of list) {
        if (
            item.type ===
            Enums.NotificationEnums.NotificationType.PromotionNotification.value
        ) {
          const n = item.body.indexOf("<br");
          const date = item.body.slice(0, n);
          if (date.length > 0) {
            const content = item.body
                .slice(n, item.body.length)
                .replace(/(<([^>]+)>)/gi, "");
            item.body = date + "<br/>" + content;
          } else {
            item.body = item.body.replace(/(<([^>]+)>)/gi, "");
          }
        } else {
          item.body = item.body.replace(/(<([^>]+)>)/gi, "");
        }
        items.push(item);
      }
    }

    return {
      count,
      items,
    };
  } catch (e) {
    throw e;
  }
};

/**
 * count unread notification.
 */
exports.countUnRead = async (options) => {
  try {
    const query = Helper.App.populateDbQuery(options, {});

    if (!options.user) {
      return null;
    }

    query.userId = options.user._id;
    query.isRead = false;
    const unreadItems = await DB.Notification.find(query);

    return {
      count: unreadItems.length,
    };
  } catch (e) {
    throw e;
  }
};

exports.insertNotification = async () => {
  try {
    const option = {
      startDate: moment().format("HH:mm DD-MM-YYYY"),
      page: 0,
      take: 1000,
    };
    const promotions = await Service.Promotion.listForNotification(option);
    for (const promotion of promotions.items) {
      if (
          !isEmpty(promotion.applyMemberId) &&
          promotion.isRejectApplyMemberId === false &&
          !isEmpty(promotion.applyRole)
      ) {
        for (const member of promotion.applyMemberId) {
          const user = await DB.User.findOne({ memberId: member.memberId });
          const devices = await DB.Device.find({ userId: user._id });
          for (const device of devices) {
            const notification = {
              title: "WCD khuyến mãi",
              body: `${promotion.name}\n Từ ${moment(promotion.startDate)
                  .add(7, "hours")
                  .format("HH:mm DD/MM/YYYY")} đến ${moment(promotion.endDate)
                  .add(7, "hours")
                  .format("HH:mm DD/MM/YYYY")}\n${stripHtml(
                  promotion.content
              ).result.substring(0, 30)}...`,
              os: device.os,
              tokenDevice: device.tokenDevice,
            };
            await Service.PushNotification.sendToDevice(notification);
          }
          const notificationModel = new DB.Notification({
            userId: user._id,
            type: "promotionNotification",
            title: "WCD khuyến mãi",
            body: `${promotion.name} </br> Từ ${moment(promotion.startDate)
                .add(7, "hours")
                .format("HH:mm DD/MM/YYYY")} đến ${moment(promotion.endDate)
                .add(7, "hours")
                .format("HH:mm DD/MM/YYYY")} </br> ${promotion.content}`,
            data: promotion._id,
            isRead: false,
          });
          await notificationModel.save();
        }
      }

      if (
          isEmpty(promotion.applyMemberId) &&
          !isEmpty(promotion.applyRole) &&
          promotion.isRejectApplyMemberId === false
      ) {
        const roleIds = promotion.applyRole.map((x) => {
          return x.role;
        });
        const levels = promotion.applyRole.map((x) => {
          return x.level;
        });
        const userList = await DB.User.find({
          $or: [
            {
              userRoles: { $elemMatch: { Role: { $in: roleIds } } },
            },
            {
              level: { $in: levels },
            },
          ],
        });
        for (const user of userList) {
          const devices = await DB.Device.find({ userId: user._id });
          for (const device of devices) {
            const notification = {
              title: "WCD khuyến mãi",
              body: `${promotion.name}\nTừ ${moment(promotion.startDate)
                  .add(7, "hours")
                  .format("HH:mm DD/MM/YYYY")} đến ${moment(promotion.endDate)
                  .add(7, "hours")
                  .format("HH:mm DD/MM/YYYY")}\n${stripHtml(
                  promotion.content
              ).result.substring(0, 30)}...`,
              os: device.os,
              tokenDevice: device.tokenDevice,
            };
            await Service.PushNotification.sendToDevice(notification);
          }
          const notificationModel = new DB.Notification({
            userId: user._id,
            type: "promotionNotification",
            title: "WCD khuyến mãi",
            body: `${promotion.name} </br> Từ ${moment(promotion.startDate)
                .add(7, "hours")
                .format("HH:mm DD/MM/YYYY")} đến ${moment(promotion.endDate)
                .add(7, "hours")
                .format("HH:mm DD/MM/YYYY")} </br> ${promotion.content}`,
            data: promotion._id,
            isRead: false,
          });
          await notificationModel.save();
        }

        if (
            !isEmpty(promotion.applyRole) &&
            !isEmpty(promotion.applyMemberId) &&
            promotion.isRejectApplyMemberId === true
        ) {
          const roleIds = promotion.applyRole.map((x) => {
            return x.role;
          });
          const levels = promotion.applyRole.map((x) => {
            return x.level;
          });
          const userList = await DB.User.find({
            $or: [
              {
                userRoles: { $elemMatch: { Role: { $in: roleIds } } },
              },
              {
                level: { $in: levels },
              },
            ],
          });
          for (const user of userList) {
            const isValidUser = promotion.applyMemberId.find(
                (x) => x.memberId === user._id
            );
            if (!isValidUser) {
              const devices = await DB.Device.find({ userId: user._id });
              for (const device of devices) {
                const notification = {
                  title: "WCD khuyến mãi",
                  body: `${promotion.name}\nTừ ${moment(promotion.startDate)
                      .add(7, "hours")
                      .format("HH:mm DD/MM/YYYY")} đến ${moment(promotion.endDate)
                      .add(7, "hours")
                      .format("HH:mm DD/MM/YYYY")}\n${stripHtml(
                      promotion.content
                  ).result.substring(0, 30)}...`,
                  os: device.os,
                  tokenDevice: device.tokenDevice,
                };
                await Service.PushNotification.sendToDevice(notification);
              }
              const notificationModel = new DB.Notification({
                userId: user._id,
                type: "promotionNotification",
                title: "WCD khuyến mãi",
                body: `${promotion.name} </br> Từ ${moment(promotion.startDate)
                    .add(7, "hours")
                    .format("HH:mm DD/MM/YYYY")} đến ${moment(promotion.endDate)
                    .add(7, "hours")
                    .format("HH:mm DD/MM/YYYY")} </br> ${promotion.content}`,
                data: promotion._id,
                isRead: false,
              });
              await notificationModel.save();
            }
          }
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
