const swig = require('../../../kernel/services/template-engine').getSwigEngine();
const path = require('path');
const viewsPath = path.join(__dirname, '..', '..', '..', 'emails');
const HOTLINE = process.config.HOTLINE;
const ADMIN_ORDER_BASE_URL = process.config.adminWebUrl;

const Joi = require('@hapi/joi');

//Test send SMS for WE/WE_HOME with Invest api
exports.sendSms = async (req, res, next) => {
    try {
        let sendSmsRes;
        let validateSchema;
        let validate;
        switch(req.body.type){
            case Enums.SendEmailEnums.SendEmailType.OrderSuccess: //Order success
                validateSchema = Joi.object().keys({
                    phoneNumber: Joi.string().required().messages({
                        'string.base': `"phoneNumber" bắt buộc phải là những ký tự`,
                        'string.empty': `"phoneNumber" không được để trống`,
                        'any.required': `Yêu cầu phải có "phoneNumber"`
                    }),
                    orderCode: Joi.string().required().messages({
                        'string.base': `"orderCode" bắt buộc phải là những ký tự`,
                        'string.empty': `"orderCode" không được để trống`,
                        'any.required': `Yêu cầu phải có "orderCode"`
                    })
                });

                validate = validateSchema.validate(req.body);
                if (validate.error) {
                    return next(PopulateResponse.validationError(validate.error));
                }

                validate.content = `WOMEN CAN DO: Dat hang thanh cong don hang <b>${validate.orderCode}</b> chung toi se lien he som cho ban. Vui long lien he hotline 1900588878 khi can ho tro.`;
                break;
            case Enums.SendEmailEnums.SendEmailType.ReAssignHub: //Reassign Hub
                validateSchema = Joi.object().keys({
                    phoneNumber: Joi.string().required().messages({
                        'string.base': `"phoneNumber" bắt buộc phải là những ký tự`,
                        'string.empty': `"phoneNumber" không được để trống`,
                        'any.required': `Yêu cầu phải có "phoneNumber"`
                    }),
                    orderCode: Joi.string().required().messages({
                        'string.base': `"orderCode" bắt buộc phải là những ký tự`,
                        'string.empty': `"orderCode" không được để trống`,
                        'any.required': `Yêu cầu phải có "orderCode"`
                    }),
                    providerName: Joi.string().required().messages({
                        'string.base': `"providerName" bắt buộc phải là những ký tự`,
                        'string.empty': `"providerName" không được để trống`,
                        'any.required': `Yêu cầu phải có "providerName"`
                    })
                });

                validate = validateSchema.validate(req.body);
                if (validate.error) {
                    return next(PopulateResponse.validationError(validate.error));
                }

                validate.content = `WOMEN CAN DO: Đơn hàng ${validate.orderCode} của bạn sẽ được nhà phân phối ${validate.providerName} phụ trách. Vui lòng liên hệ hotline 1900588878 khi cần hỗ trợ.`;
                break;
            default:
                return next(new Error("Type field is wrong, please check it again!"));
        }

        sendSmsRes = await Service.Sms.sendSMSFromInvest(validate);
        res.locals.data = sendSmsRes;
        return next();
    } catch (e) {
        return next(e);
    }
};

