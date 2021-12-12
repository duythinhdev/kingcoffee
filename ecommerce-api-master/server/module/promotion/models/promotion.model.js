const Schema = require('mongoose').Schema;

const schema = new Schema({
    promotionTypeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'PromotionType'
    },
    promotionForm: {
        type: String,
        enum: [
            // Khuyến mãi % đơn cho khách hàng mới.
            //type: order
            //condition: order
            'discountOrderForNewMember',

            // Tặng vật phẩm cho đơn khách hàng mới.
            //type: product
            //condition: order
            'giveSomeGiftForNewMember',

            // Khuyến mãi giỏ hàng.
            //type: product
            //condition: order
            'checkoutDiscount',

            //Khuyến mãi sản phẩm theo số lượng.
            //type: product
            //condition: orderDetail 
            'discountOrderFollowProductQuantity',

            //Giảm giá sản phẩm
            //type: product
            //type: orderDetail
            'productDiscount',

            //Khuyến mãi đơn mua sp ưu đãi
            //type: product
            //condition: orderDetail
            'buyGoodPriceProduct',

            //Khuyến mãi % đơn
            //type: order
            //condition: order
            'orderDiscount',

            // Khuyến mãi giỏ hàng tặng % hoặc tiền
            //type: order
            //condition: order
            'checkoutPercentOrMoneyDiscount',

            // Miễn phí giao hàng - freeship
            //type: order
            //condition: order
            'freeShip',

            // Tặng sp cho đơn
            //type: product
            //condition: order
            'giveGiftForOrder',

            // Khuyến mãi sản phẩm tặng sản phẩm
            //type: product
            //condition: orderDetail
            'bonusProducts',
        ],
        default: ''
    },
    code: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true
    },
    name: {
        type: String
    },
    content: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    //Lặp lại
    timeApplyConditionType: {
        type: String,
        enum: ['once', 'everyday']
    },
    timeApply: {
        //Thời điểm
        moments: {
            type: Array
        },
        //Khoảng thời gian bắt đầu
        momentStartDate: {
            type: String,
        },
        //Khoảng thời gian kết thúc
        momentEndDate: {
            type: String
        }
    },
    applyType: {
        type: String,
        enum: ['order', 'product'],
        default: ''
    },
    applyCondition: {
        type: String,
        enum: ['order', 'orderDetail'],
        default: ''
    },
    areaApply: [{
        id: {
            type: Number,
            default: 0
        },
        name: {
            type: String,
            default: ""
        }
    }],
    applyRole: [{
        role: {
            type: Number,
            default: 0,
        },
        roleName: {
            type: String,
            default: "",
        },
        level: {
            type: Number,
            default: 0
        }
    }],
    isRejectApplyMemberId: {
        type: Boolean,
        default: false
    },
    applyMemberId: [{
        memberId: {
            type: String,
            required: true
        },
        memberName: {
            type: String
        },
        phoneNumber: {
            type: String
        }
    }],
    // //Loại ngân sách
    // policyApplyType: {
    //   type: String,
    //   enum: ["unlimit", "limit"],
    //   default: "unlimit"
    // },
    // //Số xuất
    // maximumApplyNumber: {
    //   type: Number
    // },
    // //Số thứ tự
    // ordering:{
    //   type: Number
    // },
    // Khuyến mãi % đơn cho khách hàng mới.
    discountOrderForNewMember: {
        orderConditions: [{
            // Giá trị sau chiết khẩu.
            totalOrderPriceCondition: {
                type: Number
            },
            // Đơn hàng thứ bao nhiêu.
            orderNumber: {
                type: Number,
                default: 0
            },
            // Giá trị khuyến mãi.
            discountPercent: {
                type: Number,
                default: 0
            },
        }],
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
    },
    //Tặng vật phẩm cho đơn khách hàng mới.
    giveSomeGiftForNewMember: {
        orderConditions: [{
            // Giá trị sau chiết khẩu.
            totalOrderPriceCondition: {
                type: Number
            },
            // Đơn hàng thứ bao nhiêu.
            orderNumber: {
                type: Number,
                default: 0
            },
        }],
        //Loại hình tặng sản phẩm
        giveGiftType: {
            type: String,
            enum: ['and', 'or']
        },
        //Danh sách sản phẩm tặng
        gifts: [{
            // Sản phẩm tặng kèm.
            gift: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            //Số lượng tặng
            quantity: {
                type: Number
            }
        }],
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
    },
    //Khuyến mãi giỏ hàng tặng sản phẩm.
    checkoutDiscount: {
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number
            }
        }],
        // Số lượng đặt mua
        orderQuantity: {
            type: Number,
            default: 0
        },
        //Loại hình tặng sản phẩm
        giveGiftType: {
            type: String,
            enum: ['and', 'or']
        },
        //Danh sách sản phẩm tặng
        gifts: [{
            // Sản phẩm tặng kèm.
            gift: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            //Số lượng tặng
            quantity: {
                type: Number
            }
        }],
    },
    //Khuyến mãi sản phẩm theo số lượng.
    discountOrderFollowProductQuantity: {
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
        // Số lượng đặt mua
        orderQuantity: {
            type: Number,
            default: 0
        },
        // Phần trăm khuyến mãi
        discountPercent: {
            type: Number
        }
    },
    //Giảm giá sản phẩm
    productDiscount: [{
        //Sản phẩm khuyến mãi
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        //Phần trăm khuyến mãi
        discountPercent: {
            type: Number,
            default: 0
        }
    }],
    //Khuyến mãi đơn mua sp ưu đãi
    buyGoodPriceProduct: {
        // Giá trị sau chiết khẩu của đơn hàng.
        totalOrderPriceCondition: {
            type: Number
        },
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
        // Danh sách sản phẩm ưu đãi
        goodPriceProducts: [{
            //Sản phẩm khuyến mãi
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            //Phần trăm mua sản phẩm ưu đãi
            discountOnProductPercent: {
                type: Number,
                default: 0
            },
        }],
    },
    //Khuyến mãi % đơn hoặc tiền 
    orderDiscount: {
        // Giá trị sau chiết khẩu của đơn hàng.
        totalOrderPriceCondition: {
            type: Number
        },
        discountType: {
            type: String,
            enum: ["percent", "number"]
        },
        //Phần trăm hoặc tiền chiết khấu trên đơn hàng
        discountOrderValue: {
            type: Number,
            default: 0
        },
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
    },
    // Khuyến mãi giỏ hàng tặng % hoặc tiền
    checkoutPercentOrMoneyDiscount: {
        // Số lượng đặt mua
        orderQuantity: {
            type: Number,
            default: 0
        },
        discountType: {
            type: String,
            enum: ["percent", "number"]
        },
        //Phần trăm hoặc tiền chiết khấu trên đơn hàng
        discountOrderValue: {
            type: Number,
            default: 0
        },
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number
            }
        }],
    },
    // Miễn phí giao hàng - freeship
    freeShip: {
        // Giá trị sau chiết khẩu của đơn hàng.
        totalOrderPriceCondition: {
            type: Number,
            default: 0
        },
        // Giảm giá phí ship
        shippingPriceDiscount: {
            type: Number,
            default: 0
        },
        // Hình thức áp dụng
        applyType: {
            type: String,
            enum: ["currentOrder", "anotherOrder"]
        },
        // Thời gian mã code giảm giá ship có thể được áp dụng
        applyStartDate: {
            type: Date
        },
        applyEndDate: {
            type: Date
        },
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
        // Danh sách user đã sử dụng Free Ship với applyType = anotherOrder
        userApply: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            isUsed: {
                type: Boolean,
                default: false
            }
        }],
    },
    // Tặng sp cho đơn
    giveGiftForOrder: {
        // Giá trị sau chiết khẩu của đơn hàng.
        totalOrderPriceCondition: {
            type: Number,
            default: 0
        },
        // Loại điều kiện so sánh với tổng giá đơn hàng.
        totalOrderPriceConditionType: {
            type: String,
            enum: ['equal', 'greaterThenOrEqual', 'lessThenOrEqual'],
            default: 'greaterThenOrEqual'
        },
        hasProgressive: {
            type: Boolean,
            default: true
        },
        // Danh sách sản phẩm khuyến mãi.
        promotionProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
        // Loại hình tặng sản phẩm.
        giveGiftType: {
            type: String,
            enum: ['and', 'or']
        },
        // Danh sách sản phẩm tặng.
        gifts: [{
            // Sản phẩm tặng kèm.
            gift: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            // Số lượng tặng.
            quantity: {
                type: Number
            },
            // Số lượng sản phẩm tặng tối đa.
            maximumQuantity: {
                type: Number,
                default: 0
            }
        }],
        // Tổng quà tối đa có thể tặng
        maximumTotalGift: {
            type: Number,
            default: 0
        },
        // Tổng quà tối đa có thể tặng cho mỗi user
        maximumTotalGiftPerUser: {
            type: Number,
            default: 0
        },
        // Danh sách người dùng đã nhận quà.
        receivedGiftUser: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    },
    // Khuyến mãi sản phẩm tặng sản phẩm
    bonusProducts: {
        // Giá trị sau chiết khẩu của đơn hàng.
        totalOrderPriceCondition: {
            type: Number,
            default: 0
        },
        // Giá trị sau chiết khẩu của đơn hàng.
        totalOrderPriceCondition: {
            type: Number,
            default: 0
        },
        // Loại điều kiện so sánh với tổng giá đơn hàng.
        totalOrderPriceConditionType: {
            type: String,
            enum: ['equal', 'greaterThenOrEqual', 'lessThenOrEqual'],
            default: 'greaterThenOrEqual'
        },
        // Số lượng đặt mua
        orderQuantity: {
            type: Number,
            default: 0
        },
        // Số lượng sản phẩm tặng thêm
        bonusQuantity: {
            type: Number,
            default: 0
        },
        // Tổng quà tối đa có thể tặng
        maximumTotalGift: {
            type: Number,
            default: 0
        },
        // Tổng quà tối đa có thể tặng cho mỗi user
        maximumTotalGiftPerUser: {
            type: Number,
            default: 0
        },
        // Danh sách sản phẩm khuyến mãi
        promotionProducts: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            bonusProduct: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            }
        }],
    },
    status: {
        type: String,
        enum: ['new', 'running', 'finish', 'stop'],
        default: 'new'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    hubReceiveNoticeDate: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

schema.virtual('promotionType', {
    ref: 'PromotionType',
    localField: 'promotionTypeId',
    foreignField: '_id',
    justOne: true
});

schema.virtual('productDiscount.product', {
    ref: 'Product',
    localField: 'productDiscount.productId',
    foreignField: '_id',
    justOne: true
});

module.exports = schema;

//areaApply : { type : Array , "default" : [] }