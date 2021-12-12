const request = require("request");
const _ = require("lodash");
const { ORDER_STATUS } = require("../delivery.constants");

exports.findOrderByOrderCode = async orderCode => {
  const query = { orderCode };
  const order = await DB.Order.findOne(query);
  return order;
};

exports.updateOrder = async (currentOrder, nextOrder) => {
  const orderLog = {
    orderId: currentOrder.id,
    eventType: "orderStatus",
    changeBy: "Delivery update",
    oldData: currentOrder.orderStatus,
    newData: nextOrder.orderStatus
  };
  _.assign(currentOrder, nextOrder);
  await currentOrder.save();
  await Service.OrderLog.create(orderLog);

  const transaction = await DB.Transaction.findOne({
    type: 'order',
    typeId: currentOrder._id
  });

  if(nextOrder.orderStatus === 'successDelivered'){
    if(transaction && transaction.paymentGateway === 'cod' ){
      transaction.status = "success";
      transaction.paymentResponse = {
        successDelivered: 'Giao hàng thành công!'
      };
      await transaction.save();
    }

    if(currentOrder && currentOrder.customerId){
      var currentUser = await DB.User.findOne({_id: currentOrder.customerId})

      await Service.Notification.sendSms(
          {
            type: Enums.SendEmailEnums.SendEmailType.DeliverySuccess.value,
            orderCode: currentOrder.orderCode,
            phoneNumber: currentOrder.phoneNumber
          },
          currentUser
      );

      await Service.Notification.sendEmail(
          {
            type: Enums.SendEmailEnums.SendEmailType.DeliverySuccess.value,
            orderId: currentOrder.id,
            orderCode: currentOrder.orderCode
          },
          currentUser
      );
    }
  }
};

