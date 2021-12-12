const request = require("request");
const _ = require('lodash');
const moment = require('moment');

exports.Request_WCDAuthen = () => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "POST",
                    uri: `${process.env.BRAVO_BASE_URL}/api/authen`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    body: {
                        ID: process.env.BRAVO_ACCOUNT_ID,
                        Password: process.env.BRAVO_ACCOUNT_PASSWORD
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDClearSession = () => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/SessionClear`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDWritePO = (options) => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDWritePO`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    qs: {
                        DocDate: options.docDate,
                        DocNo: options.docNo,
                        Description: options.description,
                        CustomerCode: options.customerCode,
                        ContactPerson: options.contactPerson,
                        Address: options.address,
                        WCDCode: options.wcdCode
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDWritePODetail = async (options) => {
    try {
        let requestBody = await options.map(x => ({
            BizDocId: x.bizDocId,
            BuiltinOrder: x.builtinOrder,
            CustomerCode: x.customerCode,
            ItemCode: x.itemCode,
            Unit: x.unit,
            EstimatedTimeDelivery: x.estimatedTimeDelivery,
            Quantity: x.quantity,
            UnitCost: x.unitCost,
            Amount: x.amount
        }));
        return new Promise((resolve, reject) =>
            request({
                    method: "POST",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDWritePODetail`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    body: requestBody
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDGetPODocNo = (options) => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDGetPODocNo`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    qs: {
                        DocDate: options.docDate,
                        CustomerCode: options.customerCode
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDConfirmWriteDoc = (options) => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDUpdateStatus`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    qs: {
                        BizDocId: options.bizDocId,
                        DocNo: options.docNo,
                        DocStatus: options.docStatus
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDLoadPOinfo = (options) => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDLoadPOinfo`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    qs: {
                        BizDocId: options.bizDocId,
                        DocNo: options.docNo,
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDLoadPOinfoDetail = (options) => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDLoadPOinfoDetail`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    qs: {
                        BizDocId: options.bizDocId,
                        DocNo: options.docNo
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.Request_WCDCheckPODocNo = (options) => {
    try {
        return new Promise((resolve, reject) =>
            request({
                    method: "GET",
                    uri: `${process.env.BRAVO_BASE_URL}/api/WCDCheckPODocNo`,
                    headers: {
                        'APIKey': `${process.env.BRAVO_API_KEY}`
                    },
                    json: true,
                    qs: {
                        DocNo: options.docNo
                    }
                },
                (err, response, body) => {

                    if (err) {
                        return reject(err);
                    }

                    return resolve(Helper.App.isJSON(body) ? JSON.parse(body) : body);
                }
            )
        );
    } catch (error) {
        throw error;
    }
}

exports.SendOrderDataToBravo = async (orderId) => {
    try {
        // Clear Bravo session
        await this.Request_WCDClearSession();

        // Get auth from Bravo
        await this.Request_WCDAuthen();

        //Get docNo
        if (orderId) {
            const order = await DB.Order.findOne({_id: orderId}).populate('customer');
            const orderDetails = await DB.OrderDetail.find({orderId: orderId}).populate('product');

            const result = await this.WCDGetPODocNo(order);
            let docNo = result.Table[0].Column1;
            await this.WCDCheckPODocNo(order, docNo);
            await this.WCDWritePO(order, docNo);
            const result_WCDWritePODetail = await this.WCDWritePODetail(order, orderDetails);
            if(result_WCDWritePODetail !== "Write Done"){
                await this.WCDConfirmWriteDoc(order, {
                    bizDocId: order.bizDocId,
                    docNo: order.docNo,
                    docStatus: "102"
                });
            }else{
                await this.WCDConfirmWriteDoc(order, {
                    bizDocId: order.bizDocId,
                    docNo: order.docNo,
                    docStatus: "101"
                });
            }

            return {
                docNo,
                bizDocId: order.bizDocId
            };
        } else {
            throw new Error("Please enter orderId!");
        }
    } catch (e) {
        throw e;
    }
}



exports.WCDWritePO = async (order, docNo) => {
    try {
        if (order) {
            if (!order.docNo) {
                const result = await this.Request_WCDWritePO({
                    docDate: moment().utc().add(2, 'hours').format("YYYY-MM-DD"),
                    docNo: docNo,
                    description: `${order.lastName} ${order.firstName} đã order đơn hàng ${order.orderCode} vào lúc ${moment(order.createdAt).format("HH:mm:ss dd-MM-YYYY")}.`,
                    customerCode: order.customer.memberId,
                    contactPerson: order.customer.phoneNumber,
                    address: `${order.ward.name}, ${order.district.name}, ${order.ward.name}`,
                    wcdCode: order.orderCode
                });

                // Save WCDWritePO Log
                const orderLog = {
                    orderId: order._id,
                    eventType: "wcdWritePO",
                    oldData: null,
                    newData: result,
                    description: "WCDWritePO"
                };
                await Service.OrderLog.create(orderLog);

                if (result.Table && result.Table[0].BizDocId) {
                    order.bizDocId = result.Table[0].BizDocId;
                    order.docNo = docNo;
                    await order.save();
                } else {
                    throw new Error(result);
                }

                return result;
            } else {
                throw new Error("Order has DocNo!");
            }
        } else {
            throw new Error("Order not found!");
        }
    } catch (e) {
        throw e;
    }
};


exports.WCDWritePODetail = async (order, orderDetails) => {
    try {
        if (order && !_.isEmpty(orderDetails)) {
            if (order.docNo) {
                let requestOrderDetails = [];
                let index = 0;
                for (const orderDetail of orderDetails) {
                    index++;
                    requestOrderDetails.push({
                        bizDocId: order.bizDocId,
                        builtinOrder: index,
                        customerCode: order.customer.memberId,
                        itemCode: orderDetail.product.sap,
                        unit: Enums.ProductEnums.ProductUnit.get(orderDetail.product.unitSalePrice).value,
                        estimatedTimeDelivery: order.expectedDeliveryDate ? moment(order.expectedDeliveryDate).format("YYYY-MM-DD") : "",
                        quantity: orderDetail.quantity,
                        unitCost: orderDetail.unitPrice,
                        amount: orderDetail.quantity * orderDetail.unitPrice
                    });
                }

                const result = await this.Request_WCDWritePODetail(requestOrderDetails);

                // Save WCDWritePO Log
                const orderLog = {
                    orderId: order._id,
                    eventType: "wcdWritePODetail",
                    oldData: null,
                    newData: result,
                    description: "WCDWritePODetail"
                };
                await Service.OrderLog.create(orderLog);

                return result;
            } else {
                throw new Error("DocNo of this order not found!");
            }

        } else {
            throw new Error("Order or order detail not found!");
        }
    } catch (e) {
        throw e;
    }
};


exports.WCDGetPODocNo = async (order) => {
    try {
        if (order) {
            if (!order.docNo) {
                const result = await this.Request_WCDGetPODocNo({
                    docDate: moment().format("YYYY-MM-DD"),
                    customerCode: order.customer.memberId,
                });

                // Save WCDGetPODocNo Log
                const orderLog = {
                    orderId: order._id,
                    eventType: "wcdGetPODocNo",
                    oldData: null,
                    newData: result,
                    description: "WCDGetPODocNo"
                };
                await Service.OrderLog.create(orderLog);

                if (result.Table && result.Table[0].Column1) {
                    return result;
                } else {
                    throw new Error(result);
                }
            } else {
                throw new Error("Order has DocNo!");
            }
        } else {
            throw new Error("Order not found!");
        }

    } catch (e) {
        throw e;
    }
};

exports.WCDCheckPODocNo = async (order, docNo) => {
    try {
        if (docNo) {
            const result = await this.Request_WCDCheckPODocNo({
                docNo
            });

            // Save WCDCheckPODocNo Log
            const orderLog = {
                orderId: order._id,
                eventType: "wcdCheckPODocNo",
                oldData: null,
                newData: result,
                description: "WCDCheckPODocNo"
            };
            await Service.OrderLog.create(orderLog);

            if (!_.isEmpty(result.Table)){
                if (result.Table[0].Column1 === 1) {
                    throw new Error("DocNo is existed!");
                }
            }
            else{
                throw new Error(result);
            }

            return result;
        } else {
            throw "DocNo of this order not found!";
        }
    } catch (e) {
        throw e;
    }
};


exports.WCDConfirmWriteDoc = async (order, options) => {
    try {
        if (order && options) {
            const result = await this.Request_WCDConfirmWriteDoc(options);

            // Save WCDCheckPODocNo Log
            const orderLog = {
                orderId: order._id,
                eventType: "wcdConfirmWriteDoc",
                oldData: null,
                newData: result,
                description: "WCDConfirmWriteDoc"
            };
            await Service.OrderLog.create(orderLog);

            return result;
        }
    } catch (e) {
        throw e;
    }
};

exports.WCDLoadPOinfo = async (params) => {
    if(params.bizDocId && params.docNo){
        const result = await this.Request_WCDLoadPOinfo(params);
        return result;
    }
    else{
        new Error("This order not sent infomation to bravo yet!");
    }
}

exports.WCDLoadPOinfoDetail = async (params) => {
    //Get docNo
    if(params.bizDocId && params.docNo){
        const result = await this.Request_WCDLoadPOinfoDetail(params);
        return result;
    }
    else{
        new Error("This order not sent infomation to bravo yet!");
    }
}
