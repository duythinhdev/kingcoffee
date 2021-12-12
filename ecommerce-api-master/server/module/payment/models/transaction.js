const Schema = require('mongoose').Schema;

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    // order, featured_shop, etc...
    enum: ['order'],
    default: 'order'
  },
  typeId: { // itemId
    type: Schema.Types.ObjectId,
    index: true
  },
  status: {
    type: String,
    index: true,
    enum: ['pending', 'cancelled', 'success', 'fail'],
    default: 'pending'
  },
  totalPrice: {
    type: Number
  },
  shippingPrice: {
    type: Number
  },
  description: {
    type: String
  },
  currency: {
    type: String,
    default: 'VND',
    uppercase: true
  },
  products: {
    type: Array,
    default: []
  },
  // TODO - add more information
  paymentGateway: {
    type: String, // payment gateway
    enum: ['momo', 'cod', 'viTni', 'vnpay', 'zalopay']
  },
  paymentResponse: {
    type: Schema.Types.Mixed
  },
  paymentId: {
    type: String,
    unique: true,
    index: true
  },
  // for paypal...
  paymentToken: {
    type: String,
    index: true
  },
  // it is agreement id of paypal of subscription id of ccbill
  paymentAgreementId: {
    type: String
  },
  histories: {
    // history for each webhook call
    type: Array,
    default: []
  },
  // meta: {
  //   type: Schema.Types.Mixed
  // },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
}, {
  restrict: true,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = schema;
