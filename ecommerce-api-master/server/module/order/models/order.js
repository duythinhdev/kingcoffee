const Schema = require("mongoose").Schema;

const schema = new Schema(
  {
    userAgent: {
      type: String
    },
    userIP: {
      type: String
    },
    //customerId
    customerId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "User"
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "Transaction"
    },
    orderCode: {
      type: String,
      uppercase: true
    },
    totalProducts: {
      type: Number,
      default: 1
    },
    currency: {
      type: String,
      default: "VND",
      uppercase: true
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    percentDiscount: {
      type: Number,
      default: 0
    },
    totalDiscountPrice: {
      //priceUserDiscount
      type: Number,
      default: 0
    },
    shippingPrice: {
      type: Number,
      default: 0
    },
    transportation: {
      // đơn vị vận chuyển.
      type: String
    },
    transportationId: {
      // Id của đơn vị vận chuyển.
      type: Number
    },
    orderStatus: {
      type: String,
      index: true,
      default: "",
      enum: [
        "scanned",
        "ordered",
        "confirmed",
        "processing",
        "handedOver",
        "shipping",
        "successDelivered",
        "failDelivered",
        "failOrdered",
        "canceled"
      ]
    },
    isDeliveryReject: {
      type: Boolean,
      default: false
    },
    phoneNumber: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    fullName: {
      type: String
    },
    streetAddress: {
      type: String
    },
    city: {
      type: Object,
      id: {
        type: Number,
        default: 0
      },
      name: {
        type: String,
        default: ""
      }
    },
    ward: {
      type: Object,
      id: {
        type: Number,
        default: 0
      },
      name: {
        type: String,
        default: ""
      }
    },
    district: {
      type: Object,
      id: {
        type: Number,
        default: 0
      },
      name: {
        type: String,
        default: ""
      }
    },
    zipCode: {
      type: Number
    },
    shippingAddress: {
      type: String
    },
    // Thông tin hub or kho Center.
    senderId: {
      // fromHubId
      type: String
    },
    senderName: {
      type: String
    },
    senderPhone: {
      type: String
    },
    expectedDeliveryDate: {
      type: String
    },
    reasonCancel: {
      type: String
    },
    reasonReject: {
      type: String
    },
    isConfirmOrderHub: {
      type: Boolean,
      default: false
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
    bu:{
      type: String
    },
    couponCode: [
      {
        id:
        {
          type: String
        },
        code:{
          type: String
        }
      }
    ],
    orderNumber:{
      type: Number,
      default: 0
    },
    bizDocId: {
      type: String,
      unique: true
    },
    docNo: {
      type: String,
      unique: true
    },
    isAssignHub:{
      type: Boolean
    },
    createdAt: {
      type: Date
    },
    updatedAt: {
      type: Date
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

schema.virtual("details", {
  ref: "OrderDetail",
  localField: "_id",
  foreignField: "orderId",
  justOne: false // have many details here
});

schema.virtual("customer", {
  ref: "User",
  localField: "customerId",
  foreignField: "_id",
  justOne: true
});

schema.virtual("transaction", {
  ref: "Transaction",
  localField: "transactionId",
  foreignField: "_id",
  justOne: true
});

schema.virtual('category', {
  ref: 'Category',
  localField: 'objectId', 
  foreignField: '_id' 
});

schema.virtual('promotions.promotionOrder', {
  ref: 'Promotion',
  localField: 'promotions.promotion', 
  foreignField: '_id',
  justOne: true
});

module.exports = schema;

// totalTaxPrice: {
//   type: Number,
//   default: 0
// },
// site currency rem
// userCurrency: {
//   type: String,
//   default: 'VND',
//   uppercase: true
// },
// userTotalPrice: {
//   type: Number,
//   default: 0
// },
// currencyExchangeRate: {
//   type: Number,
//   default: 1
// },
// trackingCode: {
//   type: Array,
//   index: true
// },
// paymentMethod: {
//   type: String,
//   default: 'Ví GoldTime'
// },
// paymentStatus: {
//   type: String,
//   default: 'pending',
//   index: true,
//   enum: ['pending', 'progressing', 'shipping', 'completed', 'refunded', 'cancelled']
// },
// codVerifyCode: {
//   type: String,
//   index: true
// },
// codVerified: {
//   type: Boolean,
//   default: true
// },