exports.createShipmentHubOrWe = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      request(
          {
            method: "POST",
            url: `${process.env.DELIVERY_API}/api/shipment/CreateShipmentHubOrWe`,
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.DELIVERY_API_KEY}`
            },
            json: {
              shipmentTypeId: data.shipmentTypeId,
              shipmentNumber: data.shipmentNumber, // = orderCode
              toHubId: data.toHubId, // = inventoryId
              toProvinceCode: data.toProvinceCode,
              toDistrictCode: data.toDistrictCode,
              toWardCode: data.toWardCode,
              shippingAddress: data.shippingAddress,
              receiverName: data.receiverName,
              receiverPhone: data.receiverPhone,
              cod: data.cod, // tiền thu hộ (chưa tính ship)
              totalPrice: data.totalPrice, // tổng tiền (đã tính ship)
              paymentTypeId: data.paymentTypeId, // < 1tr - paymentTypeId = 1 (người nhận thanh toán), >= 1tr - paymentTypeId = 2 (người gửi thanh toán)
              note: data.note,
              weight: data.weight,
              tplId: data.tplId, // nhà vận chuyển
              listProcducts: data.listProcducts, // productCode = Object('id')
              fromHubId: data.fromHubId
            }
          },
          (error, response, body) => {
            console.log("response.statusCode", response.statusCode)
            console.log("response.message", response.message)
            console.log("body", body);

            let shipmentLogRes = null;
            if(response){
              shipmentLogRes = {
                request: JSON.parse(response.request.body),
                body: response.body,
                statusCode:  response.statusCode,
                statusMessage: response.statusMessage,
              };
            }
            // if (response.statusCode !== 200) {
            //   return reject(new Error(response.message));
            // }

            // if (body.isSuccess === 0) {
            //   return reject(new Error(body.message));
            // }

            // if (error) {
            //   return reject(error);
            // }
            return resolve({body, shipmentLogRes});
          }
      );
    });
  } catch (e) {
    throw e;
  }
};

exports.cancelShipmentHubOrWe = async (orderCode) => {
  try {
    return new Promise((resolve, reject) => {
      request(
          {
            method: "POST",
            url: `${process.env.DELIVERY_API}/api/shipment/CancelShipmentHubOrWe`,
            headers: {
              "content-type": "application/json",
              "x-api-key": `${process.env.DELIVERY_API_KEY}`
            },
            json: {
              shipmentNumber: orderCode // = orderCode
            }
          },
          (error, response, body) => {
            console.log("response.statusCode", response.statusCode)
            console.log("response.message", response.message)
            console.log("body", body);

            // if (response.statusCode !== 200) {
            //   return reject(new Error(response.message));
            // }

            // if (body.isSuccess === 0) {
            //   return reject(new Error(body.message));
            // }

            // if (error) {
            //   return reject(error);
            // }

            return resolve(body);
          }
      );
    });
  } catch (e) {
    throw e;
  }
};


/**
 * @ServiceName createShipment
 * @Description Create delivery order request
 * @Param {Object}   [order]  include params under
 */
exports.createShipment = async (order, fromHubId) => {
  try {
    if (order) {
      const user = await DB.User.findOne({
        _id: order.customerId
      });
      let shipmentTypeId;

      if(fromHubId){
        shipmentTypeId = Enums.PaymentEnums.ShipmentType.WeHomeOrder.value;
      }else{
        if (user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.HUB.value))
          shipmentTypeId = Enums.PaymentEnums.ShipmentType.HubOrder.value;
        else
          shipmentTypeId = Enums.PaymentEnums.ShipmentType.WeOrder.value;
      }

      const orderDetails = await DB.OrderDetail.find({
        orderId: order._id
      });

      const paymentMethodsConfig = await DB.Config.findOne({"key": "paymentGatewayConfig"});

      //calculate shipcod price if payment method is COD
      var shipCODPrice = 0;
      if(order.transactionId){
        const transaction = await DB.Transaction.findById(order.transactionId);
        if(transaction && transaction.paymentGateway && transaction.paymentGateway === paymentMethodsConfig.value.paymentMethods[2].value)
          shipCODPrice = order.totalPrice - order.shippingPrice;
      }

      if (orderDetails) {
        //create delivery request
        let cshowRes = await this.createShipmentHubOrWe({
          shipmentTypeId: shipmentTypeId,
          shipmentNumber: order.orderCode, // = orderCode
          toHubId: user.inventoryId, // = inventoryId
          toProvinceCode: order.city.id,
          toDistrictCode: order.district.id,
          toWardCode: order.ward.id,
          shippingAddress: order.streetAddress,
          receiverName: `${order.firstName} ${order.lastName}`,
          receiverPhone: order.phoneNumber,
          cod: shipCODPrice,
          totalPrice: order.shippingPrice ? order.shippingPrice : 0,
          paymentTypeId: (order.totalPrice - order.shippingPrice) >= Number(process.env.PAYMENT_TYPE_PRICE) ? Enums.PaymentEnums.PaymentType.SenderPay.value : Enums.PaymentEnums.PaymentType.ReceiverPay.value,
          note: order.userNote ? order.userNote : "",
          weight: orderDetails.reduce((total, e1) => (total + e1.weight * e1.quantity), 0),
          tplId: order.transportationId,
          fromHubId: fromHubId ? fromHubId : null,
          listProcducts: orderDetails.map(x => {
            return {
              "productCode": x.productId,
              "quantity": x.quantity
            }
          })
        })

        if(cshowRes){
          if(cshowRes.shipmentLogRes){
            await Service.OrderLog.create({
              orderId: order._id,
              eventType: "createShipment",
              description: "Create Shipment",
              newData: cshowRes.shipmentLogRes
            });
          }

          if (cshowRes.body && cshowRes.body.data) {
            cshowRes = cshowRes.body;
            order.senderId = cshowRes.data.fromHubId;
            order.senderName = cshowRes.data.senderName;
            order.senderPhone = cshowRes.data.senderPhone;

            if(user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.HUB.value)){
              order.isConfirmOrderHub = true;
              order.orderStatus = "confirmed";
            }
            await order.save();
          }
        }

        return cshowRes;
      }
    }

  } catch (e) {
    throw e;
  }
}

exports.reassignHub = async (shipmentNumber, toHubId) => {
  try {
    return new Promise((resolve, reject) => {
      request(
          {
            method: "POST",
            url: `${process.env.DELIVERY_API}/api/shipment/ReAssignShipmentHubOrWe`,
            headers: {
              "content-type": "application/json",
              "x-api-key": `${process.env.DELIVERY_API_KEY}`
            },
            json: {
              shipmentNumber: shipmentNumber, // = orderCode
              toHubId: toHubId
            }
          },
          (error, response, body) => {
            if (response.statusCode !== 200) {
              return reject(new Error(response.message));
            }

            if (!body) {
              return reject(new Error("Reassign Shipment error!"));
            }

            if (error) {
              return reject(error);
            }
            return resolve(body);
          }
      );
    });
  } catch (e) {
    throw e;
  }
};
