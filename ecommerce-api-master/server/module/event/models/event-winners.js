const Schema = require('mongoose').Schema;

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId
  },
  username: {
    type: String,
    trim: true,
    lowercase: true
  },
  code: {
    type: String
  },
  orderNumber: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: null
  },
  eventVoucherId: {
    type: Schema.Types.ObjectId,
  },
  shippingInfo: {
    type: Schema.Types.Mixed,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  restrict: true,
  minimize: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('eventVoucher', {
  ref: 'EventVoucher',
  localField: 'eventVoucherId',
  foreignField: '_id',
  justOne: true
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = schema;
