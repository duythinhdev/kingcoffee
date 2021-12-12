const moment = require('moment');
const _ = require('lodash');

const PAYMENT_TYPE_PRICE = process.env.PAYMENT_TYPE_PRICE || 1000000;

exports.checkCreate = (options) => {
    try {
        if (!options.freeShip) {
            throw new Error("freeShip must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        if(options.freeShip.applyType === Enums.PromotionEnums.FreeShipApplyType.CurrentOrder.value){
            if(options.freeShip.totalOrderPriceCondition >= parseInt(PAYMENT_TYPE_PRICE)){
                throw new Error(`totalOrderPriceCondition must be less than ${PAYMENT_TYPE_PRICE}!`);
            }

            if(options.freeShip.applyStartDate || options.freeShip.applyEndDate){
                throw new Error(`applyStartDate and applyEndDate must be empty!`);
            } 
        }

        if(options.freeShip.applyType === Enums.PromotionEnums.FreeShipApplyType.AnotherOrder.value){
            if(!options.freeShip.applyStartDate || !options.freeShip.applyEndDate){
                throw new Error(`applyStartDate and applyEndDate must not be empty!`);
            }
            else{
                options.freeShip.applyStartDate = new moment.utc(options.freeShip.applyStartDate, 'HH:mm DD-MM-YYYY');
                options.freeShip.applyEndDate = new moment.utc(options.freeShip.applyEndDate, 'HH:mm DD-MM-YYYY');
    
                if (options.freeShip.applyStartDate._d.getTime() > options.freeShip.applyEndDate._d.getTime()) {
                    throw new Error("applyStartDate must be little or equal than applyEndDate");
                }
            }
        }

        const listFreeShip = options.freeShip.promotionProducts;
        if (listFreeShip.length > 0) {
            if (options.existPromotionList.length > 0) {
                for (const promotion of options.existPromotionList) {
                    const existList = promotion.freeShip.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listFreeShip.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.checkUpdate = (options) => {
    try {
        if (!options.freeShip) {
            throw new Error("freeShip must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        if(options.freeShip.applyType === Enums.PromotionEnums.FreeShipApplyType.CurrentOrder.value){
            if(options.freeShip.totalOrderPriceCondition >= parseInt(PAYMENT_TYPE_PRICE)){
                throw new Error(`shippingPriceDiscount must be less than ${PAYMENT_TYPE_PRICE}!`);
            }

            if(options.freeShip.applyStartDate || options.freeShip.applyEndDate){
                throw new Error(`applyStartDate and applyEndDate must be empty!`);
            } 
        }

        if(options.freeShip.applyType === Enums.PromotionEnums.FreeShipApplyType.AnotherOrder.value){
            if(!options.freeShip.applyStartDate || !options.freeShip.applyEndDate){
                throw new Error(`applyStartDate and applyEndDate must not be empty!`);
            }
            else{
                options.freeShip.applyStartDate = new moment.utc(options.freeShip.applyStartDate, 'HH:mm DD-MM-YYYY');
                options.freeShip.applyEndDate = new moment.utc(options.freeShip.applyEndDate, 'HH:mm DD-MM-YYYY');
    
                if (options.freeShip.applyStartDate._d.getTime() > options.freeShip.applyEndDate._d.getTime()) {
                    throw new Error("applyStartDate must be little or equal than applyEndDate");
                }
            }
        }

        const listFreeShip = options.freeShip.promotionProducts;
        if (listFreeShip.length > 0) {
            if (options.existPromotionList.length > 0) {
                for (const promotion of options.existPromotionList) {
                    const existList = promotion.freeShip.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listFreeShip.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.freeShip = options.freeShip;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, user) => {
    try{

        // Check a product of order details have absent in product list of promotion
        let enoughProduct_FreeShip = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0) {
            const absentProduct = truePromotion.freeShip.promotionProducts.find(x => x._id.toString() === item.productId.toString());

            if (!absentProduct) {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
              enoughProduct_FreeShip = false;
              break;
            }
          }
        }

        if (options.order.totalPrice >= truePromotion.freeShip.totalOrderPriceCondition && enoughProduct_FreeShip) {
            if (truePromotion.freeShip.applyType === Enums.PromotionEnums.FreeShipApplyType.CurrentOrder.value) {
                promotionInfo.discountPrice = options.order.shippingPrice - truePromotion.freeShip.shippingPriceDiscount > 0  ? truePromotion.freeShip.shippingPriceDiscount : options.order.shippingPrice;
                options.order.shippingPrice = options.order.shippingPrice - truePromotion.freeShip.shippingPriceDiscount > 0  ? options.order.shippingPrice - truePromotion.freeShip.shippingPriceDiscount : 0;
            }else if(truePromotion.freeShip.applyType === Enums.PromotionEnums.FreeShipApplyType.AnotherOrder.value){
                if(!truePromotion.freeShip.userApply){
                    truePromotion.freeShip.userApply = [];
                }

                // Push user have discount voucher
                if(_.isEmpty(truePromotion.freeShip.userApply) 
                || (!_.isEmpty(truePromotion.freeShip.userApply) && !truePromotion.freeShip.userApply.find(x => x.user === user._id))){
                    truePromotion.freeShip.userApply.push({
                        user: user._id,
                        isUsed: false
                    });
                    
                    await DB.Promotion.findOneAndUpdate({_id: truePromotion._id}, 
                    {
                        "freeShip.userApply": truePromotion.freeShip.userApply
                    });
                }
            }
        }else{
            _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
            });
        }
    }
    catch(e){
        throw e;
    }
}

exports.applyFreeShipCode = async (order, shippingFeeDiscountCode, user) => {
    try{
        if(!user){
            throw new Error("User not found!");
        }

        if(shippingFeeDiscountCode){
            const promotion = await this.checkCodePromotionFreeShip(shippingFeeDiscountCode, user);
            if(promotion){
                order.promotions.push({
                    promotion: promotion._id,
                    discountPrice: order.shippingPrice - promotion.freeShip.shippingPriceDiscount > 0  ? promotion.freeShip.shippingPriceDiscount : order.shippingPrice
                });
                order.shippingPrice = order.shippingPrice - promotion.freeShip.shippingPriceDiscount > 0  ? order.shippingPrice - promotion.freeShip.shippingPriceDiscount : 0;
            }
            return order;
        }else{
            throw new Error("shippingFeeDiscountCode not found!");
        }
        
    }catch(e){
        throw e;
    }
}

exports.checkCodePromotionFreeShip = async (codeFreeShip, user) => {
    try{  
      if(codeFreeShip){
        const promotionFreeShip = await DB.Promotion.findOne(
          {
            code: codeFreeShip,
            // $and: [
            //   {freeShip: {$elemMatch: {applyType: Enums.PromotionEnums.FreeShipApplyType.AnotherOrder.value}}}
            // ]
            // freeShip:  {$elemMatch: {applyType: "anotherOrder"}}
            "freeShip.applyType": Enums.PromotionEnums.FreeShipApplyType.AnotherOrder.value
          });
        if(promotionFreeShip){
          const now = moment.now();
          const freeShip = promotionFreeShip.freeShip;
          if (freeShip.applyStartDate >= now || now >= freeShip.applyEndDate) {
            throw new Error("This free ship expires!");
          }
          var userApply = freeShip.userApply.find(x => x.user.toString() === user._id.toString())
          if(userApply){
            if(userApply.isUsed){
              throw new Error("This free ship used!");
            }
          }else{
            throw new Error("This free ship not for you!");           
          }
          return promotionFreeShip;
        } else {
          throw new Error("This free ship not found!");
        }
      } else {
        throw new Error("This code free ship not found!");
      }
    } catch (e) {
        throw (e);
    }
  }