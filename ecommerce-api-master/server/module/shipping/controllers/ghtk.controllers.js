const Joi = require("@hapi/joi");

exports.ghtkWebhook = async (req, res, next) => {

  const validateSchema = Joi.object().keys({
    label_id: Joi.string().required().messages({
      'string.base': `"label_id" bắt buộc phải là những ký tự`,
      'string.empty': `"label_id" không được để trống`,
      'any.required': `Yêu cầu phải có "label_id"`
    }),
    status_id: Joi.number().required().messages({
      'number.base': `"status_id" bắt buộc phải là 1 số`,
      'number.empty': `"status_id" không được để trống`,
      'any.required': `Yêu cầu phải có "status_id"`
    }),
    action_time: Joi.string()
      .allow(null, "")
      .optional()
      .messages({
        'string.base': `"action_time" bắt buộc phải là những ký tự`
      }),
    reason_code: Joi.string().allow(null, "").optional().messages({
      'string.base': `"reason_code" bắt buộc phải là những ký tự`
    }),
    reason: Joi.string().allow(null, "").optional().messages({
      'string.base': `"reason" bắt buộc phải là những ký tự`
    }),
    return_part_package: Joi.number().optional().messages({
      'number.base': `"return_part_package" bắt buộc phải là 1 số`
    })
  });
  const statusSchema = Joi.object().keys({
    status: Joi.string().allow('pending', 'progressing', 'shipping', 'completed', 'refunded', 'cancelled').required().messages({
      'string.base': `"status" bắt buộc phải là những ký tự`,
      'string.empty': `"status" không được để trống`,
      'any.required': `Yêu cầu phải có "status"`
    }),
  });

  const validate = validateSchema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  
  const details = await DB.OrderDetail.find({ trackingCode: validate.value.label_id });
  const subOrder = details;
  const oldStatus = [];
  const order_status = [];
  for (var i = 0; i < details.length; i ++){
    oldStatus.push(subOrder[i].status);
    order_status.push(statusSchema.validate(subOrder[i].status));
    
    if(validate.value.status_id == -1){
      order_status[i].value = "cancelled";
    }
    else if(validate.value.status_id == 7){
      order_status[i].value = "cancelled";
    }
    else if(validate.value.status_id == 9){
      order_status[i].value = "cancelled";
    }
    else if (validate.value.status_id == 1){
      order_status[i].value = "progressing";
    }
    else if (validate.value.status_id == 2){
      order_status[i].value = "progressing";
    }
    else if (validate.value.status_id == 3){
      order_status[i].value = "progressing";
    }
    else if (validate.value.status_id == 8){
      order_status[i].value = "progressing";
    }
    else if(validate.value.status_id == 4){
      order_status[i].value = "shipping";
    }
    else if(validate.value.status_id == 5){
      order_status[i].value = "completed";
    }
    else {
      order_status[i].value = "pending";
    }
    await Service.Order.updateStatus(subOrder[i], order_status[i].value);
    await Service.Order.addLog({
      eventType: 'updateStatus',
      orderId: subOrder[i].orderId,
      orderDetailId: subOrder[i]._id,
      oldData: {
        status: oldStatus[i]
      },
      newData: {
        status: order_status[i].value
      }
    });
  }
  console.log(validate.value);
  return next();
};


exports.getShippingStatusList = async (req, res, next) =>{
  try{
      const data = {
        order_id: req.params.order_id,
      }
      const shippingStatusList = await Service.GHTK.getShippingStatusList(data);
      res.locals.shippingList = {
          shippingList: shippingStatusList
      };
      return next();
  }catch(e){
      return next(e);
  }
}
/*
exports.getTest = async (req, res, next) =>{
  try{
      const test = Service.GHTK.createShippingOrder;
      console.log(test);
      const data = {
          products: [
              {
                  name: "áo",
                  weight: 1,
                  quantity: 1
              },
              {
                  name: "quần",
                  weight: 1,
                  quantity: 1
              }
          ],
          order_id: "a16",
          picker_name: "HCM-nội thành",
          shop_address: "146 cong hoa",
          shop_city: "TP. Hồ Chí Minh",
          shop_disctrict: "Quan Tan Binh",
          picker_tel: "0986716414",
          customer_tel: "0792471431",
          customer_name: "GHTK - HCM - Noi Thanh",
          customer_address: "200, Su Van Hanh",
          customer_city: "TP. Hồ Chí Minh",
          customer_district: "Q10",
          freeship_code: "1",
          picking_date: "2020-10-03",
          note: "Khối lượng tính cước tối đa: 1.00 kg",
          transport_type: "road"
      }
      const test2 = await test(data);
      res.locals.mytest = {
          mytest: test2
      };
      return next();
  }catch(e){
      return next(e);
  }
}
*/
