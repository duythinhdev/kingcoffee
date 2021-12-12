const Enum = require('enum');

exports.ApplyType = new Enum({ // Loại áp dụng
    "Order" : "order", // Đơn hàng.
    "Product" : "product", // Sản phẩm.
});

//Loại áp dụng cho order
exports.ApplyCondition = new Enum({ 
    // Đơn hàng.
    "Order" : "order",
    // Chi tiết đơn hàng
    "OrderDetail" : "orderDetail",
});

exports.PromotionForm = new Enum({
    "DiscountOrderForNewMember" : "discountOrderForNewMember", // Khuyến mãi % đơn cho khách hàng mới
    "GiveSomeGiftForNewMember" : "giveSomeGiftForNewMember", // Tặng vật phẩm cho đơn khách hàng mới.
    "CheckoutDiscount" : "checkoutDiscount", // Khuyến mãi giỏ hàng.
    "DiscountOrderFollowProductQuantity" : "discountOrderFollowProductQuantity", // Khuyến mãi sản phẩm theo số lượng.
    "ProductDiscount" : "productDiscount", //Giảm giá sản phẩm
    "BuyGoodPriceProduct" : "buyGoodPriceProduct", // Khuyến mãi đơn mua sp ưu đãi
    "OrderDiscount" : "orderDiscount", //Khuyến mãi % đơn
    "CheckoutPercentOrMoneyDiscount": "checkoutPercentOrMoneyDiscount", // Khuyến mãi giỏ hàng tặng % hoặc tiền
    "FreeShip" : "freeShip",      //Miễn phí vận chuyển
    "GiveGiftForOrder" : "giveGiftForOrder",      //Tặng sản phẩm cho đơn
    "BonusProducts": "bonusProducts" // Khuyến mãi sản phẩm tặng sản phẩm
});

exports.PromotionTypeStatus = new Enum({
    "New": "new", //Mới tạo
    "Running": "running", //Đang hoạt động
    "Finish": "finish", //Hết hạn
    "Stop": "stop" //Dừng hoạt động
});

exports.PromotionStatus = new Enum({
    "New": "new", //Mới tạo
    "Running": "running", //Đang hoạt động
    "Finish": "finish", //Hết hạn
    "Stop": "stop" //Dừng hoạt động
});


exports.PolicyApplyType = new Enum({
    //Phân bổ không giới hạn
    "Unlimit": "unlimit",
    //Áp suất phân bổ
    "Limit": "limit"
});

exports.TimeApplyConditionType = new Enum({
    //Một lần
    "Once": "once",
    //Mỗi ngày
    "Everyday": "everyday"
});

exports.GiveGiftType = new Enum({
    //Tặng hết
    "And": "and",
    //Chọn một trong các phần quà
    "Or": "or"
});

exports.DiscountType = new Enum({
    //Giảm giá %
    "Percent": "percent",
    //Giảm giá bằng tiền
    "Number": "number"
});

exports.FreeShipApplyType = new Enum({
    // Tại đơn
    "CurrentOrder": "currentOrder",
    // Áp dụng cho đơn bất kỳ tính từ đơn kế tiếp
    "AnotherOrder": "anotherOrder"
})