//Test send email for WE/WE_HOME with Invest api
exports.sendEmail = async (req, res, next) => {
    try {
        const validate = validateEmailSchema.validate(req.body);
        if (validate.error) {
            return next(PopulateResponse.validationError(validate.error));
        }

        if(req.user){
            const userSocial = await DB.UserSocial.findOne({userId: req.user._id});

            if(userSocial){
                //get template email
                let subject = "";
                let content = "";
                let validateSchema;
                let validate;
                switch(req.body.type){
                    case Enums.SendEmailEnums.SendEmailType.OrderSuccess: //Order success
                        validateSchema = Joi.object().keys({
                            orderCode: Joi.string().required().messages({
                                'string.base': `"orderCode" bắt buộc phải là những ký tự`,
                                'string.empty': `"orderCode" không được để trống`,
                                'any.required': `Yêu cầu phải có "orderCode"`
                            })
                        });

                        validate = validateSchema.validate(req.body);
                        if (validate.error) {
                            return next(PopulateResponse.validationError(validate.error));
                        }

                        subject = `Đơn hàng ${validate.orderCode} được đặt thành công.`
                        content = swig.renderFile(path.join(viewsPath, 'order/order-success.html'), {
                            orderCode: validate.orderCode
                        });
                        break;
                    case Enums.SendEmailEnums.SendEmailType.OrderCancel: //Order cancel
                        validateSchema = Joi.object().keys({
                            orderId: Joi.string().required().messages({
                                'string.base': `"orderId" bắt buộc phải là những ký tự`,
                                'string.empty': `"orderId" không được để trống`,
                                'any.required': `Yêu cầu phải có "orderId"`
                            }),
                            orderCode: Joi.string().required().messages({
                                'string.base': `"orderCode" bắt buộc phải là những ký tự`,
                                'string.empty': `"orderCode" không được để trống`,
                                'any.required': `Yêu cầu phải có "orderCode"`
                            })
                        });

                        validate = validateSchema.validate(req.body);
                        if (validate.error) {
                            return next(PopulateResponse.validationError(validate.error));
                        }

                        subject = `Đơn hàng ${orderCode} bị hủy bởi Đại lý.`
                        content = swig.renderFile(path.join(viewsPath, 'order/order-cancel.html'), {
                            orderLink: `${ADMIN_ORDER_BASE_URL}/orders/view/${orderId}`
                        });
                        break;
                    case Enums.SendEmailEnums.SendEmailType.ReAssignHub: //Reassign Hub
                        validateSchema = Joi.object().keys({
                            orderId: Joi.string().required().messages({
                                'string.base': `"orderId" bắt buộc phải là những ký tự`,
                                'string.empty': `"orderId" không được để trống`,
                                'any.required': `Yêu cầu phải có "orderId"`
                            }),
                            orderCode: Joi.string().required().messages({
                                'string.base': `"orderCode" bắt buộc phải là những ký tự`,
                                'string.empty': `"orderCode" không được để trống`,
                                'any.required': `Yêu cầu phải có "orderCode"`
                            }),
                            providerName: Joi.string().required().messages({
                                'string.base': `"orderCode" bắt buộc phải là những ký tự`,
                                'string.empty': `"orderCode" không được để trống`,
                                'any.required': `Yêu cầu phải có "orderCode"`
                            })
                        });

                        validate = validateSchema.validate(req.body);
                        if (validate.error) {
                            return next(PopulateResponse.validationError(validate.error));
                        }

                        subject = `Chuyển giao đơn hàng ${orderCode} cho Nhà phân phối ${providerName}.`
                        content = swig.renderFile(path.join(viewsPath, 'order/re-assign-hub.html'), {
                            orderCode,
                            providerName,
                            orderLink: `${ADMIN_ORDER_BASE_URL}/orders/view/${orderId}`,
                            HOTLINE
                        });
                        break;
                    default:
                        return next(new Error("Type field is wrong, please check it again!"));
                }

                const sendEmailRes = await Service.Email.sendEmailFromInvest({
                    userId: userSocial.socialId,
                    subject: subject,
                    content: content,
                    isSendAdmin: req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) ? true : false,
                });

                res.locals.data = sendEmailRes;
                return next();
            }else{
                return next(new Error("User don't have social infomation"));
            }
        }else{
            return next(PopulateResponse.forbidden());
        }

    } catch (e) {
        return next(e);
    }
};


//Function insert notification
exports.insertNotification = async (req, res, next) => {
    try {
        let response;
        response = await Service.Notification.create(req);
        res.locals.data = response;
        return next();
    } catch (e) {
        return next(e);
    }
};

//Read notification
exports.readNotification = async (req, res, next) => {
    try {
        let response;
        let validateSchema;
        let validate;
        // validateSchema = Joi.object().keys({
        //     id: Joi.string().required().messages({
        //         'id.base': `"id" bắt buộc phải là những ký tự`,
        //         'id.empty': `"id" không được để trống`,
        //         'any.required': `Yêu cầu phải có "id"`
        //     })
        // });

        // validate = validateSchema.validate(req.query);
        // if (validate.error) {
        //     return next(PopulateResponse.validationError(validate.error));
        // }

        response = await Service.Notification.read(req);
        res.locals.data = response;
        return next();
    } catch (e) {
        return next(e);
    }
};

//Read notification
exports.readNewsNotification = async (req, res, next) => {
    try {
        let response;
        response = await Service.Notification.readNews(req);
        res.locals.data = response;
        return next();
    } catch (e) {
        return next(e);
    }
};

//count unread notification
exports.countUnReadNotification = async (req, res, next) => {
    try {
        response = await Service.Notification.countUnRead(req);
        res.locals.data = response;
        return next();
    } catch (e) {
        return next(e);
    }
};

// get list notification of user
exports.listNotification = async (req, res, next) => {
    try{
        const list = await Service.Notification.list(req);
        res.locals.data = list;
        return next();
    }catch(e){
        return next(e);
    }
}

