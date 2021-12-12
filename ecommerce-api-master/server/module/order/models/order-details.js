const Schema = require('mongoose').Schema;

const schema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'Order'
  },
  shopId: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'Shop'
  },
  productId: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'Product'
  },
  // productVariantId: {
  //   type: Schema.Types.ObjectId,
  //   index: true,
  //   ref: 'ProductVariant'
  // },
  quantity: {
    type: Number,
    default: 1
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  userNote: {
    type: String
  },
  shopNote: {
    type: String
  },
  promotions: [
    {
      discountPercent: 
      {
        type: Number,
        default: 0
      },
      discountPrice:{
        type: Number,
        default: 0
      },
      promotion:{
        type: Schema.Types.ObjectId,
        ref: "Promotion"
      }
    }
  ],
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
  }
});

schema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('shop', {
  ref: 'Shop',
  localField: 'shopId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('promotions.promotionOrder', {
  ref: 'Promotion',
  localField: 'promotions.promotion', 
  foreignField: '_id' ,
  justOne: true
});

module.exports = schema;


  // site currency
  // currency: {
  //   type: String,
  //   default: 'VND',
  //   uppercase: true
  // },
  // productPrice: {
  //   type: Number,
  //   default: 0
  // },

  // currencyExchangeRate: {
  //   type: Number,
  //   default: 1
  // },
  // price in the user side include tax, shipping price
  // userTotalPrice: {
  //   type: Number,
  //   default: 0
  // },
  // userCurrency: {
  //   type: String,
  //   default: 'VND',
  //   uppercase: true
  // },
  // productDetails: {
  //   type: Schema.Types.Mixed
  // },
  // variantDetails: {
  //   type: Schema.Types.Mixed
  // },
  // status: {
  //   type: String,
  //   index: true,
  //   default: 'pending',
  //   enum: ['pending', 'progressing', 'shipping', 'completed', 'refunded', 'cancelled']
  // },

  // trackingCode: {
  //   type: String,
  //   index: true
  // },
  // shippingPrice: {
  //   type: Number,
  //   default: 0
  // },
  // userShippingPrice: {
  //   type: Number,
  //   default: 0
  // },
  // shippingMethod: {
  //   type: String
  // },
  // shippingAddress: {
  //   type: String
  // },
  // shippingCode: {
  //   type: String
  // },
  // taxClass: {
  //   type: String
  // },
  // taxPercentage: {
  //   type: Number,
  //   default: 0
  // },
  // taxPrice: {
  //   type: Number,
  //   default: 0
  // },
  // userTaxPrice: {
  //   type: Number,
  //   default: 0
  // },
  // customer information
  // email: {
  //   type: String,
  //   lowercase: true
  // },
  // phoneNumber: {
  //   type: String
  // },
  // firstName: {
  //   type: String
  // },
  // lastName: {
  //   type: String
  // },
  // name: {
  //   type: String
  // },
  // streetAddress: {
  //   type: String
  // },
  // city: {
  //   type: String
  // },
  // district: {
  //   type: String
  // },
  // ward: {
  //   type: String
  // },
  // zipCode: {
  //   type: String
  // },
  // paymentMethod: {
  //   type: String,
  //   default: 'Ví GoldTime'
  // },
  // paymentStatus: {
  //   type: String,
  //   default: 'pending',
  //   index: true
  // },
  // transactionId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Transaction'
  // },
  // commissionRate: {
  //   type: Number,
  //   default: 0
  // },
  // site commission
  // commission: {
  //   type: Number,
  //   default: 0
  // },
  // priceReceiverAdmin: {
  //   type: Number,
  //   default: 0
  // },
  // priceUserDiscount: {
  //   type: Number,
  //   default: 0
  // },
  // balance: {
  //   type: Number,
  //   default: 0
  // },
  // userAgent: {
  //   type: String
  // },
  // userIP: {
  //   type: String
  // },
  // couponName: {
  //   type: String
  // },
  // couponCode: {
  //   type: String
  // },
  // discountPercentage: {
  //   type: Number
  // },
  // completePayout: {
  //   type: Boolean,
  //   default: false
  // },
  // markPayoutRequest: {
  //   type: Boolean,
  //   default: false
  // },
  // payoutRequestId: {
  //   type: Schema.Types.ObjectId
  // },
  // ticketCode: {
  //   type: String,
  //   default: ''
  // },
  // AFFLink: {
  //   type: String,
  //   default: ''
  // },
