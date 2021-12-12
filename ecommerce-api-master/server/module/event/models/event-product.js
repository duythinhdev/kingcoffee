const Schema = require('mongoose').Schema;

const schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId
  },
  eventVoucherId: [{
    type: Schema.Types.ObjectId
  }],
  status: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
  expired:{
    type: Number
  }
}, {
  minimize: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

schema.virtual('eventVoucher', {
  ref: 'EventVoucher',
  localField: 'eventVoucherId',
  foreignField: '_id',
  justOne: false
});

schema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = schema;
